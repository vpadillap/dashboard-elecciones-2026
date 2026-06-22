"""
Scraper de UNA SOLA VEZ para los resultados de PRIMERA VUELTA por distrito.

Construye `cache_resultados_r1.json` con los votos por candidato y por distrito
de la primera vuelta. Este archivo se vuelve permanente y se usará como prior
bayesiano en el modelo de segunda vuelta — no hay que volver a correrlo.

Reutiliza `cache_jerarquia.json` (la jerarquía de ubigeos es la misma para R1
y R2). Solo hay que pegarle al dominio de R1.

Es resume-capable: si te corta el WAF a mitad, vuelves a correrlo y salta lo
que ya tiene.

Uso:
    python scrape_r1.py
"""

import asyncio
import datetime
import json
import os
import random
import sys
from collections import deque

import httpx

# ── Configuración ────────────────────────────────────────────────────────────
BASE_URL_R1 = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend"
ID_ELECCION = "10"

CACHE_JERARQUIA_FILE = "cache_jerarquia.json"
OUT_FILE             = "cache_resultados_r1.json"

MAX_CONCURRENT_REQUESTS = 22
REQUEST_JITTER_MAX      = 0.05
WAF_BLOCK_WINDOW        = 20
WAF_BLOCK_THRESHOLD     = 15
WAF_BLOCK_COOLDOWN_SEC  = 65

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "es-US,es-419;q=0.9,es;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Content-Type": "application/json",
    # Referer apunta al dominio de R1 — clave para que CloudFront acepte la sesión.
    "Referer": "https://resultadoelectoral.onpe.gob.pe/main/presidenciales",
    "Sec-Ch-Ua": '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Priority": "u=1, i",
}

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)


def _key(scope, dep, prov, dist):
    return f"{scope}|{dep}|{prov}|{dist}"


def _log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


# ── HTTP con detección de bloqueo ────────────────────────────────────────────

class R1Scraper:
    def __init__(self):
        self._block_window = deque(maxlen=WAF_BLOCK_WINDOW)
        self._cooldown_lock = asyncio.Lock()
        self.client = httpx.AsyncClient(
            headers=HEADERS, timeout=20.0, http2=True,
            follow_redirects=True, verify=False,
        )

    async def warmup(self):
        try:
            await self.client.get(
                "https://resultadoelectoral.onpe.gob.pe/main/presidenciales"
            )
            await asyncio.sleep(0.3)
            await self.client.get(
                f"{BASE_URL_R1}/resumen-general/totales"
                f"?idEleccion={ID_ELECCION}&tipoFiltro=eleccion"
            )
        except Exception:
            pass

    async def _maybe_cooldown(self):
        if len(self._block_window) < WAF_BLOCK_WINDOW:
            return
        if sum(self._block_window) < WAF_BLOCK_THRESHOLD:
            return
        if self._cooldown_lock.locked():
            async with self._cooldown_lock:
                return
        async with self._cooldown_lock:
            if sum(self._block_window) >= WAF_BLOCK_THRESHOLD:
                _log(f"[!] WAF bloqueando ({sum(self._block_window)}/{WAF_BLOCK_WINDOW}). "
                     f"Pausando {WAF_BLOCK_COOLDOWN_SEC}s.")
                await asyncio.sleep(WAF_BLOCK_COOLDOWN_SEC)
                self._block_window.clear()

    async def fetch_json(self, url):
        async with semaphore:
            await self._maybe_cooldown()
            if REQUEST_JITTER_MAX > 0:
                await asyncio.sleep(random.uniform(0, REQUEST_JITTER_MAX))
            for attempt in range(4):
                try:
                    r = await self.client.get(url)
                    r.raise_for_status()
                    ct = r.headers.get("Content-Type", "").lower()
                    if "html" in ct or r.text.strip().startswith("<!doctype"):
                        self._block_window.append(1)
                        if attempt < 3:
                            await asyncio.sleep(3 * (attempt + 1) + random.uniform(0, 1.5))
                            continue
                        return None
                    self._block_window.append(0)
                    return r.json()
                except Exception:
                    if attempt < 3:
                        await asyncio.sleep(2 * (attempt + 1) + random.uniform(0, 1.0))
                    else:
                        return None
            return None

    async def fetch_distrito(self, scope, dep_ubigeo, prov_ubigeo, dist_ubigeo):
        """Trae los participantes (votos por candidato) y totales del distrito."""
        votos_url = (
            f"{BASE_URL_R1}/eleccion-presidencial/participantes-ubicacion-geografica-nombre"
            f"?tipoFiltro=ubigeo_nivel_03&idAmbitoGeografico={scope}"
            f"&ubigeoNivel1={dep_ubigeo}&ubigeoNivel2={prov_ubigeo}"
            f"&ubigeoNivel3={dist_ubigeo}&idEleccion={ID_ELECCION}"
        )
        totales_url = (
            f"{BASE_URL_R1}/resumen-general/totales"
            f"?idAmbitoGeografico={scope}&idEleccion={ID_ELECCION}"
            f"&tipoFiltro=ubigeo_nivel_03"
            f"&idUbigeoDepartamento={dep_ubigeo}"
            f"&idUbigeoProvincia={prov_ubigeo}"
            f"&idUbigeoDistrito={dist_ubigeo}"
        )
        votos_json, totales_json = await asyncio.gather(
            self.fetch_json(votos_url),
            self.fetch_json(totales_url),
        )
        if not votos_json or not totales_json:
            return None
        if not votos_json.get("success") or not totales_json.get("success"):
            return None

        td = totales_json["data"]
        candidatos_raw = votos_json["data"]

        candidatos = {}
        votos_blancos = 0
        votos_nulos   = 0
        for c in candidatos_raw:
            nombre  = (c.get("nombreCandidato") or "").strip().upper()
            partido = (c.get("nombreAgrupacionPolitica") or "").strip().upper()
            votos   = int(c.get("totalVotosValidos") or 0)
            if not nombre:
                # Marcadores de blanco/nulo: codigoAgrupacionPolitica 80/81
                if partido == "VOTOS EN BLANCO":
                    votos_blancos = votos
                elif partido == "VOTOS NULOS":
                    votos_nulos = votos
                continue
            candidatos[nombre] = {"partido": partido, "votos": votos}

        return {
            "candidatos":           candidatos,
            "votos_blancos":        votos_blancos,
            "votos_nulos":          votos_nulos,
            "total_emitidos":       int(td.get("totalVotosEmitidos") or 0),
            "pct_procesado":        float(td.get("actasContabilizadas") or 0),
            "actas_contabilizadas": int(td.get("contabilizadas") or 0),
        }

    async def aclose(self):
        await self.client.aclose()


