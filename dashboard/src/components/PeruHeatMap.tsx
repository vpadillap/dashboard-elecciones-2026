import { useEffect, useMemo, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { Region, Snapshot } from '../types/snapshot'
import type { NameResolver } from '../lib/displayNames'

interface Props {
  snapshot: Snapshot
  resolveName: NameResolver
  candidateColors: Record<string, string>
  candidateIcons?: Record<string, string>
}

// Normaliza nombres para cruzar GeoJSON ↔ snapshot (quita acentos, mayúsculas,
// colapsa espacios). El GeoJSON de Perú usa "ANCASH" / "HUANUCO"; nuestro
// snapshot usa "ÁNCASH" / "HUÁNUCO".
const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase()

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const PERU_GEOJSON_URL  = `${BASE}/maps/peru-departamentos.geojson`
const WORLD_GEOJSON_URL = `${BASE}/maps/world-countries.geojson`

// Natural Earth usa "North America"/"South America"; nosotros agregamos como
// "AMÉRICA" en ONPE. Mapeamos los valores en inglés del GeoJSON al nombre del
// continente tal como aparece en el snapshot.
const CONTINENT_MAP: Record<string, string> = {
  'NORTH AMERICA': 'AMERICA',
  'SOUTH AMERICA': 'AMERICA',
  'EUROPE':        'EUROPA',
  'ASIA':          'ASIA',
  'AFRICA':        'AFRICA',
  'OCEANIA':       'OCEANIA',
}
// Continentes del GeoJSON que ignoramos (no hay votantes peruanos en ellos).
const SKIP_CONTINENTS = new Set(['ANTARCTICA', 'SEVEN SEAS (OPEN OCEAN)'])

// Filtra rings que cruzan el antimeridiano (rango de longitud > 180°). Sin
// esto, Russia y otras geometrías con piezas cerca de ±180° proyectan trozos
// fantasma en el borde opuesto del mapa (Chukchi aparece al lado izquierdo
// junto a América, p.ej.).
function stripWrappingRings(coords: number[][][]): number[][][] {
  return coords.filter(ring => {
    let minLon = Infinity, maxLon = -Infinity
    for (const pt of ring) {
      const lon = pt[0]
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
    }
    return (maxLon - minLon) < 180
  })
}

function cleanGeometry(g: Geometry): Geometry {
  if (g.type === 'Polygon') {
    return { type: 'Polygon', coordinates: stripWrappingRings(g.coordinates as number[][][]) }
  }
  if (g.type === 'MultiPolygon') {
    const polys = (g.coordinates as number[][][][])
      .map(p => stripWrappingRings(p))
      .filter(p => p.length > 0)
    return { type: 'MultiPolygon', coordinates: polys }
  }
  return g
}

type Mode = 'PERU' | 'EXTRANJERO'
type AnyFeature = Feature<Geometry, Record<string, unknown>>

export function PeruHeatMap({ snapshot, resolveName, candidateColors, candidateIcons }: Props) {
  // Si no hay regiones EXTRANJERO en el snapshot ocultamos el dropdown.
  const hasExt = useMemo(
    () => (snapshot.regiones ?? []).some(r => r.ambito === 'EXTRANJERO'),
    [snapshot]
  )
  // Detección de la versión del modelo:
  //   - "Nuevo" (Beta-Binomial + Monte Carlo, desde 1 PM del 9-jun-2026):
  //     el snapshot trae `metodologia.modelo` o trae `pct_proyectado` en al
  //     menos un candidato de las regiones.
  //   - "Antiguo" (cascade frecuentista): no trae ninguno de los dos.
  // Esto permite que el dashboard muestre textos compatibles con cada modelo.
  const isNewModel = useMemo(() => {
    const m = (snapshot.metodologia as { modelo?: string } | undefined)?.modelo
    if (m && m.toLowerCase().includes('beta')) return true
    for (const r of snapshot.regiones ?? []) {
      for (const c of r.candidatos ?? []) {
        if (c.pct_proyectado != null) return true
      }
    }
    return false
  }, [snapshot])
  const [mode, setMode] = useState<Mode>('PERU')
  // Cache de los dos GeoJSON: una vez fetchados, cambiar de modo es instantáneo
  // y no se muestra el placeholder "Cargando mapa..." que provocaba un salto
  // de layout al alternar entre Perú y Extranjero.
  type GeoMap = FeatureCollection<Geometry, Record<string, unknown>>
  const [geoCache, setGeoCache] = useState<Partial<Record<Mode, GeoMap>>>({})
  const [missing, setMissing]   = useState<Partial<Record<Mode, boolean>>>({})
  const geo = geoCache[mode] ?? null

  // Estado de selección sticky (click/tap) + hover (mouse only para resaltar).
  // Mantener ambos separados evita el bug en móvil donde tap/mouseleave dejaban
  // el panel vacío. El panel siempre lee `selected ?? hovered`.
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered]   = useState<string | null>(null)

  // Limpiar selección al cambiar de modo (no afecta layout porque no
  // desmontamos nada).
  useEffect(() => { setSelected(null); setHovered(null) }, [mode])

  // Pre-fetch del GeoJSON del extranjero al montar el componente. Así, cuando
  // el usuario abra el dropdown y cambie de vista, el cambio es instantáneo y
  // no aparece "Cargando mapa..." (que causaba salto de layout).
  useEffect(() => {
    if (!hasExt) return
    if (geoCache.EXTRANJERO || missing.EXTRANJERO) return
    let cancelled = false
    fetch(WORLD_GEOJSON_URL)
      .then(async r => {
        if (!r.ok) throw new Error('not found')
        const ct = r.headers.get('Content-Type') || ''
        if (ct.includes('html')) throw new Error('not geojson')
        return r.json() as Promise<GeoMap>
      })
      .then(data => {
        if (cancelled) return
        const processed = {
          ...data,
          features: data.features
            .filter(f => {
              const c = String(f.properties.CONTINENT ?? '').toUpperCase()
              return !SKIP_CONTINENTS.has(c) && CONTINENT_MAP[c]
            })
            .map(f => ({ ...f, geometry: cleanGeometry(f.geometry) })),
        }
        setGeoCache(prev => ({ ...prev, EXTRANJERO: processed }))
      })
      .catch(() => { if (!cancelled) setMissing(prev => ({ ...prev, EXTRANJERO: true })) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExt])

  // Cargar el GeoJSON del modo actual si aún no está en caché. No vaciamos el
  // geo previo durante el fetch — el mapa anterior se queda visible hasta que
  // el nuevo está listo.
  useEffect(() => {
    if (geoCache[mode] || missing[mode]) return
    let cancelled = false
    const url = mode === 'PERU' ? PERU_GEOJSON_URL : WORLD_GEOJSON_URL
    fetch(url)
      .then(async r => {
        if (!r.ok) throw new Error('not found')
        const ct = r.headers.get('Content-Type') || ''
        if (ct.includes('html')) throw new Error('not geojson')
        return r.json() as Promise<GeoMap>
      })
      .then(data => {
        if (cancelled) return
        const processed = mode === 'EXTRANJERO'
          ? {
              ...data,
              features: data.features
                .filter(f => {
                  const c = String(f.properties.CONTINENT ?? '').toUpperCase()
                  return !SKIP_CONTINENTS.has(c) && CONTINENT_MAP[c]
                })
                .map(f => ({ ...f, geometry: cleanGeometry(f.geometry) })),
            }
          : data
        setGeoCache(prev => ({ ...prev, [mode]: processed }))
      })
      .catch(() => { if (!cancelled) setMissing(prev => ({ ...prev, [mode]: true })) })
    return () => { cancelled = true }
  }, [mode, geoCache, missing])

  // Index de regiones del snapshot, según modo.
  const regByName = useMemo(() => {
    const m = new Map<string, Region>()
    const ambitoFiltro: Region['ambito'] = mode === 'PERU' ? 'PERU' : 'EXTRANJERO'
    for (const r of snapshot.regiones ?? []) {
      if (r.ambito === ambitoFiltro) m.set(norm(r.nombre), r)
    }
    return m
  }, [snapshot, mode])

  // Función que extrae la clave de región a partir de un feature del GeoJSON.
  // Para extranjero: si el país es Perú devolvemos clave vacía — el polígono
  // se dibuja en gris neutro pero NO se asocia a ningún continente del modelo.
  const keyFromFeature = useMemo(() => {
    if (mode === 'PERU') {
      return (f: AnyFeature) => norm(String(f.properties.NOMBDEP ?? ''))
    }
    return (f: AnyFeature) => {
      const iso = String(f.properties.ISO_A3 ?? '').toUpperCase()
      if (iso === 'PER') return ''
      const c = String(f.properties.CONTINENT ?? '').toUpperCase()
      return CONTINENT_MAP[c] ?? ''
    }
  }, [mode])

  // Proyección ajustada al GeoJSON visible. Mantenemos el viewBox del SVG
  // siempre a la altura del mapa de Perú (el más alto) para evitar saltos de
  // layout al cambiar de vista en el dropdown. En modo extranjero la
  // proyección se centra verticalmente dentro de una franja más baja.
  const { pathFn, width, height } = useMemo(() => {
    const w = 520, h = 640
    if (!geo) return { pathFn: null as any, width: w, height: h }
    const projection = geoMercator()
    if (mode === 'PERU') {
      projection.fitSize([w - 16, h - 16], geo)
    } else {
      // Franja de 320px centrada verticalmente en el contenedor de 640.
      const innerH = 320
      const yOffset = (h - innerH) / 2
      projection.fitExtent([[8, yOffset + 8], [w - 8, yOffset + innerH - 8]], geo)
    }
    return { pathFn: geoPath(projection), width: w, height: h }
  }, [geo, mode])

  // Centroides para íconos. Para Perú: uno por feature (departamento). Para
  // extranjero: uno por CONTINENTE (calculado como promedio simple de los
  // centroides de los países de ese continente — suficiente para colocar el
  // ícono dentro del área visible).
  const iconCentroids: { key: string; cx: number; cy: number }[] = useMemo(() => {
    if (!geo || !pathFn) return []
    if (mode === 'PERU') {
      return geo.features.map(f => {
        const [cx, cy] = pathFn.centroid(f) ?? [NaN, NaN]
        return { key: keyFromFeature(f), cx, cy }
      })
    }
    // Agrupar centroides por continente y promediar.
    const buckets: Record<string, { xs: number[]; ys: number[] }> = {}
    for (const f of geo.features) {
      const k = keyFromFeature(f)
      if (!k) continue
      const [cx, cy] = pathFn.centroid(f) ?? [NaN, NaN]
      if (!isFinite(cx) || !isFinite(cy)) continue
      ;(buckets[k] ??= { xs: [], ys: [] }).xs.push(cx)
      buckets[k].ys.push(cy)
    }
    return Object.entries(buckets).map(([key, { xs, ys }]) => ({
      key,
      cx: xs.reduce((a, b) => a + b, 0) / xs.length,
      cy: ys.reduce((a, b) => a + b, 0) / ys.length,
    }))
  }, [geo, pathFn, keyFromFeature, mode])

  if (!snapshot.regiones || snapshot.regiones.length === 0) return null
  // Si el GeoJSON del modo actual NO existe en producción y todavía no
  // tenemos otro cacheado, ocultamos toda la sección. Si ya teníamos uno
  // (p.ej. Perú cargó pero el del mundo falla), mantenemos visible el actual.
  if (missing[mode] && !geo) return null

  const activeKey = selected ?? hovered
  const activeReg = activeKey ? regByName.get(activeKey) : null

  return (
    <section className="px-4 py-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-6 mb-2">
          <h3 className="text-base md:text-lg font-semibold text-ink">
            Mapa de cobertura por región
          </h3>
          {hasExt && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs md:text-sm">
              <label htmlFor="map-mode" className="font-semibold text-ink whitespace-nowrap">
                Vista:
              </label>
              <select
                id="map-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="bg-transparent text-ink pr-5 py-0.5
                           focus:outline-none focus:ring-2 focus:ring-accent-neutral rounded cursor-pointer
                           hover:underline"
              >
                <option value="PERU">Perú · regiones</option>
                <option value="EXTRANJERO">Extranjero · continentes</option>
              </select>
            </div>
          )}
        </div>
        <p className="text-xs md:text-sm text-muted mb-3">
          Cada región se rellena con más intensidad cuando una mayor proporción
          de sus distritos ya tiene datos suficientes para entrar en la
          proyección. El color del borde y el ícono central indican el
          candidato proyectado como ganador en esa región. Toca o pasa el cursor
          sobre una región para ver el detalle.
        </p>
        {isNewModel && (
          <p className="text-xs text-muted mb-8 italic">
            Las regiones sin actas de segunda vuelta todavía se proyectan a
            partir de cómo votó cada distrito en la primera vuelta, ajustado
            por la matriz de transferencia primera vuelta → segunda vuelta de
            la encuesta Perú21/Ipsos (mayo 2026). Al pasar el cursor sobre una
            región verás explícitamente qué fuente está dominando su
            proyección.
          </p>
        )}
        {/* Contenedor con altura mínima fija para evitar saltos de layout al
            cambiar de modo. El mapa de Perú es el más alto (640 px viewBox);
            usamos un placeholder de altura equivalente a ese aspect ratio
            cuando aún no hay datos. */}
        {!geo ? (
          <div
            className="flex items-center justify-center text-sm text-muted"
            style={{ minHeight: 'min(640px, 80vw)' }}
          >
            Cargando mapa...
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full md:max-w-[520px] h-auto select-none"
              role="img"
              aria-label={mode === 'PERU'
                ? 'Mapa del Perú coloreado por cobertura electoral'
                : 'Mapamundi por continentes coloreado por cobertura del voto en el extranjero'}
            >
              {geo.features.map((f, i) => {
                const key     = keyFromFeature(f)
                const isPeru  = mode === 'EXTRANJERO'
                                && String(f.properties.ISO_A3 ?? '').toUpperCase() === 'PER'
                if (isPeru) {
                  // Perú aparece dibujado en el mapamundi pero NO forma parte
                  // del conjunto del voto en el extranjero. Lo pintamos con
                  // un gris neutro, sin borde, sin interacción.
                  return (
                    <path
                      key={i}
                      d={pathFn(f) ?? ''}
                      fill="rgba(28,28,28,0.04)"
                      stroke="rgba(28,28,28,0.18)"
                      strokeWidth={0.5}
                      style={{ pointerEvents: 'none' }}
                    />
                  )
                }
                const reg     = regByName.get(key)
                const total   = (reg?.n_inc ?? 0) + (reg?.n_exc ?? 0)
                const incFrac = total > 0 ? (reg!.n_inc / total) : 0
                const baseAlpha = (0.06 + incFrac * 0.42) * 0.75 * 0.95
                const isActive  = activeKey === key
                // Solo consideramos ganador si hay al menos UN voto registrado en
                // la región. Evita pintar el borde/ícono cuando todo está en 0%.
                // Con el modelo bayesiano (1 PM), ganador_proyectado se
                // pobla incluso para regiones sin actas R2 (fallback al
                // histórico de primera vuelta). Mostramos ganador siempre
                // que el snapshot lo provea. Si solo está ganador (votos
                // actuales), igual lo mostramos para snapshots viejos.
                const ganador = reg?.ganador_proyectado ?? reg?.ganador ?? null

                // En vista de continentes ocultamos las líneas divisorias entre
                // países y usamos el color del candidato como TINTE del fill
                // (con opacidad según cobertura). En Perú mantenemos el borde
                // coloreado y fill gris.
                // IMPORTANTE: el fill solo refleja cobertura — NO se oscurece en
                // hover/active para no alterar el significado del color. El
                // feedback de selección va exclusivamente por el borde.
                let fill: string, fillOpacity: number | undefined
                let stroke: string, strokeW: number
                // Tanto en Perú como en Extranjero usamos el mismo esquema:
                // fill gris por cobertura, borde coloreado por ganador. En el
                // mundo cada país muestra su propio borde — el continente
                // entero se distingue porque todos sus países comparten color
                // de borde. Es ruido visual menor a cambio de no lidiar con
                // artefactos de antimeridiano al unir polígonos.
                fill        = `rgba(28,28,28,${baseAlpha.toFixed(2)})`
                fillOpacity = undefined
                stroke      = ganador ? candidateColors[ganador] ?? '#666' : '#bbb'
                strokeW     = isActive ? 3.5 : 1.25

                return (
                  <path
                    key={i}
                    d={pathFn(f) ?? ''}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    style={{ cursor: 'pointer', transition: 'stroke-width 80ms, fill-opacity 80ms' }}
                    // Pointer events: cubre mouse, touch y stylus. Más confiable
                    // en móvil que onClick + mouseenter/mouseleave juntos.
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setSelected(s => s === key ? null : key)
                    }}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                  />
                )
              })}
              {/* Íconos del candidato ganador, centrados según el modo. */}
              {iconCentroids.map(({ key, cx, cy }, i) => {
                const reg = regByName.get(key)
                // Solo consideramos ganador si hay al menos UN voto registrado en
                // la región. Evita pintar el borde/ícono cuando todo está en 0%.
                // Con el modelo bayesiano (1 PM), ganador_proyectado se
                // pobla incluso para regiones sin actas R2 (fallback al
                // histórico de primera vuelta). Mostramos ganador siempre
                // que el snapshot lo provea. Si solo está ganador (votos
                // actuales), igual lo mostramos para snapshots viejos.
                const ganador = reg?.ganador_proyectado ?? reg?.ganador ?? null
                if (!ganador) return null
                const icon = candidateIcons?.[ganador]
                if (!icon) return null
                if (!isFinite(cx) || !isFinite(cy)) return null
                const size = 20
                return (
                  <image
                    key={`icon-${i}`}
                    href={icon}
                    x={cx - size / 2}
                    y={cy - size / 2}
                    width={size}
                    height={size}
                    style={{ pointerEvents: 'none' }}
                  />
                )
              })}
            </svg>

            <div className="w-full md:w-72 text-sm">
              {activeReg ? (
                <RegionDetail
                  region={activeReg}
                  resolveName={resolveName}
                  candidateColors={candidateColors}
                  isNewModel={isNewModel}
                />
              ) : (
                <Legend />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Legend() {
  return (
    <div className="space-y-3 text-muted">
      <div>
        <div className="text-ink font-medium mb-1">
          Distritos incluidos en la proyección
        </div>
        <div className="h-2 rounded"
             style={{
               background: 'linear-gradient(90deg, rgba(28,28,28,0.043), rgba(28,28,28,0.342))'
             }}
        />
        <div className="flex justify-between text-[11px] mt-0.5">
          <span>ninguno</span><span>todos</span>
        </div>
      </div>
      <div className="text-xs">
        Toca (o pasa el cursor) sobre una región para ver detalle. El color del
        borde y el ícono indican el candidato proyectado al frente.
      </div>
    </div>
  )
}

function RegionDetail({
  region, resolveName, candidateColors, isNewModel,
}: {
  region: Region
  resolveName: NameResolver
  candidateColors: Record<string, string>
  isNewModel: boolean
}) {
  return (
    <div>
      <div className="text-ink font-semibold mb-1">{region.nombre}</div>
      <div className="text-xs text-muted mb-2 space-y-1">
        <div>
          Porcentaje realmente contabilizado:{' '}
          <span className="text-ink font-medium tabular-nums">{region.pct_pond.toFixed(1)}%</span>
        </div>
        {isNewModel ? (
          <>
            <div>
              <span className="text-ink font-medium tabular-nums">{region.n_inc}</span>{' '}
              distritos con actas suficientes (sobre el umbral)
            </div>
            {/* Categorización presentacional. Con el modelo bayesiano, todos
                los distritos tienen al menos una proyección desde el histórico
                de la primera vuelta. La distinción es a nivel de región. */}
            <div>
              <span className="text-ink font-medium tabular-nums">
                {region.n_inc > 0 ? region.n_exc : 0}
              </span>{' '}
              combinan actas parciales con el histórico de primera vuelta
            </div>
            <div>
              <span className="text-ink font-medium tabular-nums">
                {region.n_inc > 0 ? 0 : region.n_exc}
              </span>{' '}
              proyectados completamente desde la primera vuelta
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-ink font-medium tabular-nums">{region.n_inc}</span>{' '}
              distritos incluidos en la proyección
            </div>
            <div>
              <span className="text-ink font-medium tabular-nums">
                {region.n_inc > 0 ? region.n_exc : 0}
              </span>{' '}
              derivados por similitud regional
            </div>
            <div>
              <span className="text-ink font-medium tabular-nums">
                {region.n_inc > 0 ? 0 : region.n_exc}
              </span>{' '}
              sin datos suficientes
            </div>
          </>
        )}
      </div>
      {region.ganador_proyectado && (
        <div className="text-xs text-muted mb-2">
          Proyectado: <span className="text-ink font-medium">{resolveName(region.ganador_proyectado)}</span>
        </div>
      )}
      {/* Notas contextuales solo aparecen para snapshots del modelo nuevo
          (1 PM del 9-jun-2026 en adelante). Los snapshots anteriores fueron
          generados con la metodología del cascade y no aplican estos textos. */}
      {isNewModel && region.n_inc === 0 && region.n_exc > 0 && (
        <div
          className="text-[11px] italic mb-2 px-2 py-1.5 rounded"
          style={{ background: 'rgba(28,28,28,0.06)', color: 'var(--text-muted)' }}
        >
          Esta región no tiene actas de segunda vuelta suficientes todavía. La
          proyección mostrada usa el comportamiento histórico de cada distrito
          en la primera vuelta, ajustado por la matriz de transferencia primera
          vuelta → segunda vuelta (Ipsos mayo 2026). Se actualizará
          automáticamente cuando lleguen actas reales.
        </div>
      )}
      {isNewModel && region.n_inc > 0 && region.n_exc > 0 && (
        <div
          className="text-[11px] italic mb-2 px-2 py-1.5 rounded"
          style={{ background: 'rgba(28,28,28,0.04)', color: 'var(--text-muted)' }}
        >
          La proyección combina las actas de segunda vuelta ya contabilizadas
          con el comportamiento histórico de primera vuelta para los distritos
          que aún tienen pocas actas.
        </div>
      )}
      <div className="space-y-1">
        {region.candidatos
          .slice()
          .sort((a, b) => (b.pct_proyectado ?? b.pct_actual) - (a.pct_proyectado ?? a.pct_actual))
          .map(c => {
            // Mostramos el porcentaje PROYECTADO (modelo bayesiano) cuando
            // está disponible. El % actual es lo realmente contado en R2
            // hasta ahora — útil pero no representa la proyección final.
            const pct = c.pct_proyectado ?? c.pct_actual
            return (
            <div key={c.nombre} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: candidateColors[c.nombre] ?? '#888' }}
                />
                <span className="truncate">{resolveName(c.nombre)}</span>
              </span>
              <span className="tabular-nums text-ink font-medium">{pct.toFixed(1)}%</span>
            </div>
            )
          })}
      </div>
    </div>
  )
}
