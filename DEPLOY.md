# Despliegue del scraper — Elecciones Perú 2026

Este paquete se instala en el VPS para que un cronjob actualice los
snapshots JSON que consume el dashboard. El servidor **no** corre Node ni
Vite — solo sirve los archivos estáticos del dashboard (empaquetados por
separado) y ejecuta este script Python periódicamente.

## Requisitos

- Python 3.11+
- Acceso SSH con permisos al home del usuario web

## Setup (una sola vez)

Asumiendo CloudPanel con el sitio `padillaprado.me` y el dashboard ya
desplegado en `/home/padillaprado/htdocs/padillaprado.me/elecciones2026/`:

```bash
cd /home/padillaprado
unzip /ruta/al/elecciones-scraper-<stamp>.zip
cd elecciones-scraper

# Crear venv e instalar dependencias
python3 -m venv venv
venv/bin/pip install -r requirements.txt

# Symlink para que los snapshots del script caigan directo en el folder
# del dashboard (sin necesidad de copiar después).
ln -s /home/padillaprado/htdocs/padillaprado.me/elecciones2026/snapshots ./snapshots
```

El script mantiene sus propios CSVs y cachés (`cache_*.json`,
`election_*.csv`) en `/home/padillaprado/elecciones-scraper/`. No se tocan
desde el dashboard.

## Cronjob

Edita el crontab del usuario web:

```bash
crontab -e
```

Añade una línea eligiendo la cadencia `N` según la fase del conteo (p. ej.
cada 5 min en día de elección, cada 15 min después):

```
*/N * * * * cd /home/padillaprado/elecciones-scraper && venv/bin/python elecciones26.py >> fetch.log 2>&1
```

## Diagnóstico

- **Ver los últimos runs:**
  ```
  tail -f /home/padillaprado/elecciones-scraper/fetch.log
  ```
- **Listar snapshots actualizados:**
  ```
  ls -lht /home/padillaprado/htdocs/padillaprado.me/elecciones2026/snapshots/
  ```
- **Probar manualmente (sin esperar al cron):**
  ```
  cd /home/padillaprado/elecciones-scraper
  venv/bin/python elecciones26.py
  ```

## Actualizar el scraper

Si cambia la lógica del `.py`, reemplaza `elecciones26.py` en
`/home/padillaprado/elecciones-scraper/` con la nueva versión. El venv, los
CSVs cache y el symlink se mantienen intactos.