# ── Persistencia / resume ────────────────────────────────────────────────────

def load_existing():
    if not os.path.exists(OUT_FILE):
        return {}
    try:
        with open(OUT_FILE, encoding="utf-8") as f:
            return json.load(f).get("distritos", {})
    except Exception:
        return {}


def save_all(distritos):
    payload = {
        "scraped_at":   datetime.datetime.now(
                            datetime.timezone(datetime.timedelta(hours=-5))
                        ).isoformat(),
        "fuente":       BASE_URL_R1,
        "id_eleccion":  ID_ELECCION,
        "n_distritos":  len(distritos),
        "distritos":    distritos,
    }
    tmp = OUT_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    os.replace(tmp, OUT_FILE)


# ── Orquestación ─────────────────────────────────────────────────────────────

async def main():
    if not os.path.exists(CACHE_JERARQUIA_FILE):
        _log(f"[!] Falta {CACHE_JERARQUIA_FILE}. Corre elecciones26.py primero "
             "para construir la jerarquía.")
        return

    with open(CACHE_JERARQUIA_FILE, encoding="utf-8") as f:
        units = json.load(f)["units"]

    distritos = load_existing()
    pending = [u for u in units
               if _key(u["scope_id"], u["dep_ubigeo"],
                       u["prov_ubigeo"], u["dist_ubigeo"]) not in distritos]
    _log(f"Total jerarquía: {len(units):,} · ya cacheados: {len(distritos):,} "
         f"· pendientes: {len(pending):,}")

    if not pending:
        _log("Todo ya está cacheado. Nada que hacer.")
        return

    scraper = R1Scraper()
    _log("Warmup...")
    await scraper.warmup()

    counter = {"ok": 0, "fail": 0}
    counter_lock = asyncio.Lock()
    save_every = 100

    async def worker(u):
        k = _key(u["scope_id"], u["dep_ubigeo"], u["prov_ubigeo"], u["dist_ubigeo"])
        data = await scraper.fetch_distrito(
            u["scope_id"], u["dep_ubigeo"], u["prov_ubigeo"], u["dist_ubigeo"]
        )
        async with counter_lock:
            if data is None:
                counter["fail"] += 1
                return
            distritos[k] = {
                "ambito":      "PERU" if u["scope_id"] == 1 else "EXTRANJERO",
                "region_cont": u["dep_name"],
                "prov_pais":   u["prov_name"],
                "dist_ciudad": u["dist_name"],
                **data,
            }
            counter["ok"] += 1
            done = counter["ok"] + counter["fail"]
            if counter["ok"] % save_every == 0:
                save_all(distritos)
                _log(f"  Progreso: ok={counter['ok']:,} fail={counter['fail']:,} "
                     f"({done}/{len(pending)} · {done/len(pending)*100:.1f}%) — guardado.")

    await asyncio.gather(*(worker(u) for u in pending))

    save_all(distritos)
    await scraper.aclose()

    _log(f"\nTerminado. OK: {counter['ok']:,} · Fallos: {counter['fail']:,}")
    if counter["fail"] > 0:
        _log("Vuelve a correr el script para reintentar los fallos (resume automático).")


if __name__ == "__main__":
    asyncio.run(main())
