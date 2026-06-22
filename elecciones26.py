import asyncio
import datetime
import json
import math
import os
import httpx
import numpy as np
import pandas as pd
import sys
from tabulate import tabulate
from tqdm.asyncio import tqdm

# Asegurar soporte UTF-8 para acentos en consola
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# ===== Despliegue remoto =====
# Endpoint PHP que recibe los snapshots. El token debe coincidir con el
# hardcodeado en `upload.php`. Deja UPLOAD_URL vacío para omitir la subida
# (útil al correr local sin desplegar).
UPLOAD_URL   = "https://padillaprado.me/segundavuelta2026/snapshots/upload.php"
UPLOAD_TOKEN = "FUJIMORINUNCAMAS"

# Constantes
BASE_URL = "https://resultadosegundavuelta.onpe.gob.pe/presentacion-backend"
ID_ELECCION = "10"

# Headers avanzados para mimetizar un navegador Chrome real y evitar bloqueos WAF (CloudFront)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "es-US,es-419;q=0.9,es;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Content-Type": "application/json",
    "Referer": "https://resultadosegundavuelta.onpe.gob.pe/main/presidenciales",
    "Sec-Ch-Ua": '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Priority": "u=1, i",
}

# Concurrencia: el WAF castiga el patrón "muchos requests durante mucho tiempo
# desde la misma IP" más que el pico de RPS. Subimos para llegar más lejos
# antes del primer bloqueo (~50%) y terminar en ~2 tandas en vez de muchas;
# el resume+cooldown se encarga de absorber el corte.
MAX_CONCURRENT_REQUESTS = 26
REQUEST_JITTER_MAX = 0.05

# Ventana de detección de bloqueo: si los últimos N requests devolvieron HTML
# del WAF, asumimos bloqueo y dormimos antes de seguir golpeando la IP.
WAF_BLOCK_WINDOW = 20
WAF_BLOCK_THRESHOLD = 15        # ≥15 de los últimos 20 → bloqueado
WAF_BLOCK_COOLDOWN_SEC = 65     # pausa al detectar bloqueo

# Resume: archivo donde persistimos los unit_key ya procesados con éxito.
# Si el WAF nos corta a mitad de recorrido, la siguiente corrida salta lo hecho.
PROGRESS_FILE = "progress_units.json"
semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

# Archivos de caché — independientes para poder reutilizarlos entre rondas:
#
#   cache_jerarquia.json  — estructura geográfica (nombres, ubigeos).
#                           Eliminar si ONPE cambia la jerarquía entre rondas.
#
#   cache_padron.json     — electores_hábiles por ubigeo.
#                           El padrón NO cambia entre primera y segunda vuelta;
#                           se puede conservar y reutilizar directamente.
#                           La clave de matching es (scope_id, dep/prov/dist ubigeo).
#
# Para forzar actualización de cualquiera: eliminar el archivo correspondiente.
CACHE_JERARQUIA_FILE = "cache_jerarquia.json"
CACHE_PADRON_FILE    = "cache_padron.json"

# Snapshots: cada ejecución exitosa genera un JSON inmutable consumible por el
# dashboard web. El índice se regenera por escaneo del directorio (permite
# añadir/eliminar archivos manualmente sin romper el índice).
SNAPSHOTS_DIR  = "snapshots"
SCHEMA_VERSION = 1
# Ronda electoral: 1 = primera vuelta, 2 = segunda. Cambiar manualmente al
# iniciar la segunda vuelta. Se embebe en cada snapshot para que el dashboard
# distinga rondas sin adivinar por fecha.
RONDA = 2

# Umbral mínimo de actas contabilizadas para incluir una unidad en la proyección.
MIN_PCT_PROYECCION = 7.0

# ── Prior R1 → R2 ────────────────────────────────────────────────────────────
# Cache de resultados de primera vuelta por distrito (generado por scrape_r1.py).
# Si existe, lo usamos como prior bayesiano: para distritos sin datos R2 o por
# debajo del umbral, su comportamiento esperado en R2 se infiere a partir de
# cómo votó en R1 (en vez de caer al promedio nacional peruano).
R1_CACHE_FILE = "cache_resultados_r1.json"

# Matriz de transferencia R1 → R2 desde encuesta. P(R2=X | voto R1=grupo).
TRANSFER_R1_TO_R2 = {
    "KEIKO":         {"K": 0.94, "R": 0.04},
    "LOPEZ_ALIAGA":  {"K": 0.64, "R": 0.14},
    "ALVAREZ":       {"K": 0.48, "R": 0.29},
    "NIETO":         {"K": 0.33, "R": 0.32},
    "BELMONT":       {"K": 0.11, "R": 0.61},
    "LOPEZ_CHAU":    {"K": 0.09, "R": 0.66},
    "ROBERTO":       {"K": 0.02, "R": 0.95},
    "OTROS":         {"K": 0.30, "R": 0.32},
    "BLANCO_NULO":   {"K": 0.17, "R": 0.17},
}

# Substrings (uppercase) que identifican el grupo de la matriz a partir del
# `nombreCandidato` de R1. El resto cae a "OTROS".
R1_CANDIDATE_GROUPS = [
    ("LOPEZ ALIAGA",        "LOPEZ_ALIAGA"),
    ("LÓPEZ ALIAGA",        "LOPEZ_ALIAGA"),
    ("KEIKO",               "KEIKO"),
    ("CARLOS GONSALO ALVAREZ", "ALVAREZ"),
    ("ALVAREZ LOAYZA",      "ALVAREZ"),
    ("JORGE NIETO",         "NIETO"),
    ("BELMONT",             "BELMONT"),
    ("LOPEZ CHAU",          "LOPEZ_CHAU"),
    ("LÓPEZ CHAU",          "LOPEZ_CHAU"),
    ("ROBERTO HELBERT SANCHEZ", "ROBERTO"),
    ("SANCHEZ PALOMINO",    "ROBERTO"),
]

# Ajuste central del turnout R2 respecto a R1 (opción B). 1.0 = sin ajuste.
# La incertidumbre adicional se modela vía sigma del bloque, no aquí.
TURNOUT_R2_OVER_R1 = 1.0

# ── Modelo Bayesiano Jerárquico (Power Priors + Monte Carlo) ─────────────────
# Reemplaza el cascade frecuentista + parches por un modelo estadísticamente
# limpio: Beta-Binomial por distrito con prior R1 descontado (power priors),
# random effects jerárquicos (nacional/regional) para correlación, y Monte
# Carlo para todos los outputs (proyección, margen, p_invert).
PRIOR_DISCOUNT_A0     = 0.5    # a₀: fracción de R1 que se trata como evidencia
PRIOR_STRENGTH_CAP    = 300    # cap derivado del error de la matriz (~3pp → n≈278)
SIGMA_MATRIX_TRANSFER = 0.03   # 3pp: error muestral de la encuesta de transferencia
MC_ITERATIONS         = 5000   # Sampleos de Monte Carlo


def _match_r1_grupo(nombre_candidato: str) -> str:
    """Devuelve el grupo de la matriz de transferencia para un candidato R1."""
    n = (nombre_candidato or "").upper()
    for needle, grupo in R1_CANDIDATE_GROUPS:
        if needle in n:
            return grupo
    return "OTROS"


def _load_r1_priors() -> dict:
    """Carga el cache de R1 y construye un dict por distrito con:
        votos_K_esperados, votos_R_esperados, prior_share_K, turnout_R1.
    Devuelve {} si el cache no existe — el modelo entonces sigue como antes.
    """
    if not os.path.exists(R1_CACHE_FILE):
        return {}
    try:
        with open(R1_CACHE_FILE, encoding="utf-8") as f:
            payload = json.load(f)
    except Exception:
        return {}

    priors = {}
    for key, d in (payload.get("distritos") or {}).items():
        # Indexamos por (ambito, region_cont, prov_pais, dist_ciudad) que son
        # las mismas claves que usa `meta` en analyze_and_report.
        amb  = d.get("ambito")
        reg  = d.get("region_cont")
        prov = d.get("prov_pais")
        dist = d.get("dist_ciudad")
        if not (amb and reg and prov and dist):
            continue

        K_total, R_total = 0.0, 0.0
        for nombre_r1, info in (d.get("candidatos") or {}).items():
            votos = float(info.get("votos") or 0)
            if votos <= 0:
                continue
            grupo = _match_r1_grupo(nombre_r1)
            probs = TRANSFER_R1_TO_R2[grupo]
            K_total += votos * probs["K"]
            R_total += votos * probs["R"]
        bn = float(d.get("votos_blancos") or 0) + float(d.get("votos_nulos") or 0)
        if bn > 0:
            probs_bn = TRANSFER_R1_TO_R2["BLANCO_NULO"]
            K_total += bn * probs_bn["K"]
            R_total += bn * probs_bn["R"]

        prior_K = (K_total / (K_total + R_total)) if (K_total + R_total) > 0 else None

        priors[(amb, reg, prov, dist)] = {
            "votos_K_esperados": K_total,
            "votos_R_esperados": R_total,
            "prior_share_K":     prior_K,
            "total_emitidos_R1": float(d.get("total_emitidos") or 0),
        }
    return priors


