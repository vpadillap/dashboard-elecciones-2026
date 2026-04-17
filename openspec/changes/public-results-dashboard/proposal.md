## Why

El script `elecciones26.py` ya produce proyecciones nacionales sólidas con margen de error y probabilidad de orden final, pero su salida es solo consola + CSV. Para la **segunda vuelta** (dos candidatos únicamente) necesitamos un dashboard web público que cualquier persona pueda ver en el navegador, con una lectura visual inmediata, navegación histórica de snapshots, y explicación de la metodología para audiencias no técnicas.

La ventana para desarrollo es limitada (segunda vuelta típicamente 6-8 semanas después de la primera). El dashboard se prepara ahora para que solo requiera cambiar el `ID_ELECCION` y endpoints cuando ONPE publique los datos de la segunda vuelta.

## What Changes

- **Script Python** (`elecciones26.py`):
  - Añadir exportación de **snapshots JSON** en cada ejecución (timestamp + datos completos del reporte).
  - Los snapshots se guardan en `snapshots/` con nombre `snapshot_YYYYMMDD_HHMMSS.json`.
  - La estructura del snapshot debe ser consumible directamente por el frontend sin transformación.

- **Proyecto Node.js nuevo** (carpeta `dashboard/`):
  - Aplicación web estática (Vite + React o similar ligero), mobile-first con detalle extendido en desktop.
  - **One-pager** que muestra por defecto el último snapshot.
  - **Navegación temporal** entre snapshots mediante un selector/slider.
  - **Visual cues de diferencia** respecto al snapshot anterior (flechas ↑↓ de color, badges de Δ en pp).
  - **Enfoque en 2 candidatos** para segunda vuelta (comparativa cara a cara).
  - **Gráficos**: barras de % estimado con margen de error visible, evolución temporal entre snapshots.
  - **Modal de metodología** explicada para audiencia general (sin jerga estadística).
  - **Paleta de marca**: fondo `#FCF6ED`, texto `#1C1C1C`/`#525252`, negativo `#FF5A5F`, warning `#EFA743`, éxito `#539987`.
  - **Línea de créditos**: "Dashboard creado por Victor Antonio Padilla Prado" + icono LinkedIn, "Con el apoyo de Claude Code" + icono corazón.

- **Pipeline de release** (`npm run release`):
  - `npm run build` genera los assets estáticos (dist/).
  - `npm run release` crea un `.zip` con `dist/` + carpeta `snapshots/` lista para subir y descomprimir en cualquier hosting estático.

## Capabilities

### New Capabilities
- `snapshot-export`: El script Python produce snapshots JSON versionados con estructura estable y consumible por el frontend. Incluye metadatos (timestamp, id_eleccion, ronda), KPIs globales, proyección por candidato con margen, pares de comparación con P(orden final), y datos de fuentes de incertidumbre.
- `dashboard-web`: Aplicación web estática que carga los snapshots desde disco, renderiza el último por defecto, permite navegar snapshots anteriores, y muestra diferencias visuales entre snapshots consecutivos. Mobile-first, paleta fija, modal de metodología, créditos.
- `release-packaging`: Script `npm run release` que empaqueta build + snapshots en un `.zip` autocontenido desplegable por simple upload + unzip en servidor estático.

### Modified Capabilities
<!-- No hay specs preexistentes; ninguna capability modificada -->

## Impact

- **Código afectado**:
  - `elecciones26.py`: nueva función `_save_snapshot()` llamada al final de `analyze_and_report()`; nueva carpeta `snapshots/` con gitignore apropiado para producción (pero trackeable en dev si se desea).
  - Nuevo proyecto `dashboard/` con su propio `package.json`, estructura Vite/React, assets públicos.

- **Dependencias nuevas**:
  - Node.js ≥ 20, npm
  - Frontend: framework ligero (Vite + React), biblioteca de gráficos (Recharts o Chart.js), iconos (lucide-react), utilidad de zip (archiver o bestzip para Node).

- **Infraestructura**:
  - Hosting estático (cualquier: Netlify, Vercel, GitHub Pages, o VPS con Nginx).
  - Contrato entre script y web: formato JSON de snapshot congelado en v1 — cambios futuros requieren versionado.

- **Flujo operativo**:
  - Desarrollo: `python elecciones26.py` genera snapshots; `npm run dev` en `dashboard/` levanta servidor local que los lee.
  - Deploy: `npm run release` → subir zip → descomprimir en servidor → listo.
