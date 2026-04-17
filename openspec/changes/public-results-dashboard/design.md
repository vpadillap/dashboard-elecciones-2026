## Context

El proyecto actual consiste en un único script Python (`elecciones26.py`) que scrapea la API de ONPE, procesa datos de nivel distrito/ciudad y produce un reporte en consola + 3 CSVs. La lógica estadística (cascada de varianza en 3 niveles, `P(orden final)`, cobertura ponderada, padrón por unidad) está madura.

La segunda vuelta de las elecciones 2026 en Perú involucrará únicamente a los dos candidatos más votados de la primera vuelta. Para dar valor público a los cálculos, se construirá un **dashboard web** alojado estáticamente, consumible desde cualquier dispositivo.

**Restricciones**:
- Hosting estático (sin backend propio): los snapshots deben ser servidos como archivos.
- Tiempo entre rondas es corto (~6-8 semanas): el dashboard debe funcionar con cambios mínimos para la segunda vuelta — idealmente solo editar `ID_ELECCION` en el script Python.
- Audiencia general: los usuarios no son estadísticos; el vocabulario y las cues visuales deben ser comprensibles.
- El script Python y el dashboard evolucionan **por separado**: el contrato entre ambos es el formato JSON del snapshot.

## Goals / Non-Goals

**Goals:**
- Separación estricta entre generación de datos (Python) y presentación (Node).
- Snapshots JSON versionados, inmutables una vez escritos, acumulados en disco.
- Dashboard que se renderiza íntegramente en cliente (sin servidor Node en producción).
- Experiencia móvil de primera (la mayoría del tráfico peruano en elecciones es móvil).
- Deploy por simple upload + unzip — cero configuración de servidor.
- Paleta y tono visual: **profesional, serio, moderno, cálido** — no tech-bro, no político.
- Reutilizable para la segunda vuelta sin refactor (solo cambian los datos de entrada).

**Non-Goals:**
- No habrá backend, base de datos, ni API dinámica.
- No se implementa autenticación, administración, o edición de datos desde la web.
- No se incluyen notificaciones push, servicio de email, o integración social más allá de los iconos de créditos.
- No se traduce a otros idiomas en esta iteración (solo español).
- No se rastrea analítica del usuario ni se usan cookies (privacidad por defecto).
- El dashboard **no** genera datos — solo renderiza lo que el script Python ya produjo.

## Decisions

### D1. Formato del snapshot: JSON plano, un archivo por ejecución

**Decisión**: Cada ejecución del script produce un archivo `snapshots/snapshot_YYYYMMDD_HHMMSS.json` con **todos los datos** del reporte (KPIs globales, proyección por candidato, pares comparativos, metadatos de fuentes).

**Alternativas consideradas**:
- **Un solo archivo acumulativo**: descartado — archivo crece sin control, cliente descargaría datos históricos innecesariamente.
- **Base de datos SQLite**: descartado — el hosting estático no lo soporta y el dashboard tendría que embeber un motor SQL (peso y complejidad).
- **CSV + transformación en cliente**: descartado — forzaría al cliente a replicar la lógica de agregación del script; el JSON "pre-cocinado" mantiene la verdad única en el script.

**Racional**: JSON por snapshot es inmutable, cacheable por CDN, versionable en git si se desea, y el frontend solo carga lo que navega el usuario (lazy loading por snapshot).

### D2. Índice de snapshots: `snapshots/index.json`

**Decisión**: El script Python mantiene/regenera un `snapshots/index.json` que lista todos los archivos existentes con metadatos mínimos (timestamp, id_eleccion, ronda, % cobertura). El frontend consulta solo el índice al iniciar y carga el snapshot específico bajo demanda.

**Racional**: Evita que el cliente tenga que hacer `directory listing` (que no existe en hosting estático) o probar archivos por fecha. El índice es la fuente de verdad de qué snapshots existen.

### D3. Stack frontend: Vite + React + TypeScript

**Decisión**: Vite para build, React 18 para UI, TypeScript para type-safety del contrato de snapshot.