class ONPEScraper:
    def __init__(self):
        self.all_data = []
        self.failed_units = []
        self.seen_units = set()
        # Ventana deslizante de últimos resultados (True = HTML/bloqueo).
        # Si superamos WAF_BLOCK_THRESHOLD dentro de WAF_BLOCK_WINDOW, pausamos.
        from collections import deque
        self._block_window = deque(maxlen=WAF_BLOCK_WINDOW)
        self._cooldown_lock = asyncio.Lock()
        # Set de unit_keys ya procesadas con éxito en corridas anteriores
        # (se persiste a PROGRESS_FILE). En la siguiente corrida se omiten.
        self.completed_units = set()
        # Muestras del Monte Carlo bayesiano (poblado en analyze_and_report).
        # Se usan para `_prob_orden_final` exacto en vez de aprox. normal.
        self._mc_samples_K = None
        self._mc_samples_R = None
        # {(scope_id, dep_ubigeo, prov_ubigeo, dist_ubigeo): electores_habiles}
        # Poblado desde caché en disco o desde la API en la primera ejecución.
        self.padron_cache = {}
        # % actasContabilizadas a nivel nacional tal como lo publica ONPE
        # (endpoint agregado). Es el número oficial "headline"; distinto del
        # pct_pond_global que nosotros calculamos ponderando por tamaño final.
        self.actas_onpe_nacional = None
        # Habilitar HTTP/2 para mimetizar mejor el tráfico del navegador
        self.client = httpx.AsyncClient(
            headers=HEADERS,
            timeout=20.0,
            follow_redirects=True,
            http2=True,
            verify=False # A veces necesario si hay proxies/WAFs intermedios
        )

    # ── Caché — jerarquía (cache_jerarquia.json) ─────────────────────────────

    def _load_jerarquia(self):
        """Carga la jerarquía geográfica desde disco.
        Devuelve lista de tareas o None si el archivo no existe/es inválido."""
        if not os.path.exists(CACHE_JERARQUIA_FILE):
            return None
        try:
            with open(CACHE_JERARQUIA_FILE, encoding='utf-8') as f:
                data = json.load(f)
            units = data.get("units", [])
            if not units:
                return None
            tasks = [{
                "scope_id":    u["scope_id"],
                "dep_name":    u["dep_name"],
                "prov_name":   u["prov_name"],
                "dist_name":   u["dist_name"],
                "dep_ubigeo":  u["dep_ubigeo"],
                "prov_ubigeo": u["prov_ubigeo"],
                "dist_ubigeo": u["dist_ubigeo"],
            } for u in units]
            ts = data.get("timestamp", "fecha desconocida")
            print(f"[J] Jerarquía cargada: {len(tasks):,} unidades · {ts}")
            return tasks
        except Exception as e:
            print(f"[!] cache_jerarquia ilegible ({e}) — redescubriendo...")
            return None

    def _save_jerarquia(self, tasks):
        """Guarda la jerarquía geográfica a disco (sin padrón)."""
        units = [{
            "scope_id":    t["scope_id"],
            "dep_name":    t["dep_name"],
            "prov_name":   t["prov_name"],
            "dist_name":   t["dist_name"],
            "dep_ubigeo":  t["dep_ubigeo"],
            "prov_ubigeo": t["prov_ubigeo"],
            "dist_ubigeo": t["dist_ubigeo"],
        } for t in tasks]
        with open(CACHE_JERARQUIA_FILE, "w", encoding='utf-8') as f:
            json.dump(
                {"timestamp":   datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                 "description": "Jerarquía geográfica. Eliminar para redescubrir en la API.",
                 "units":       units},
                f, ensure_ascii=False, indent=2
            )
        print(f"  [J] Jerarquía guardada → '{CACHE_JERARQUIA_FILE}' ({len(units):,} unidades).")

    # ── Caché — padrón (cache_padron.json) ───────────────────────────────────
    # El padrón NO cambia entre primera y segunda vuelta.
    # La clave de matching es (scope_id, dep_ubigeo, prov_ubigeo, dist_ubigeo):
    # identifica unívocamente a cada mesa electoral independientemente de
    # qué elección se esté contando.

    def _load_padron(self):
        """Carga electores_habiles desde disco a self.padron_cache.
        Devuelve True si se cargó correctamente, False si no existe/es inválido."""
        if not os.path.exists(CACHE_PADRON_FILE):
            return False
        try:
            with open(CACHE_PADRON_FILE, encoding='utf-8') as f:
                data = json.load(f)
            registros = data.get("padron", [])
            if not registros:
                return False
            for r in registros:
                key = (r["scope_id"], r["dep_ubigeo"], r["prov_ubigeo"], r["dist_ubigeo"])
                self.padron_cache[key] = r.get("electores_habiles", 0)
            ts = data.get("timestamp", "fecha desconocida")
            print(f"[P] Padrón cargado: {len(registros):,} unidades · {ts}")
            return True
        except Exception as e:
            print(f"[!] cache_padron ilegible ({e}) — refetcheando padrón...")
            self.padron_cache = {}
            return False

    def _save_padron(self):
        """Guarda self.padron_cache a disco. Reutilizable en segunda vuelta."""
        registros = [
            {"scope_id":         k[0],
             "dep_ubigeo":       k[1],
             "prov_ubigeo":      k[2],
             "dist_ubigeo":      k[3],
             "electores_habiles": v}
            for k, v in self.padron_cache.items()
        ]
        with open(CACHE_PADRON_FILE, "w", encoding='utf-8') as f:
            json.dump(
                {"timestamp":   datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                 "description": (
                     "Padrón de electores hábiles por unidad geográfica. "
                     "Reutilizable entre primera y segunda vuelta: "
                     "el padrón no cambia entre rondas. "
                     "Clave de matching: scope_id + dep/prov/dist ubigeo."
                 ),
                 "padron": registros},
                f, ensure_ascii=False, indent=2
            )
        print(f"  [P] Padrón guardado → '{CACHE_PADRON_FILE}' ({len(registros):,} unidades).")

    async def _fetch_padron_unit(self, scope_id, dep_ubigeo, prov_ubigeo, dist_ubigeo):
        """Obtiene electores_habiles para una unidad y lo almacena en padron_cache."""
        url = (
            f"{BASE_URL}/participacion-ciudadana/totales"
            f"?idAmbitoGeografico={scope_id}&tipoFiltro=ubigeo_nivel_03"
            f"&ubigeoNivel01={dep_ubigeo}&ubigeoNivel02={prov_ubigeo}&ubigeoNivel03={dist_ubigeo}"
        )
        res = await self.fetch_json(url)
        habiles = 0
        if res and isinstance(res, dict) and res.get("success"):
            raw = (res.get("data") or {}).get("totalElectoresHabiles")
            # La API a veces devuelve None (no 0 ni ausente). Guardamos 0 — la
            # siguiente corrida intentará repoblar este distrito.
            if raw is not None:
                try:
                    habiles = int(raw)
                except (TypeError, ValueError):
                    habiles = 0
        self.padron_cache[(scope_id, dep_ubigeo, prov_ubigeo, dist_ubigeo)] = habiles

    async def fetch_totales_nacional(self):
        """actasContabilizadas a nivel elección completa (Perú + extranjero),
        tal como aparece en la UI oficial de ONPE. Se usa SOLO para etiquetar
        los snapshots en el selector del dashboard — no afecta ningún cálculo
        estadístico propio."""
        url = (
            f"{BASE_URL}/resumen-general/totales"
            f"?idEleccion={ID_ELECCION}&tipoFiltro=eleccion"
        )
        res = await self.fetch_json(url)
        if res and isinstance(res, dict) and res.get("success"):
            try:
                return float(res["data"].get("actasContabilizadas", 0))
            except (TypeError, ValueError):
                return None
        return None

    async def _maybe_cooldown(self):
        """Si la ventana indica bloqueo, pausa una sola vez (lock evita
        múltiples coroutinas durmiéndose en cascada)."""
        if len(self._block_window) < WAF_BLOCK_WINDOW:
            return
        if sum(self._block_window) < WAF_BLOCK_THRESHOLD:
            return
        if self._cooldown_lock.locked():
            # Otra coroutina ya está manejando el cooldown — esperar a que termine.
            async with self._cooldown_lock:
                return
        async with self._cooldown_lock:
            # Re-chequear bajo el lock; pudo haberse despejado mientras esperábamos.
            if sum(self._block_window) >= WAF_BLOCK_THRESHOLD:
                print(f"\n[!] WAF parece estar bloqueando ({sum(self._block_window)}/{WAF_BLOCK_WINDOW} HTML en ventana). "
                      f"Pausando {WAF_BLOCK_COOLDOWN_SEC}s antes de continuar...")
                await asyncio.sleep(WAF_BLOCK_COOLDOWN_SEC)
                self._block_window.clear()

    async def fetch_json(self, url):
        import random
        async with semaphore:
            await self._maybe_cooldown()
            # Jitter inicial para des-sincronizar las requests bajo el semáforo.
            if REQUEST_JITTER_MAX > 0:
                await asyncio.sleep(random.uniform(0, REQUEST_JITTER_MAX))
            for attempt in range(4):
                try:
                    response = await self.client.get(url)
                    response.raise_for_status()

                    # Detectar si el servidor devolvió HTML (redirigido por WAF) en lugar de JSON
                    content_type = response.headers.get('Content-Type', '').lower()
                    if 'html' in content_type or response.text.strip().startswith('<!doctype'):
                        self._block_window.append(1)
                        if attempt < 3:
                            await asyncio.sleep(3 * (attempt + 1) + random.uniform(0, 1.5))
                            continue
                        return None

                    self._block_window.append(0)
                    return response.json()
                except Exception:
                    if attempt < 3:
                        await asyncio.sleep(2 * (attempt + 1) + random.uniform(0, 1.0))
                    else:
                        return None
            return None

    async def warmup(self):
        """Antes de la batería de XHR, simulamos la navegación: pedir la página
        principal y un par de endpoints "ambient" para asentar cookies CloudFront
        (_ga, etc) y construir reputación de sesión legítima.

        Además aprovechamos para capturar el `actasContabilizadas` oficial de
        ONPE aquí — al inicio, cuando no hay riesgo de bloqueo — y guardarlo
        como respaldo por si la captura al final de la corrida falla.
        """
        try:
            await self.client.get("https://resultadosegundavuelta.onpe.gob.pe/main/presidenciales")
            await asyncio.sleep(0.3)
        except Exception:
            pass
        # Captura temprana de actasContabilizadas — no atraviesa el semáforo
        # porque queremos asegurarla antes de cualquier presión sobre el WAF.
        try:
            r = await self.client.get(
                f"{BASE_URL}/resumen-general/totales?idEleccion={ID_ELECCION}&tipoFiltro=eleccion"
            )
            if 'json' in r.headers.get('Content-Type','').lower():
                data = r.json()
                if data.get("success"):
                    self.actas_onpe_nacional = float(data["data"].get("actasContabilizadas", 0))
        except Exception:
            pass

    # ── Resume — progreso entre corridas (PROGRESS_FILE) ─────────────────────

    def _load_progress(self):
        if not os.path.exists(PROGRESS_FILE):
            return
        try:
            with open(PROGRESS_FILE, encoding='utf-8') as f:
                data = json.load(f)
            self.completed_units = {tuple(k) for k in data.get("completed", [])}
            print(f"[R] Resume: {len(self.completed_units):,} unidades completadas en corridas previas.")
        except Exception:
            self.completed_units = set()

    def _save_progress(self):
        try:
            with open(PROGRESS_FILE, "w", encoding='utf-8') as f:
                json.dump({"completed": [list(k) for k in self.completed_units]}, f)
        except Exception:
            pass

    def _clear_progress(self):
        try:
            if os.path.exists(PROGRESS_FILE):
                os.remove(PROGRESS_FILE)
        except Exception:
            pass

    async def get_departments(self, scope_id):
        url = f"{BASE_URL}/ubigeos/departamentos?idEleccion={ID_ELECCION}&idAmbitoGeografico={scope_id}"
        res = await self.fetch_json(url)
        return res["data"] if res and isinstance(res, dict) and res.get("success") else []

    async def get_provinces(self, scope_id, dep_ubigeo):
        url = f"{BASE_URL}/ubigeos/provincias?idEleccion={ID_ELECCION}&idAmbitoGeografico={scope_id}&idUbigeoDepartamento={dep_ubigeo}"
        res = await self.fetch_json(url)
        return res["data"] if res and isinstance(res, dict) and res.get("success") else []

    async def get_districts(self, scope_id, dep_ubigeo, prov_ubigeo):
        url = f"{BASE_URL}/ubigeos/distritos?idEleccion={ID_ELECCION}&idAmbitoGeografico={scope_id}&idUbigeoDepartamento={dep_ubigeo}&idUbigeoProvincia={prov_ubigeo}"
        res = await self.fetch_json(url)
        return res["data"] if res and isinstance(res, dict) and res.get("success") else []

    async def process_unit(self, scope_id, dep_name, prov_name, dist_name, dep_ubigeo, prov_ubigeo, dist_ubigeo):
        unit_key = (scope_id, dep_ubigeo, prov_ubigeo, dist_ubigeo)
        if unit_key in self.seen_units:
            return True

        votos_url = (
            f"{BASE_URL}/eleccion-presidencial/participantes-ubicacion-geografica-nombre"
            f"?tipoFiltro=ubigeo_nivel_03&idAmbitoGeografico={scope_id}"
            f"&ubigeoNivel1={dep_ubigeo}&ubigeoNivel2={prov_ubigeo}&ubigeoNivel3={dist_ubigeo}&idEleccion={ID_ELECCION}"
        )
        totales_url = (
            f"{BASE_URL}/resumen-general/totales"
            f"?idAmbitoGeografico={scope_id}&idEleccion={ID_ELECCION}"
            f"&tipoFiltro=ubigeo_nivel_03&idUbigeoDepartamento={dep_ubigeo}&idUbigeoProvincia={prov_ubigeo}&idUbigeoDistrito={dist_ubigeo}"
        )
        # Padrón: usar caché si está disponible (evita una llamada extra por unidad).
        # Si no está en caché (primera ejecución sin archivo), se obtiene en paralelo.
        if unit_key in self.padron_cache:
            votos_json, totales_json = await asyncio.gather(
                self.fetch_json(votos_url),
                self.fetch_json(totales_url),
            )
            electores_habiles = self.padron_cache[unit_key]
        else:
            padron_url = (
                f"{BASE_URL}/participacion-ciudadana/totales"
                f"?idAmbitoGeografico={scope_id}&tipoFiltro=ubigeo_nivel_03"
                f"&ubigeoNivel01={dep_ubigeo}&ubigeoNivel02={prov_ubigeo}&ubigeoNivel03={dist_ubigeo}"
            )
            votos_json, totales_json, padron_json = await asyncio.gather(
                self.fetch_json(votos_url),
                self.fetch_json(totales_url),
                self.fetch_json(padron_url),
            )
            electores_habiles = 0
            if padron_json and isinstance(padron_json, dict) and padron_json.get("success"):
                raw_eh = (padron_json.get("data") or {}).get("totalElectoresHabiles")
                if raw_eh is not None:
                    try:
                        electores_habiles = int(raw_eh)
                    except (TypeError, ValueError):
                        electores_habiles = 0

        if not votos_json or not totales_json or not isinstance(votos_json, dict) or not isinstance(totales_json, dict):
            return False

        if not votos_json.get("success") or not totales_json.get("success"):
            return False

        pct_procesado          = float(totales_json["data"].get("actasContabilizadas", 0))
        total_emitidos_parcial = int(totales_json["data"].get("totalVotosEmitidos", 0))
        actas_contabilizadas   = int(totales_json["data"].get("contabilizadas", 0))
        actas_enviadas_jee     = int(totales_json["data"].get("enviadasJee", 0))
        candidates = votos_json["data"]

        current_sum_valid = sum(int(c.get("totalVotosValidos", 0)) for c in candidates if c.get("nombreCandidato"))

        if pct_procesado > 0 and current_sum_valid > 0:
            total_emitidos_final_est = total_emitidos_parcial / (pct_procesado / 100.0)
            projection_factor = total_emitidos_final_est / current_sum_valid
        else:
            projection_factor = 0.0

        for cand in candidates:
            nombre = cand.get("nombreCandidato", "").strip().upper()
            partido = cand.get("nombreAgrupacionPolitica", "DESCONOCIDO").strip().upper()
            if nombre:
                votos_act = int(cand.get("totalVotosValidos", 0))
                self.all_data.append({
                    "ambito":              "PERU" if scope_id == 1 else "EXTRANJERO",
                    "region_cont":         dep_name,
                    "prov_pais":           prov_name,
                    "dist_ciudad":         dist_name,
                    "candidato":           nombre,
                    "partido":             partido,
                    "votos_actuales":      votos_act,
                    "votos_proyectados":   votos_act * projection_factor,
                    "pct_procesado":       pct_procesado,
                    "total_emitidos_parc": total_emitidos_parcial,
                    "actas_contabilizadas": actas_contabilizadas,
                    "actas_enviadas_jee":  actas_enviadas_jee,
                    "electores_habiles":   electores_habiles,
                })

        self.seen_units.add(unit_key)
        self.completed_units.add(unit_key)
        # Persistir progreso cada cierto número de unidades para no perder
        # más de un puñado si nos bloquean abruptamente.
        if len(self.completed_units) % 50 == 0:
            self._save_progress()
        return True

    def _latest_snapshot_onpe_pct(self) -> float | None:
        """Devuelve el `actas_contabilizadas_onpe` del último snapshot en disco,
        o None si no hay snapshots o no se puede leer."""
        try:
            if not os.path.isdir(SNAPSHOTS_DIR):
                return None
            files = [f for f in os.listdir(SNAPSHOTS_DIR)
                     if f.startswith("snapshot_") and f.endswith(".json")]
            if not files:
                return None
            latest = sorted(files)[-1]
            with open(os.path.join(SNAPSHOTS_DIR, latest), encoding="utf-8") as f:
                snap = json.load(f)
            v = snap.get("kpis", {}).get("actas_contabilizadas_onpe")
            return float(v) if v is not None else None
        except Exception:
            return None

    async def run(self) -> bool:
        """Devuelve True si la corrida completó sin distritos fallidos, False si
        no. Cuando falla, NO debe generarse snapshot — los datos parciales en
        memoria no representan el estado real de la elección."""
        # ── 0. Limpieza de progreso previo + warmup ──────────────────────────────
        # Cada corrida arranca de cero. NO usamos resume: el resume entre
        # corridas dejaba `all_data` desincronizado con el progreso (las
        # unidades "ya completadas" en el archivo no tenían su data cargada en
        # memoria → snapshot truncado). Si una corrida falla, la próxima
        # arranca limpia y vuelve a intentar todo.
        self._clear_progress()
        print("Warmup: asentando cookies de sesión...")
        await self.warmup()

        # ── 0.5. Check de cambios: si el % de actas contabilizadas ONPE no
        # subió desde el último snapshot, no hay data nueva que procesar.
        # Abortamos antes de scrapear ~2,100 distritos para ahorrar tiempo y
        # WAF budget. No se genera snapshot (sería duplicado del anterior).
        latest_pct = self._latest_snapshot_onpe_pct()
        current_pct = self.actas_onpe_nacional
        if (latest_pct is not None and current_pct is not None
                and abs(current_pct - latest_pct) < 1e-6):
            print(f"\n[=] Sin cambios: ONPE reporta {current_pct:.3f}% actas "
                  f"(idéntico al último snapshot). Se omite el procesamiento.")
            await self.client.aclose()
            sys.exit(0)

        # ── 1. Jerarquía geográfica ───────────────────────────────────────────────
        extraction_tasks = self._load_jerarquia()

        if extraction_tasks is None:
            print("Fase de descubrimiento: obteniendo jerarquía global...")
            extraction_tasks = []
            for scope_id in [1, 2]:
                departments = await self.get_departments(scope_id)
                if not departments:
                    print(f"[!] Advertencia: no se pudieron obtener departamentos para el ámbito {scope_id}.")
                    continue
                for dep in departments:
                    dep_ubigeo = dep["ubigeo"]
                    provinces = await self.get_provinces(scope_id, dep_ubigeo)
                    for prov in provinces:
                        prov_ubigeo = prov["ubigeo"]
                        districts = await self.get_districts(scope_id, dep_ubigeo, prov_ubigeo)
                        for dist in districts:
                            extraction_tasks.append({
                                "scope_id":    scope_id,
                                "dep_name":    dep["nombre"],
                                "prov_name":   prov["nombre"],
                                "dist_name":   dist["nombre"],
                                "dep_ubigeo":  dep_ubigeo,
                                "prov_ubigeo": prov_ubigeo,
                                "dist_ubigeo": dist["ubigeo"],
                            })

            if not extraction_tasks:
                print("\n[X] Error: no se encontraron unidades geográficas. "
                      "La API puede estar bloqueada — espere unos minutos e intente de nuevo.")
                await self.client.aclose()
                return

            print(f"Unidades encontradas: {len(extraction_tasks):,}")
            self._save_jerarquia(extraction_tasks)

        # ── 2. Padrón electoral (independiente de la jerarquía) ──────────────────
        # Se carga desde cache_padron.json si existe. Si no, se obtiene de la API
        # y se guarda. En segunda vuelta: conservar cache_padron.json tal cual.
        padron_en_cache = self._load_padron()

        # Unidades de la jerarquía actual que no tienen padrón cargado
        sin_padron = [
            t for t in extraction_tasks
            if (t["scope_id"], t["dep_ubigeo"], t["prov_ubigeo"], t["dist_ubigeo"])
            not in self.padron_cache
        ]

        if sin_padron:
            if padron_en_cache:
                print(f"[!] {len(sin_padron):,} unidades sin padrón en caché — obteniendo...")
            else:
                print("\nObteniendo padrón electoral (se guardará en cache_padron.json)...")
            await tqdm.gather(
                *(self._fetch_padron_unit(
                    t["scope_id"], t["dep_ubigeo"], t["prov_ubigeo"], t["dist_ubigeo"]
                ) for t in sin_padron),
                desc="Padrón"
            )
            self._save_padron()
        else:
            print(f"    Padrón completo para todas las unidades.")

        # Filtrar las unidades ya completadas en corridas previas (resume).
        pending = [
            t for t in extraction_tasks
            if (t["scope_id"], t["dep_ubigeo"], t["prov_ubigeo"], t["dist_ubigeo"])
            not in self.completed_units
        ]
        skipped = len(extraction_tasks) - len(pending)
        if skipped:
            print(f"[R] Saltando {skipped:,} unidades ya completadas. Pendientes: {len(pending):,}")
        print(f"\nTotal de unidades a extraer: {len(pending):,}")

        async def worker(task):
            success = await self.process_unit(
                task["scope_id"], task["dep_name"],
                task["prov_name"], task["dist_name"],
                task["dep_ubigeo"], task["prov_ubigeo"],
                task["dist_ubigeo"]
            )
            if not success:
                self.failed_units.append(task)

        print("\nLote principal de extracción (Nivel 3: Distrito/Ciudad):")
        await tqdm.gather(*(worker(t) for t in pending), desc="Extrayendo unidades")

        retry_count = 1
        while self.failed_units and retry_count <= 3:
            print(f"\nReintento #{retry_count} ({len(self.failed_units)} unidades fallidas)...")
            to_retry = self.failed_units[:]
            self.failed_units = []
            await tqdm.gather(*(worker(t) for t in to_retry), desc=f"Reintento {retry_count}")
            retry_count += 1
            await asyncio.sleep(5)

        # Totales agregados de ONPE (actasContabilizadas nacional). El warmup
        # ya lo capturó al inicio; intentamos refrescar para tener el valor más
        # actualizado posible, pero si falla conservamos el del warmup.
        fresh = await self.fetch_totales_nacional()
        if fresh is not None:
            self.actas_onpe_nacional = fresh

        # Limpiamos siempre el archivo de progreso (no se usa entre corridas).
        self._clear_progress()
        await self.client.aclose()

        if self.failed_units:
            print(f"\n[X] ABORTANDO: {len(self.failed_units)} unidades no se pudieron obtener.")
            print(f"    El snapshot NO se generará. La próxima corrida empezará limpia.")
            for t in self.failed_units[:10]:
                print(f"      - {t.get('dep_name','?')} / {t.get('prov_name','?')} / {t.get('dist_name','?')}")
            if len(self.failed_units) > 10:
                print(f"      ... y {len(self.failed_units) - 10} más.")
            return False

        print("\n[V] Éxito: todos los datos obtenidos sin errores.")
        return True

    def analyze_and_report(self):
        if not self.all_data:
            print("No se obtuvieron datos.")
            return

        df = pd.DataFrame(self.all_data)

        # ── 1. Metadatos por unidad (distrito/ciudad) ─────────────────────────────
        meta = df.groupby(['ambito', 'region_cont', 'prov_pais', 'dist_ciudad']).agg(
            pct_procesado=('pct_procesado', 'first'),
            total_emitidos_parc=('total_emitidos_parc', 'first'),
            actas_contabilizadas=('actas_contabilizadas', 'first'),
            actas_enviadas_jee=('actas_enviadas_jee', 'first'),
            electores_habiles=('electores_habiles', 'first'),
        ).reset_index()

        # ── 2. Separar incluidas (≥ umbral) y excluidas (< umbral) ───────────────
        mask_inc   = meta['pct_procesado'] >= MIN_PCT_PROYECCION
        claves_inc = set(zip(
            meta[mask_inc]['ambito'], meta[mask_inc]['region_cont'],
            meta[mask_inc]['prov_pais'], meta[mask_inc]['dist_ciudad']
        ))
        meta_exc = meta[~mask_inc].copy().sort_values(['ambito', 'region_cont', 'prov_pais', 'dist_ciudad'])

        df['_k'] = list(zip(df['ambito'], df['region_cont'], df['prov_pais'], df['dist_ciudad']))
        df_inc   = df[df['_k'].isin(claves_inc)].copy()
        df.drop(columns=['_k'], inplace=True)
        df_inc.drop(columns=['_k'], inplace=True)

        # ── 3. Resumen nacional: proyección desde unidades incluidas ──────────────
        #
        # Dos proyecciones paralelas por candidato por unidad:
        #
        #   votos_proyectados  (emitidos-based):  votos_act × emitidos_final/valid_sum
        #     → escala a votos EMITIDOS (incluye blancos/nulos).
        #     → mejor para calcular shares y la cascada de varianza,
        #       porque pondera por el tamaño final estimado de cada unidad.
        #
        #   votos_proj_valid   (valid-based):     votos_act / (pct/100)
        #     → escala a votos VÁLIDOS directamente.
        #     → más preciso para "Proy. @ 100%" en absolutos porque no infla
        #       por la tasa de blancos/nulos (~10% de diferencia típicamente).
        #
        # Las unidades incluidas tienen pct ≥ MIN_PCT_PROYECCION, sin riesgo de /0.
        df_inc['votos_proj_valid'] = (
            df_inc['votos_actuales'] / (df_inc['pct_procesado'] / 100.0)
        )

        resumen = df_inc.groupby(['candidato', 'partido']).agg(
            votos_actuales=('votos_actuales', 'sum'),
            votos_proyectados=('votos_proyectados', 'sum'),
            votos_proj_valid=('votos_proj_valid', 'sum'),
        ).reset_index()
        resumen['Proy. @ 100%'] = resumen['votos_proj_valid'].round(0).astype(int)
        total_proy_inc = int(resumen['Proy. @ 100%'].sum())

        # ── 4. valid_rate (votos válidos / emitidos) por unidad, con cascada ─────
        # Lo usamos en MC y en el resto del análisis para convertir emitidos a
        # votos válidos (los que efectivamente se reparten entre K y R).
        unit_rates = df_inc.groupby(['ambito', 'region_cont', 'prov_pais', 'dist_ciudad']).agg(
            unit_valid=('votos_actuales', 'sum'),
            emit_parc=('total_emitidos_parc', 'first')
        ).reset_index()
        unit_rates['valid_rate'] = unit_rates['unit_valid'] / unit_rates['emit_parc'].clip(lower=1)

        d_prov_vrate = unit_rates.groupby(
            ['ambito', 'region_cont', 'prov_pais']
        )['valid_rate'].mean().to_dict()
        d_reg_vrate  = unit_rates.groupby(
            ['ambito', 'region_cont']
        )['valid_rate'].mean().to_dict()
        nat_vrate    = float(unit_rates['valid_rate'].mean())

        def _vr_cascade(ambito, region_cont, prov_pais):
            """valid_rate por cascada provincia → región → nacional."""
            return d_prov_vrate.get(
                (ambito, region_cont, prov_pais),
                d_reg_vrate.get((ambito, region_cont), nat_vrate)
            )

        all_candidates = resumen['candidato'].tolist()

        meta_inc_df = meta[mask_inc].copy()
        meta_inc_df['emitidos_final_est'] = (
            meta_inc_df['total_emitidos_parc'] / (meta_inc_df['pct_procesado'] / 100.0)
        )

        # Tasa de participación observada por unidad incluida:
        # turnout = emitidos_parciales / (padron × pct_procesado/100)
        #         = emitidos_final_est  / padron
        # Solo calculable donde el padrón es conocido (electores_habiles > 0).
        # ── Prior R1: por distrito, expectativa de share K/R y turnout. ──────
        # Si no existe el cache, r1_priors queda vacío y el modelo sigue como antes.
        r1_priors = _load_r1_priors()
        if r1_priors:
            print(f"  Prior R1 cargado: {len(r1_priors):,} distritos.")
        # Detectamos los dos candidatos R2 por su nombre exacto en este snapshot
        # para mapear el bucket "K"/"R" del prior a sus claves reales.
        # Asumimos que el ranking actual encabeza a los dos finalistas.
        _r2_top = resumen.head(2)['candidato'].tolist() if not resumen.empty else []
        # Identificar cuál de los dos es "K" y cuál "R" según substring del nombre.
        _r2_K = next((n for n in _r2_top if 'KEIKO' in n.upper()), None)
        _r2_R = next((n for n in _r2_top if 'ROBERTO' in n.upper() or 'SANCHEZ' in n.upper()), None)
        if _r2_K is None or _r2_R is None:
            # Si no logramos identificar (ronda distinta, snapshot inicial vacío),
            # desactivamos el prior para evitar errores.
            r1_priors = {}

        meta_inc_df['turnout_obs'] = meta_inc_df.apply(
            lambda r: r['emitidos_final_est'] / r['electores_habiles']
            if r['electores_habiles'] > 0 else float('nan'), axis=1
        )

        # Tasas de participación promedio por zona (para proyectar unidades pct=0 con padrón conocido)
        d_prov_turnout = (
            meta_inc_df[meta_inc_df['turnout_obs'].notna()]
            .groupby(['ambito', 'region_cont', 'prov_pais'])['turnout_obs']
            .mean().to_dict()
        )
        d_reg_turnout = (
            meta_inc_df[meta_inc_df['turnout_obs'].notna()]
            .groupby(['ambito', 'region_cont'])['turnout_obs']
            .mean().to_dict()
        )
        nat_turnout = meta_inc_df['turnout_obs'].mean()

        # Fallback por tamaño medio (para unidades sin padrón disponible en la API)
        d_prov_mean_size = (
            meta_inc_df.groupby(['ambito', 'region_cont', 'prov_pais'])['emitidos_final_est']
            .mean().to_dict()
        )
        d_reg_mean_size = (
            meta_inc_df.groupby(['ambito', 'region_cont'])['emitidos_final_est']
            .mean().to_dict()
        )
        _nm_peru = meta_inc_df[meta_inc_df['ambito'] == 'PERU']['emitidos_final_est'].mean()
        _nm_ext  = meta_inc_df[meta_inc_df['ambito'] == 'EXTRANJERO']['emitidos_final_est'].mean()
        if pd.isna(_nm_ext)  or _nm_ext  <= 0: _nm_ext  = _nm_peru
        if pd.isna(_nm_peru) or _nm_peru <= 0: _nm_peru = _nm_ext
        nat_mean_size = meta_inc_df['emitidos_final_est'].mean()  # para KPI global

        def _size_estimate(ambito, region_cont, prov_pais, total_emitidos_parc,
                           pct_procesado, electores_habiles=0, dist_ciudad=None):
            """Estima total de votos emitidos a 100% para una unidad.

            Jerarquía de métodos (mejor a peor):
              1. Extrapolación directa: emitidos_parc / (pct/100)         [pct > 0]
              2. Prior R1 del propio distrito: total_emitidos_R1 × factor  [pct=0, R1 disponible]
              3. Padrón × tasa de participación provincial/regional/nac.   [pct=0, sin R1]
              4. Media de emitidos_final de vecinos incluidos             [pct=0, sin padrón]
            """
            if pct_procesado > 0 and total_emitidos_parc > 0:
                return total_emitidos_parc / (pct_procesado / 100.0)
            # Método 2: prior R1 del distrito (turnout histórico real, ajustado).
            if dist_ciudad is not None:
                p = r1_priors.get((ambito, region_cont, prov_pais, dist_ciudad))
                if p and p["total_emitidos_R1"] > 0:
                    return p["total_emitidos_R1"] * TURNOUT_R2_OVER_R1
            # Método 3: padrón × turnout observado en la zona
            if electores_habiles > 0:
                turnout = d_prov_turnout.get(
                    (ambito, region_cont, prov_pais),
                    d_reg_turnout.get((ambito, region_cont), nat_turnout)
                )
                if pd.notna(turnout) and turnout > 0:
                    return electores_habiles * turnout
            # Método 4: media de vecinos (fallback final)
            nat_sz = _nm_peru if ambito == 'PERU' else _nm_ext
            return d_prov_mean_size.get(
                (ambito, region_cont, prov_pais),
                d_reg_mean_size.get((ambito, region_cont), nat_sz)
            )

        # ── Bloques de excluidos (V_total) — solo para KPIs downstream ─────────
        # Necesitamos `prov_exc_blocks` con V_total por bloque para reportar el
        # peso del componente excluido en la potencia estadística. La varianza
        # ahora se calcula vía Monte Carlo, no por bloque.
        prov_exc_blocks = {}
        for row in meta_exc.itertuples():
            key = (row.ambito, row.region_cont, row.prov_pais)
            emit_est = _size_estimate(row.ambito, row.region_cont, row.prov_pais,
                                      row.total_emitidos_parc, row.pct_procesado,
                                      row.electores_habiles, row.dist_ciudad)
            if emit_est <= 0:
                continue
            V_valid = emit_est * _vr_cascade(row.ambito, row.region_cont, row.prov_pais)
            block = prov_exc_blocks.setdefault(key, {"V_total": 0.0})
            block["V_total"] += V_valid

        # ── Volumen de actas IMPUGNADAS (solo informativo) ─────────────────────
        prov_jee_V = {}
        for row in meta[mask_inc].itertuples():
            if row.actas_enviadas_jee <= 0 or row.actas_contabilizadas <= 0:
                continue
            key = (row.ambito, row.region_cont, row.prov_pais)
            avg_emit_per_acta = row.total_emitidos_parc / row.actas_contabilizadas
            V_jee = row.actas_enviadas_jee * avg_emit_per_acta \
                    * _vr_cascade(row.ambito, row.region_cont, row.prov_pais)
            prov_jee_V[key] = prov_jee_V.get(key, 0.0) + V_jee

        # ══════════════════════════════════════════════════════════════════════
        # MODELO BAYESIANO JERÁRQUICO + MONTE CARLO
        # ══════════════════════════════════════════════════════════════════════
        # Para cada distrito i, modelamos la proporción de Keiko entre votos
        # válidos (K vs R) como Beta(α_i, β_i) donde:
        #   - prior viene de R1 + matriz de transferencia, descontado por a₀
        #   - observación viene de los votos R2 contados hasta ahora
        # Correlación entre distritos se captura con random effects en MC:
        #   - ε_matriz (global): error de la matriz de transferencia
        #   - ε_región (regional): tendencia compartida en la región
        # ══════════════════════════════════════════════════════════════════════
        mc_samples_K = None
        mc_samples_R = None
        if _r2_K and _r2_R:
            # 1. Observaciones R2 por distrito (K y R en votos válidos)
            df_K_byd = (df[df['candidato'] == _r2_K]
                        .groupby(['ambito', 'region_cont', 'prov_pais', 'dist_ciudad'])
                        ['votos_actuales'].sum())
            df_R_byd = (df[df['candidato'] == _r2_R]
                        .groupby(['ambito', 'region_cont', 'prov_pais', 'dist_ciudad'])
                        ['votos_actuales'].sum())

            districts = meta.copy()
            districts['K_obs'] = (districts.set_index(['ambito','region_cont','prov_pais','dist_ciudad'])
                                  .index.map(df_K_byd).fillna(0)).values
            districts['R_obs'] = (districts.set_index(['ambito','region_cont','prov_pais','dist_ciudad'])
                                  .index.map(df_R_byd).fillna(0)).values

            # 2. Tamaño esperado del distrito en votos válidos
            districts['emit_est'] = districts.apply(
                lambda r: _size_estimate(r['ambito'], r['region_cont'], r['prov_pais'],
                                         r['total_emitidos_parc'], r['pct_procesado'],
                                         r['electores_habiles'], r['dist_ciudad']),
                axis=1
            )
            districts['valid_rate'] = districts.apply(
                lambda r: _vr_cascade(r['ambito'], r['region_cont'], r['prov_pais']),
                axis=1
            )
            districts['V'] = districts['emit_est'] * districts['valid_rate']

            # 3. Prior R1 (share K y strength) por distrito.
            # La "evidencia" del prior es la masa de R1 que la matriz de
            # transferencia mapea efectivamente a K o R en R2 — no incluye
            # blanco/null/abstención que no informan sobre K vs R. Para
            # distritos chicos eso evita inflar artificialmente el prior.
            def _row_prior(row):
                p = r1_priors.get((row['ambito'], row['region_cont'],
                                   row['prov_pais'], row['dist_ciudad']))
                if not p or p['prior_share_K'] is None:
                    return 0.5, 0.0   # sin prior: mu=0.5, strength=0 → prior no influye
                evidence_R1 = float(p['votos_K_esperados']) + float(p['votos_R_esperados'])
                strength = min(PRIOR_STRENGTH_CAP, PRIOR_DISCOUNT_A0 * evidence_R1)
                return float(p['prior_share_K']), float(strength)

            prior_data = districts.apply(_row_prior, axis=1)
            districts['prior_K']        = [p[0] for p in prior_data]
            districts['prior_strength'] = [p[1] for p in prior_data]

            # 4. Códigos de región para random effects jerárquicos
            districts['region_key'] = districts['ambito'] + '|' + districts['region_cont']
            region_codes, region_uniques = pd.factorize(districts['region_key'])
            n_regions = len(region_uniques)

            # σ del random effect regional. NO es la dispersión OBSERVADA entre
            # regiones (eso ya está capturado en `prior_K[i]` por distrito), sino
            # la INCERTIDUMBRE adicional sobre cuánto la matriz de transferencia
            # aplica uniformemente a cada región. Sin data histórica para
            # calibrar, usamos un valor fijo razonable: el error nacional de la
            # matriz puede variar regionalmente en ±3-4pp.
            sigma_between_regions = 0.04

            # 5. Arrays NumPy para Monte Carlo vectorizado
            N = len(districts)
            prior_K_arr        = districts['prior_K'].values.astype(float)
            prior_strength_arr = districts['prior_strength'].values.astype(float)
            K_obs_arr          = districts['K_obs'].values.astype(float)
            R_obs_arr          = districts['R_obs'].values.astype(float)
            V_arr              = districts['V'].values.astype(float)
            V_arr              = np.where(np.isfinite(V_arr), V_arr, 0.0)
            region_codes_arr   = region_codes

            # 6. Monte Carlo
            # Approach profesional de election forecasting (FiveThirtyEight,
            # NYT Upshot, AP): los votos ya contados son verdad fija. La
            # incertidumbre solo se aplica al voto REMANENTE de cada distrito.
            # Cambio respecto del modelo bayesiano de inferencia poblacional:
            #   antes: K_final_i = share_K_i × V_total_i (toda V sujeta a noise)
            #   ahora: K_final_i = K_obs_i + share_K_i × V_remanente_i
            # share_K_i sigue siendo el posterior Beta (combina prior R1 +
            # observación), pero solo se aplica a la fracción no contada.
            V_remaining_arr = np.maximum(V_arr - K_obs_arr - R_obs_arr, 0.0)

            rng = np.random.default_rng()
            S = MC_ITERATIONS
            mc_samples_K = np.zeros(S)
            mc_samples_R = np.zeros(S)

            for it in range(S):
                # Random effects: matriz nacional + variación regional
                eps_matriz = rng.normal(0.0, SIGMA_MATRIX_TRANSFER)
                eps_region = rng.normal(0.0, sigma_between_regions, size=n_regions)

                # Prior ajustado por random effects
                adjusted_prior = np.clip(
                    prior_K_arr + eps_matriz + eps_region[region_codes_arr],
                    0.005, 0.995,
                )

                # Posterior Beta(α, β) por distrito — share inferida combinando
                # prior R1 con la observación R2 acumulada hasta ahora.
                alpha = prior_strength_arr * adjusted_prior + K_obs_arr
                beta_ = prior_strength_arr * (1.0 - adjusted_prior) + R_obs_arr
                no_info_mask = (alpha + beta_) <= 0
                alpha = np.where(no_info_mask, 1.0, alpha)
                beta_ = np.where(no_info_mask, 1.0, beta_)
                alpha = np.maximum(alpha, 0.01)
                beta_ = np.maximum(beta_, 0.01)

                shares_K = rng.beta(alpha, beta_)
                # Proyección final por distrito: K_observado (fijo) + Binomial
                # sample del voto remanente. Incluir el sampleo Binomial captura
                # la variabilidad natural de los últimos votos (incluso con θ
                # conocida exactamente, sortear N votos a probabilidad p tiene
                # varianza N×p×(1-p)). Sin esto, el modelo subestima la
                # incertidumbre residual del conteo.
                V_rem_int = V_remaining_arr.astype(np.int64)
                K_remaining = rng.binomial(V_rem_int,
                                            np.clip(shares_K, 0.0, 1.0))
                R_remaining = V_rem_int - K_remaining
                K_vals = K_obs_arr + K_remaining
                R_vals = R_obs_arr + R_remaining

                mc_samples_K[it] = K_vals.sum()
                mc_samples_R[it] = R_vals.sum()

            # 7. Estadísticos de los samples
            mean_K = float(mc_samples_K.mean())
            mean_R = float(mc_samples_R.mean())
            std_K  = float(mc_samples_K.std())
            std_R  = float(mc_samples_R.std())
        else:
            # Sin K/R identificados (R1 hipotético o snapshot vacío): caemos a
            # los totales observados sin proyección bayesiana.
            mean_K, mean_R, std_K, std_R = 0.0, 0.0, 0.0, 0.0

        total_corr = int(round(mean_K + mean_R))

        def _proj_for(cand):
            if cand == _r2_K: return int(round(mean_K))
            if cand == _r2_R: return int(round(mean_R))
            return 0

        def _marg_for(cand):
            if total_corr <= 0:
                return 0.0
            if cand == _r2_K:
                return round(1.96 * std_K / total_corr * 100, 2)
            if cand == _r2_R:
                return round(1.96 * std_R / total_corr * 100, 2)
            return 0.0

        resumen['Proy. @ 100%'] = resumen['candidato'].map(_proj_for).astype(int)
        resumen['% Est.']       = (resumen['Proy. @ 100%'] / max(total_corr, 1) * 100).round(2)
        resumen['Margen ± pp']  = resumen['candidato'].map(_marg_for)
        resumen = resumen.sort_values('% Est.', ascending=False)

        # Guardamos los samples para `_prob_orden_final` (Monte Carlo, exacto).
        self._mc_samples_K = mc_samples_K
        self._mc_samples_R = mc_samples_R

        # ── 5. KPIs ──────────────────────────────────────────────────────────────
        n_peru_inc   = df_inc[df_inc['ambito'] == 'PERU'][['region_cont', 'prov_pais', 'dist_ciudad']].drop_duplicates().shape[0]
        n_ext_inc    = df_inc[df_inc['ambito'] == 'EXTRANJERO'][['region_cont', 'prov_pais', 'dist_ciudad']].drop_duplicates().shape[0]
        n_peru_exc   = meta_exc[meta_exc['ambito'] == 'PERU'].shape[0]
        n_ext_exc    = meta_exc[meta_exc['ambito'] == 'EXTRANJERO'].shape[0]
        votos_act    = int(df_inc['votos_actuales'].sum())

        # Cobertura ponderada por tamaño final estimado (no por parcial)
        inc_meta = meta[mask_inc].copy()
        inc_meta['emit_final_est'] = inc_meta['total_emitidos_parc'] / (inc_meta['pct_procesado'] / 100.0)
        pct_pond_inc = (
            (inc_meta['pct_procesado'] * inc_meta['emit_final_est']).sum()
            / inc_meta['emit_final_est'].clip(lower=1).sum()
        )
        exc_meta = meta_exc.copy()
        exc_meta['emit_final_est'] = exc_meta.apply(
            lambda r: _size_estimate(r['ambito'], r['region_cont'], r['prov_pais'],
                                     r['total_emitidos_parc'], r['pct_procesado'],
                                     r['electores_habiles'], r['dist_ciudad']), axis=1
        )
        all_emit = pd.concat([
            inc_meta[['pct_procesado', 'emit_final_est']],
            exc_meta[['pct_procesado', 'emit_final_est']]
        ], ignore_index=True)
        pct_pond_global = (
            (all_emit['pct_procesado'] * all_emit['emit_final_est']).sum()
            / all_emit['emit_final_est'].clip(lower=1).sum()
        )

        print("\n" + "=" * 80)
        print("  REPORTE DE PROYECCIÓN NACIONAL — NIVEL DISTRITO/CIUDAD — ELECCIONES 2026")
        print("=" * 80)
        print(f"  Distritos/ciudades incluidos — Perú:        {n_peru_inc:,}")
        print(f"  Distritos/ciudades incluidos — Extranjero:  {n_ext_inc:,}")
        print(f"  Excluidos — Perú:                           {n_peru_exc:,}  (actas < {MIN_PCT_PROYECCION:.0f}%)")
        print(f"  Excluidos — Extranjero:                     {n_ext_exc:,}  (actas < {MIN_PCT_PROYECCION:.0f}%)")
        print(f"  Votos válidos contabilizados:               {votos_act:,}")
        print(f"  Total proyectado (unid. incluidas):         {total_proy_inc:,}")
        print(f"  Cobertura unidades incluidas (pond.):       {pct_pond_inc:.2f}%  ← promedio real de avance")
        print(f"  Cobertura global estimada (pond.):          {pct_pond_global:.2f}%  ← incluidas + excluidas")
        votos_jee_est = int(sum(prov_jee_V.values()))
        n_actas_jee   = int(meta[mask_inc]['actas_enviadas_jee'].sum())
        if n_actas_jee > 0:
            print(f"  Actas impugnadas (JEE):                     {n_actas_jee:,}  (~{votos_jee_est:,} votos válidos en disputa)")
        print("=" * 80 + "\n")

        # ── 6. Detalle de unidades excluidas ─────────────────────────────────────
        if not meta_exc.empty:
            print(f"UNIDADES EXCLUIDAS (actas < {MIN_PCT_PROYECCION:.0f}%) — mostrando primeras 50:")
            tabla_exc = meta_exc.head(50)[['ambito', 'region_cont', 'prov_pais', 'dist_ciudad', 'pct_procesado']].rename(columns={
                'ambito':        'Ámbito',
                'region_cont':   'Región/Continente',
                'prov_pais':     'Provincia/País',
                'dist_ciudad':   'Distrito/Ciudad',
                'pct_procesado': '% Actas',
            })
            print(tabulate(tabla_exc, headers='keys', tablefmt='psql', showindex=False, floatfmt='.2f'))
            if len(meta_exc) > 50:
                print(f"  ... y {len(meta_exc) - 50} más (ver election_excluded_units.csv)")
            print()

        # ── 7. Tabla principal ───────────────────────────────────────────────────
        print("PROYECCIÓN NACIONAL (Top 15 candidatos):")
        _cols_tabla    = ['candidato', 'votos_actuales', 'Proy. @ 100%', '% Est.', 'Margen ± pp']
        _headers_tabla = ['Candidato',  'Votos actuales', 'Proy. @ 100%', '% Est.', 'Margen ± pp']
        print(tabulate(
            resumen.head(15)[_cols_tabla],
            headers=_headers_tabla,
            tablefmt='psql', showindex=False, numalign='right'
        ))

        # ── 8. Potencia estadística ──────────────────────────────────────────────
        V_exc_total = sum(b["V_total"] for b in prov_exc_blocks.values())
        V_inc_total = sum(
            (row.total_emitidos_parc / (row.pct_procesado / 100.0))
            * _vr_cascade(row.ambito, row.region_cont, row.prov_pais)
            for row in meta[mask_inc].itertuples()
            if row.total_emitidos_parc > 0 and row.pct_procesado > 0
        )
        peso_exc_pct = V_exc_total / max(V_inc_total + V_exc_total, 1) * 100

        def _prob_orden_final(cand_a, cand_b, pct_a, pct_b):
            """P(A > B en resultado final) usando muestras del Monte Carlo
            bayesiano. Para R2 con dos candidatos: la probabilidad es la
            fracción exacta de escenarios MC donde A termina arriba de B."""
            sK = self._mc_samples_K
            sR = self._mc_samples_R
            if sK is None or sR is None:
                # Fallback defensivo: sin muestras, devolvemos algo razonable.
                return 1.0 if pct_a > pct_b else (0.0 if pct_a < pct_b else 0.5)
            if cand_a == _r2_K and cand_b == _r2_R:
                return float((sK > sR).mean())
            if cand_a == _r2_R and cand_b == _r2_K:
                return float((sR > sK).mean())
            # Combinaciones no esperadas en R2.
            return 1.0 if pct_a > pct_b else (0.0 if pct_a < pct_b else 0.5)

        print("\n" + "─" * 80)
        print("POTENCIA ESTADÍSTICA")
        print("─" * 80)
        print(f"  Peso estimado de votos en unidades excluidas:  {peso_exc_pct:.1f}%")
        print(f"  (Fracción del total de votos válidos esperados que aún no tienen datos)\n")
        print(f"  P(orden final): si repitiéramos el conteo de los votos pendientes infinitas veces")
        print(f"  respetando la variabilidad observada por zona, en ese % de los casos el orden")
        print(f"  entre A y B se mantendría. Un 99% significa que solo en 1 de cada 100 escenarios")
        print(f"  posibles B superaría a A. Un 60% significa que el resultado es casi una moneda al aire.")
        print(f"  No indica quién va ganando ahora (eso es '% Est.') sino cuán firme es esa ventaja")
        print(f"  frente al volumen de votos que aún no tienen datos.")
        print(f"  Fuentes de incertidumbre incluidas: unidades excluidas (<{MIN_PCT_PROYECCION:.0f}% de actas,")
        print(f"  incluidas las de 0%) y fracción pendiente de las incluidas. Cota conservadora.\n")

        top5 = resumen.head(5).reset_index(drop=True)
        if len(top5) >= 2:
            pares = [(0, 1)]
            if len(top5) >= 3:
                pares += [(1, 2), (0, 2)]
            filas_pw = []
            for i, j in pares:
                ca = top5.loc[i, 'candidato']; pa = top5.loc[i, '% Est.']
                cb = top5.loc[j, 'candidato']; pb = top5.loc[j, '% Est.']
                p  = _prob_orden_final(ca, cb, pa, pb)
                filas_pw.append({
                    'Comparación':    f"{ca[:22]:22s} > {cb[:22]}",
                    'Diferencia pp':  f"{pa - pb:+.2f}",
                    'P(orden final)': f"{p * 100:.1f}%",
                })
            print(tabulate(pd.DataFrame(filas_pw), headers='keys',
                           tablefmt='psql', showindex=False))
        print()

        # ── 9. Metodología ───────────────────────────────────────────────────────
        print("\n" + "─" * 80)
        print("METODOLOGÍA — Bayesiano Jerárquico + Monte Carlo")
        print("─" * 80)
        print(f"""
  1. RECOPILACIÓN (Nivel 3 — Distrito/Ciudad)
     Se obtienen votos válidos por candidato, % de actas contabilizadas y
     emitidos acumulados para cada distrito (Perú) y ciudad (Extranjero).

  2. PRIOR R1 (Power Priors, Ibrahim & Chen 2000)
     Para cada distrito i se usa su comportamiento histórico en R1 + una
     matriz nacional de transferencia R1→R2 (de encuesta) para estimar el
     share esperado de K vs R:
          share_prior_K_i = Σ_c (votos_R1_c_i × P(K | R1=c)) / total_transferido
     El "tamaño" del prior se descuenta por a₀={PRIOR_DISCOUNT_A0} y se acota:
          prior_strength_i = min({PRIOR_STRENGTH_CAP}, a₀ × evidencia_R1_K+R_i)
     El cap captura el error estructural de la matriz (~3pp ≈ n=300 efectivas).
     Para distritos chicos, el prior es proporcionalmente débil.

  3. POSTERIOR Beta-Binomial POR DISTRITO
     Combinamos prior con observación R2 vía conjugación:
          α_i = prior_strength_i × share_prior_K_i + K_observado_R2_i
          β_i = prior_strength_i × (1 − share_prior_K_i) + R_observado_R2_i
          share_K_i ~ Beta(α_i, β_i)
     Con observación abundante, observación domina. Con poca o nula
     observación, el prior R1 sostiene la estimación.

  4. CORRELACIÓN VIA RANDOM EFFECTS JERÁRQUICOS
     En cada iteración Monte Carlo se sortean dos efectos correlacionados:
       ε_matriz  ~ N(0, σ={SIGMA_MATRIX_TRANSFER:.2f})    [error de la encuesta de transferencia]
       ε_región  ~ N(0, σ_R)                  [variación entre regiones]
     Ambos se aplican a la mu del prior antes del sampling Beta — los
     distritos NO son independientes; comparten sesgos comunes nacional y
     regional.

  5. PROYECCIÓN NACIONAL (Monte Carlo, {MC_ITERATIONS} iteraciones)
     En cada iteración:
       - Sortear ε_matriz y ε_región
       - Por distrito i: ajustar prior, calcular α/β, samplear share_K_i
       - K_total_iter = Σ_i (share_K_i × V_i),  R_total_iter = Σ_i ((1-share_K_i) × V_i)
     Los 5,000 samples nacionales arrojan:
       % Est.        = mean(samples) / total_proyectado × 100
       Margen ± pp   = 1.96 × std(samples) / total × 100    (IC 95%)
       p_invert      = fracción de samples donde el orden se invierte (exacto)

  6. UMBRAL DE INCLUSIÓN (presentación, no afecta cálculo)
     Distritos con ≥{MIN_PCT_PROYECCION:.0f}% de actas se reportan como "incluidos en la
     proyección". El modelo bayesiano usa TODOS los distritos por igual; el
     umbral solo separa UI/reporte. Distritos por debajo del umbral aportan
     vía su prior R1 + cualquier observación parcial.

  Este modelo reemplaza al cascade frecuentista anterior. Elimina umbrales
  ad-hoc (MIN_N_*), pisos de sigma por cobertura y el override de extranjero
  ciego: la incertidumbre se propaga automáticamente vía el posterior Beta y
  los random effects del Monte Carlo.
""")

        # ── 10. Guardar resultados ────────────────────────────────────────────────
        try:
            # Exportar solo columnas interpretables.
            # votos_proyectados (emitidos-based) se omite: es un valor interno usado
            # para ponderar shares y resulta confuso en absolutos (incluye blancos/nulos).
            # votos_proj_valid es la proyección correcta de votos válidos.
            df_inc[['ambito', 'region_cont', 'prov_pais', 'dist_ciudad',
                    'candidato', 'partido', 'votos_actuales', 'votos_proj_valid',
                    'pct_procesado', 'total_emitidos_parc', 'electores_habiles']] \
                .rename(columns={'votos_proj_valid': 'votos_proyectados_validos'}) \
                .to_csv("election_data_districts.csv", index=False, encoding='utf-8-sig')
            resumen.to_csv("election_projection_districts.csv", index=False, encoding='utf-8-sig')

            if not meta_exc.empty:
                # Enriquecer CSV de excluidas con columnas de verificación del padrón
                exc_export = exc_meta.copy()
                exc_export['emit_est_votos']  = exc_export['emit_final_est'].fillna(0).round(0).astype(int)
                exc_export['metodo_estimacion'] = exc_export.apply(
                    lambda r: 'extrapolacion'   if r['pct_procesado'] > 0
                    else      'padron×turnout'  if r['electores_habiles'] > 0
                    else      'media_vecinos',
                    axis=1
                )
                exc_export['turnout_implícito'] = exc_export.apply(
                    lambda r: round(r['emit_est_votos'] / r['electores_habiles'], 4)
                    if r['electores_habiles'] > 0 else None, axis=1
                )
                exc_export.to_csv("election_excluded_units.csv", index=False, encoding='utf-8-sig')

            # Verificación de padron: resumen de cobertura y consistencia
            n_con_padron = (meta['electores_habiles'] > 0).sum()
            n_sin_padron = (meta['electores_habiles'] == 0).sum()
            print(f"\n  Verificación padrón: {n_con_padron:,} unidades con padrón · {n_sin_padron:,} sin padrón")
            if not meta_exc.empty and (meta_exc['electores_habiles'] > 0).any():
                exc_con_padron = (meta_exc['electores_habiles'] > 0).sum()
                turnout_exc = exc_meta[exc_meta['electores_habiles'] > 0].apply(
                    lambda r: r['emit_final_est'] / r['electores_habiles'], axis=1
                )
                print(f"  Excluidas con padrón: {exc_con_padron:,} · "
                      f"turnout estimado: {turnout_exc.min():.1%}–{turnout_exc.max():.1%} "
                      f"(media {turnout_exc.mean():.1%})")

            print(f"\n  Datos por unidad:    election_data_districts.csv")
            print(f"  Resumen nacional:    election_projection_districts.csv")
            if not meta_exc.empty:
                print(f"  Excluidas:           election_excluded_units.csv")
                print(f"    Columnas: ambito, región, provincia, distrito, %actas,")
                print(f"    electores_habiles, emit_est_votos, metodo_estimacion, turnout_implícito")
        except PermissionError:
            print("\n[!] Error: no se pudieron guardar los CSVs. Verifique que no estén abiertos.")

        # ── 11. Snapshot JSON para el dashboard web ──────────────────────────────
        try:
            lima_tz      = datetime.timezone(datetime.timedelta(hours=-5))
            ts           = datetime.datetime.now(lima_tz).replace(microsecond=0)
            generated_at = ts.isoformat()

            # ── Agregación por región (departamento o continente) ────────────
            # Para el mapa de calor del dashboard: cobertura, ganador actual y
            # ganador proyectado por unidad geográfica de Nivel 1.
            snap_regiones = []
            meta_with_est = meta.copy()
            # `emit_final_est` debe estimar el tamaño TOTAL del distrito (a 100%
            # del conteo), incluso cuando pct=0. Usamos _size_estimate, que
            # cubre los 3 métodos: extrapolación / padrón×turnout / media de
            # vecinos. Antes esto era 0 para pct=0, lo que provocaba que el
            # `pct_pond` regional ignorara a los distritos sin datos y diera
            # cifras engañosamente altas (ej.: AMÉRICA 93% con 5/95 incluidos).
            meta_with_est['emit_final_est'] = meta_with_est.apply(
                lambda r: _size_estimate(r['ambito'], r['region_cont'], r['prov_pais'],
                                         r['total_emitidos_parc'], r['pct_procesado'],
                                         r['electores_habiles'], r['dist_ciudad']),
                axis=1
            )
            for (amb, reg), g in meta_with_est.groupby(['ambito', 'region_cont']):
                n_inc_r = int((g['pct_procesado'] >= MIN_PCT_PROYECCION).sum())
                n_exc_r = int((g['pct_procesado'] <  MIN_PCT_PROYECCION).sum())
                den_r   = float(g['emit_final_est'].clip(lower=1).sum())
                pct_pond_r = float((g['pct_procesado'] * g['emit_final_est']).sum() / den_r) if den_r > 0 else 0.0

                cand_g = (df[(df['ambito'] == amb) & (df['region_cont'] == reg)]
                          .groupby('candidato')['votos_actuales'].sum())
                total_cand_r = float(cand_g.sum())

                # Votos PROYECTADOS por candidato en la región. Combina:
                #   1) extrapolación de votos_proj_valid en distritos incluidos
                #   2) si no hay incluidas con votos, agregación del prior R1
                # Devuelve un dict {candidato: votos_proy}. Usado para calcular
                # pct_proyectado, que es lo que el dashboard muestra cuando una
                # región todavía no tiene actas reales.
                proy_g_full = (df_inc[(df_inc['ambito'] == amb)
                                      & (df_inc['region_cont'] == reg)]
                              .groupby('candidato')['votos_proj_valid'].sum())
                proy_votes = {str(n): float(v) for n, v in proy_g_full.items()}
                if sum(proy_votes.values()) <= 0 and r1_priors and _r2_K and _r2_R:
                    K_pp, R_pp = 0.0, 0.0
                    for key, p in r1_priors.items():
                        if key[0] == amb and key[1] == reg:
                            K_pp += float(p.get('votos_K_esperados') or 0)
                            R_pp += float(p.get('votos_R_esperados') or 0)
                    if K_pp > 0 or R_pp > 0:
                        proy_votes[_r2_K] = K_pp
                        proy_votes[_r2_R] = R_pp
                total_proy_r = sum(proy_votes.values())

                cand_list = []
                ganador, mejor_votos = None, 0  # solo declarar ganador con >0 votos
                for nom, v in cand_g.items():
                    pct_act = (float(v) / total_cand_r * 100.0) if total_cand_r > 0 else 0.0
                    pct_proy = (proy_votes.get(str(nom), 0.0) / total_proy_r * 100.0
                                if total_proy_r > 0 else 0.0)
                    cand_list.append({
                        "nombre":         str(nom),
                        "votos_actuales": int(v),
                        "pct_actual":     round(pct_act, 2),
                        "pct_proyectado": round(pct_proy, 2),
                    })
                    if int(v) > mejor_votos:
                        mejor_votos, ganador = int(v), str(nom)

                # Ganador proyectado:
                #   1) si hay distritos incluidos con observación R2, usar la
                #      suma de votos_proj_valid (proyección directa de R2);
                #   2) si no, derivar del prior R1 agregado de la región
                #      (modelo bayesiano: aún regiones sin R2 tienen
                #      proyección desde el histórico + matriz de transferencia).
                proy_g = (df_inc[(df_inc['ambito'] == amb) & (df_inc['region_cont'] == reg)]
                          .groupby('candidato')['votos_proj_valid'].sum())
                ganador_proy, mejor_proy = None, 0.0
                for nom, v in proy_g.items():
                    if float(v) > mejor_proy:
                        mejor_proy, ganador_proy = float(v), str(nom)
                if ganador_proy is None and r1_priors and _r2_K and _r2_R:
                    K_p, R_p = 0.0, 0.0
                    for key, p in r1_priors.items():
                        if key[0] == amb and key[1] == reg:
                            K_p += float(p.get('votos_K_esperados') or 0)
                            R_p += float(p.get('votos_R_esperados') or 0)
                    if K_p > 0 or R_p > 0:
                        ganador_proy = _r2_K if K_p >= R_p else _r2_R

                snap_regiones.append({
                    "nombre":             str(reg),
                    "ambito":             str(amb),
                    "n_inc":              n_inc_r,
                    "n_exc":              n_exc_r,
                    "pct_pond":           round(pct_pond_r, 2) if math.isfinite(pct_pond_r) else 0.0,
                    "ganador":            ganador,
                    "ganador_proyectado": ganador_proy,
                    "candidatos":         cand_list,
                })

            snap_kpis = {
                "peru_inc":        int(n_peru_inc),
                "peru_exc":        int(n_peru_exc),
                "ext_inc":         int(n_ext_inc),
                "ext_exc":         int(n_ext_exc),
                "votos_actuales":  int(votos_act),
                # Proyección total CORREGIDA (incluidas + estimación de excluidas),
                # consistente con `% Est.` y con el `proy_100` por candidato.
                "proy_total":      int(total_corr),
                "pct_pond_inc":    (round(float(pct_pond_inc), 2)
                                    if math.isfinite(float(pct_pond_inc)) else None),
                "pct_pond_global": (round(float(pct_pond_global), 2)
                                    if math.isfinite(float(pct_pond_global)) else None),
                "actas_jee":       int(n_actas_jee),
                "votos_jee_est":   int(votos_jee_est),
                # Total nacional del padrón (electores hábiles) — útil para
                # que el dashboard calcule ausentismo contra la proyección.
                "electores_habiles": int(meta['electores_habiles'].sum()),
            }
            # actasContabilizadas nacional (ONPE). Es el número "oficial" que se
            # ve en la web de ONPE — distinto del pct_pond_global calculado aquí.
            if getattr(self, 'actas_onpe_nacional', None) is not None:
                snap_kpis["actas_contabilizadas_onpe"] = round(
                    float(self.actas_onpe_nacional), 3
                )

            snap_comparaciones = []
            top5_snap = resumen.head(5).reset_index(drop=True)
            if len(top5_snap) >= 2:
                pares_snap = [(0, 1)]
                if len(top5_snap) >= 3:
                    pares_snap += [(1, 2), (0, 2)]
                for i, j in pares_snap:
                    ca = str(top5_snap.loc[i, 'candidato'])
                    pa = float(top5_snap.loc[i, '% Est.'])
                    cb = str(top5_snap.loc[j, 'candidato'])
                    pb = float(top5_snap.loc[j, '% Est.'])
                    snap_comparaciones.append({
                        "a":             ca,
                        "b":             cb,
                        "diff_pp":       round(pa - pb, 2),
                        "p_orden_final": round(_prob_orden_final(ca, cb, pa, pb), 4),
                    })

            snap_metodologia = {
                "min_pct_proyeccion":    MIN_PCT_PROYECCION,
                "modelo":                "beta_binomial_jerarquico_monte_carlo",
                "prior_discount_a0":     PRIOR_DISCOUNT_A0,
                "prior_strength_cap":    PRIOR_STRENGTH_CAP,
                "sigma_matriz_transfer": SIGMA_MATRIX_TRANSFER,
                "mc_iterations":         MC_ITERATIONS,
                "fuentes_varianza": [
                    "prior_r1_per_distrito",
                    "observacion_r2_per_distrito",
                    "random_effect_nacional_matriz_transferencia",
                    "random_effect_regional",
                ],
            }

            snapshot = _build_snapshot(resumen, snap_kpis, snap_comparaciones,
                                       snap_metodologia, generated_at,
                                       regiones=snap_regiones)
            snap_path = _save_snapshot(snapshot)
            _update_snapshot_index()
            print(f"  Snapshot:            {snap_path}")
            _upload_snapshots_to_server()
        except Exception as e:
            print(f"\n[!] Error generando snapshot para dashboard: {e}")

