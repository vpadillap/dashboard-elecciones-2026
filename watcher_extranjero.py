"""
Watcher simple: dispara `elecciones26.py` cada hora.

Sin chequeos a endpoints externos. La cadencia ahora es lo suficientemente
espaciada para no requerir disparos "inteligentes" en respuesta a cambios
del extranjero.

Persistencia: `watcher_state.json` guarda la última ejecución del scraper
para que reinicios respeten el intervalo.

Uso:
    python watcher_extranjero.py
"""

import asyncio
import ctypes
import datetime
import json
import os
import subprocess
import sys

# ── Configuración ────────────────────────────────────────────────────────────
RUN_INTERVAL_SEC = 60 * 60         # 1 hora entre corridas

STATE_FILE     = "watcher_state.json"
SCRAPER_SCRIPT = "elecciones26.py"

# Asegurar UTF-8 en consola para acentos.
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass


def _now_str() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _log(msg: str) -> None:
    print(f"[{_now_str()}] {msg}", flush=True)


# ── Anti-suspensión del sistema (Windows) ────────────────────────────────────
# SetThreadExecutionState le dice a Windows que mantenga el sistema activo
# mientras este proceso esté vivo. NO mantenemos el display encendido a
# propósito (la pantalla puede apagarse normalmente).
_ES_CONTINUOUS       = 0x80000000
_ES_SYSTEM_REQUIRED  = 0x00000001

def prevent_sleep_start() -> None:
    if sys.platform != "win32":
        return
    try:
        ctypes.windll.kernel32.SetThreadExecutionState(
            _ES_CONTINUOUS | _ES_SYSTEM_REQUIRED
        )
        _log("Sistema configurado para NO suspenderse mientras corra el watcher.")
    except Exception as e:
        _log(f"[!] No se pudo prevenir la suspensión: {e}")

def prevent_sleep_stop() -> None:
    if sys.platform != "win32":
        return
    try:
        ctypes.windll.kernel32.SetThreadExecutionState(_ES_CONTINUOUS)
    except Exception:
        pass


# ── Estado persistido ────────────────────────────────────────────────────────

def load_state() -> dict:
    if not os.path.exists(STATE_FILE):
        return {"last_run": None}
    try:
        with open(STATE_FILE, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"last_run": None}


def save_state(state: dict) -> None:
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        _log(f"[!] No se pudo guardar estado: {e}")


# ── Ejecutor del scraper ─────────────────────────────────────────────────────

def run_scraper() -> None:
    _log(f"==> Disparando {SCRAPER_SCRIPT}")
    try:
        subprocess.run([sys.executable, SCRAPER_SCRIPT], check=False)
        _log(f"<== {SCRAPER_SCRIPT} terminó.")
    except Exception as e:
        _log(f"[!] Error ejecutando {SCRAPER_SCRIPT}: {e}")


# ── Loop principal ───────────────────────────────────────────────────────────

async def main() -> None:
    state = load_state()
    last_run_iso = state.get("last_run")
    last_run = (datetime.datetime.fromisoformat(last_run_iso)
                if last_run_iso else datetime.datetime.min)

    while True:
        ahora = datetime.datetime.now()
        elapsed = (ahora - last_run).total_seconds()

        if elapsed >= RUN_INTERVAL_SEC:
            run_scraper()
            last_run = datetime.datetime.now()
            state["last_run"] = last_run.isoformat()
            save_state(state)
            sleep_for = RUN_INTERVAL_SEC
        else:
            sleep_for = RUN_INTERVAL_SEC - elapsed

        next_run = datetime.datetime.now() + datetime.timedelta(seconds=sleep_for)
        mins = int(sleep_for // 60)
        _log(f"Próxima corrida: {next_run.strftime('%Y-%m-%d %H:%M:%S')} "
             f"(en ~{mins} min). Durmiendo...")

        await asyncio.sleep(sleep_for)


if __name__ == "__main__":
    prevent_sleep_start()
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        _log("Interrumpido por usuario.")
    finally:
        prevent_sleep_stop()