**Alternativas consideradas**:
- **Astro**: excelente para contenido estático, pero el dashboard es dinámico (navegación entre snapshots, cálculo de diffs) — React es más natural.
- **Vue / Svelte**: válidos, pero React tiene mayor familiaridad general y bibliotecas de gráficos maduras.
- **HTML + JS vanilla**: tentador por la simplicidad, pero el management de estado (snapshot seleccionado, diffs calculados) y type-safety se vuelven engorrosos.

**Racional**: Vite + React es el estándar mainstream; TypeScript nos da un `Snapshot` interface que refleja exactamente lo que emite el script Python.

### D4. Gráficos: Recharts

**Decisión**: Usar Recharts para los gráficos (barras de % por candidato con márgenes, línea temporal de evolución).

**Alternativas**:
- **Chart.js**: maduro pero API imperativa, menos integrada con React.
- **Visx / D3 directo**: máxima flexibilidad pero sobredimensionado para 2 candidatos.
- **Apex Charts**: pesado.

**Racional**: Recharts es declarativo, componible en JSX, ligero, y soporta los dos tipos de gráfico necesarios (bar con error bars, line chart).

### D5. Visual cues de diferencia

**Decisión**:
- Cada valor numérico clave (%, margen, proyección absoluta) se compara con el valor equivalente del **snapshot anterior** (cuando existe).
- Los valores ya vienen redondeados desde el script (pct/margen a 2 decimales, proyecciones a entero).
- Si el valor redondeado **subió** respecto al anterior → flecha ↑ verde `#539987` + delta.
- Si **bajó** → flecha ↓ roja `#FF5A5F` + delta.
- Si el redondeado es **idéntico** → sin flecha.
- En el primer snapshot (sin anterior) no se muestran cues.

**Racional**: El redondeo en el script ya filtra el ruido numérico (un cambio de 0.003 pp no aparece en la UI porque ambos se redondean a la misma cifra). Cualquier diferencia visible post-redondeo es información real y merece ser señalada.

### D6. Mobile-first con breakpoint de desktop

**Decisión**:
- Layout base: columna única, tipografía grande, tap targets ≥ 44px.
- Breakpoint desktop `≥ 1024px`: layout de 2 columnas (izquierda: comparativa y KPIs; derecha: gráficos extendidos, tabla detallada, historial).
- Se usa CSS nativo (`@media`) en combinación con Tailwind CSS para utilidades; **no** se usan librerías de UI pesadas.

**Racional**: Audience insight — el consumo de resultados electorales en Perú ocurre mayoritariamente en móvil. Diseño móvil debe ser primera clase, no "versión reducida".

### D7. Paleta de colores (congelada en CSS variables)

**Decisión**: Variables CSS globales en `:root`:
```css
--bg: #FCF6ED;
--text: #1C1C1C;
--text-muted: #525252;
--accent-negative: #FF5A5F;
--accent-warning: #EFA743;
--accent-positive: #539987;
```
Todos los componentes consumen solo estas variables — no hay colores hardcoded en componentes.

**Racional**: Paleta consistente, fácil ajuste global, permite modo oscuro futuro con solo sobrescribir las variables.

### D8. Enfoque 2 candidatos (segunda vuelta) pero robusto a N

**Decisión**: El layout principal (comparativa cara-a-cara) asume 2 candidatos, pero el snapshot siempre lleva el array completo (tal como lo emite el script en primera vuelta con 10+ candidatos). El dashboard muestra top 2 en el layout hero y el resto en una sección "Otros" colapsable (relevante en primera vuelta, irrelevante en segunda).

**Racional**: Mismo código sirve ambas rondas. La UI se auto-adapta: con 2 candidatos la sección "Otros" queda vacía y no se renderiza; con N > 2 aparece naturalmente.

### D9. Release pipeline

**Decisión**: `npm run release` ejecuta:
1. `npm run build` — genera `dist/` con Vite.
2. Copia `../snapshots/` a `dist/snapshots/` (para que sean servidos junto a la app).
3. Empaqueta `dist/` completo en `release/elecciones-YYYYMMDD-HHMMSS.zip`.

Se usa `archiver` (Node) como biblioteca de zip — funciona en Windows, Mac, Linux.