# ── Snapshot helpers (contrato v1 con el dashboard web) ─────────────────────
def _build_snapshot(resumen: pd.DataFrame,
                    kpis: dict,
                    comparaciones: list,
                    metodologia: dict,
                    generated_at: str,
                    regiones: list | None = None) -> dict:
    """Construye el payload a partir del resumen y KPIs ya calculados.

    El campo `regiones` (opcional) contiene una agregación por
    departamento/continente para alimentar el mapa de calor del dashboard.
    Snapshots antiguos sin este campo siguen siendo válidos en el dashboard.
    """
    candidatos = []
    for _, row in resumen.iterrows():
        c = {
            "nombre":         str(row['candidato']),
            "partido":        str(row['partido']) if pd.notna(row['partido']) else "",
            "votos_actuales": int(row['votos_actuales']),
            "proy_100":       int(round(float(row['Proy. @ 100%']))),
            "pct_est":        float(row['% Est.']),
            "margen_pp":      float(row['Margen ± pp']),
        }
        candidatos.append(c)
    payload = {
        "schema_version": SCHEMA_VERSION,
        "generated_at":   generated_at,
        "id_eleccion":    ID_ELECCION,
        "ronda":          RONDA,
        "kpis":           kpis,
        "candidatos":     candidatos,
        "comparaciones":  comparaciones,
        "metodologia":    metodologia,
    }
    if regiones is not None:
        payload["regiones"] = regiones
    return payload


def _save_snapshot(snapshot: dict) -> str:
    """Escribe `snapshots/snapshot_YYYYMMDD_HHMMSS.json` (hora America/Lima
    derivada de `generated_at`). Retorna el path escrito."""
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
    ts = datetime.datetime.fromisoformat(snapshot['generated_at'])
    filename = f"snapshot_{ts.strftime('%Y%m%d_%H%M%S')}.json"
    path = os.path.join(SNAPSHOTS_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)
    return path


def _upload_snapshots_to_server() -> None:
    """Sube todos los snapshot_*.json y el index.json al endpoint PHP remoto.
    Se salta silenciosamente si UPLOAD_URL/UPLOAD_TOKEN no están configurados.
    `index.json` se sube al final para que el dashboard nunca vea referencias
    a archivos que aún no han llegado."""
    if not UPLOAD_URL or not UPLOAD_TOKEN or UPLOAD_TOKEN == "REPLACE_WITH_REAL_TOKEN":
        return
    if not os.path.isdir(SNAPSHOTS_DIR):
        return

    files = sorted(
        f for f in os.listdir(SNAPSHOTS_DIR)
        if f.startswith('snapshot_') and f.endswith('.json')
    )
    if os.path.exists(os.path.join(SNAPSHOTS_DIR, 'index.json')):
        files.append('index.json')  # al final, después de todos los snapshots

    print(f"[upload] Enviando {len(files)} archivo(s) a {UPLOAD_URL}")
    headers = {'X-Upload-Token': UPLOAD_TOKEN}
    with httpx.Client(timeout=60) as client:
        for fname in files:
            path = os.path.join(SNAPSHOTS_DIR, fname)
            try:
                with open(path, 'rb') as fh:
                    r = client.post(
                        UPLOAD_URL,
                        headers=headers,
                        files={'file': (fname, fh, 'application/json')},
                    )
                if r.status_code == 200:
                    print(f"[upload] OK  {fname}")
                else:
                    body = r.text[:200].replace('\n', ' ')
                    print(f"[upload] ERR {fname}: HTTP {r.status_code} {body}")
            except Exception as e:
                print(f"[upload] ERR {fname}: {e}")