**Racional**: El `.zip` contiene *todo* lo necesario (HTML, JS, CSS, snapshots/*.json, index.json). Deploy = upload + unzip a `public_html/`. Cero configuración.

### D10. Contrato de snapshot (v1)

**Decisión**: El archivo JSON sigue esta estructura (congelada en v1):
```json
{
  "schema_version": 1,
  "generated_at": "2026-04-15T22:31:05-05:00",
  "id_eleccion": "10",
  "ronda": 1,
  "kpis": {
    "peru_inc": 1800, "peru_exc": 54,
    "ext_inc": 240, "ext_exc": 12,
    "votos_actuales": 12345678,
    "proy_total": 15234567,
    "pct_pond_inc": 78.42,
    "pct_pond_global": 76.10,
    "actas_jee": 127,
    "votos_jee_est": 43210
  },
  "candidatos": [
    {
      "nombre": "...",
      "partido": "...",
      "votos_actuales": 5432100,
      "proy_100": 6543210,
      "pct_est": 42.15,
      "margen_pp": 1.23,
      "margen_jee_pp": 1.41
    }
  ],
  "comparaciones": [
    { "a": "...", "b": "...", "diff_pp": 3.12, "p_orden_final": 0.98 }
  ],
  "metodologia": {
    "min_pct_proyeccion": 10.0,
    "sigma_min": 0.02,
    "fuentes_varianza": ["excluidas", "fraccion_restante_incluidas", "jee_anulacion_opcional"]
  }
}
```

Cambios futuros no-retrocompatibles requieren `schema_version: 2` y el dashboard debe detectar y manejar ambas.

### D11. Modal de metodología

**Decisión**: Un solo botón `Cómo se calcula` en el header → abre un modal (overlay modal, no página separada) con texto largo explicativo dividido en 4-5 secciones con subtítulos. El contenido es estático (no se genera desde el snapshot; está en un componente React).

**Racional**: Un modal permite que el usuario lea sin perder contexto visual del dashboard. El contenido no varía entre snapshots; vive en el código del dashboard.

## Risks / Trade-offs

- **[Riesgo] ONPE cambia endpoints/estructura entre rondas** → Mitigación: el contrato de snapshot aísla al dashboard. Solo hay que actualizar el script Python (endpoints) y regenerar snapshots; el frontend no se toca.

- **[Riesgo] Número creciente de snapshots afecta carga del índice** → Mitigación: `index.json` es ligero (~100 bytes por entrada). Incluso con 500 snapshots (más que suficiente para una campaña completa) ronda los 50 KB. Además se puede paginar si fuera necesario en una futura v2.

- **[Trade-off] Sin backend = sin analítica en tiempo real** → Aceptado. La privacidad por defecto es un valor del proyecto; si se necesita medir visitas se puede añadir un analytics minimalista (Plausible/Umami) sin backend propio.

- **[Trade-off] Snapshots se sirven directamente desde disco** → Aceptado. Si el sitio tiene picos de tráfico, un CDN (Cloudflare gratuito, por ejemplo) cachea los JSON sin problema.

- **[Riesgo] El formato del snapshot cambia y rompe snapshots antiguos** → Mitigación: `schema_version` obliga al dashboard a degradar con gracia (mostrar warning "snapshot antiguo, campos limitados") en vez de fallar.

- **[Riesgo] Subir el zip manualmente a un servidor es propenso a olvidos** → Mitigación: documentar el proceso en `README.md` del dashboard. Futuro: GitHub Action que auto-despliega a GitHub Pages al hacer push.

## Migration Plan

No aplica migración en sentido estricto — es un feature add-on. El script Python preserva su comportamiento actual; la nueva función de snapshot se llama al final de `analyze_and_report()`.

**Pasos de despliegue inicial**:
1. Añadir `_save_snapshot()` al script; verificar que genera JSON válido en `snapshots/`.
2. Crear proyecto `dashboard/` con Vite+React+TS; implementar componentes principales.
3. Configurar `npm run release`; probar que el zip contiene todo lo necesario.
4. Deploy inicial a staging (Netlify drop, Vercel, o VPS de prueba).
5. Iteración visual hasta conformidad.
6. Cuando ONPE publique datos de segunda vuelta: actualizar `ID_ELECCION` y endpoints, regenerar snapshots, re-release.