def _update_snapshot_index() -> None:
    """Regenera `snapshots/index.json` escaneando el directorio.
    Permite eliminar archivos manualmente sin romper el índice."""
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
    entries = []
    for fname in os.listdir(SNAPSHOTS_DIR):
        if not (fname.startswith('snapshot_') and fname.endswith('.json')):
            continue
        try:
            with open(os.path.join(SNAPSHOTS_DIR, fname), 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue
        kpis = data.get('kpis', {})
        entries.append({
            "filename":                  fname,
            "generated_at":              data.get('generated_at'),
            "id_eleccion":               data.get('id_eleccion'),
            "ronda":                     data.get('ronda'),
            "schema_version":            data.get('schema_version'),
            "pct_pond_global":           kpis.get('pct_pond_global'),
            "actas_contabilizadas_onpe": kpis.get('actas_contabilizadas_onpe'),
        })
    entries.sort(key=lambda e: e.get('generated_at') or '', reverse=True)
    with open(os.path.join(SNAPSHOTS_DIR, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump({"snapshots": entries}, f, ensure_ascii=False, indent=2)


async def main():
    scraper = ONPEScraper()
    ok = await scraper.run()
    if not ok:
        # Salimos sin tocar nada más: ningún CSV, ningún snapshot, ningún upload.
        sys.exit(1)
    scraper.analyze_and_report()

if __name__ == "__main__":
    asyncio.run(main())
