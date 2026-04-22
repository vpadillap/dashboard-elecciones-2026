import { useEffect, useState } from 'react'
import type { Snapshot } from '../types/snapshot'
import type { NameResolver } from '../lib/displayNames'
import { fmtInt } from '../lib/format'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList, Cell,
} from 'recharts'

interface Props {
  snapshot: Snapshot
  resolveName: NameResolver
}

// Leemos los dos tonos del sistema directamente de las variables CSS (index.css)
// para que cualquier ajuste de paleta se refleje automáticamente en la gráfica.
// Se alternan: accent-positive (verde), luego accent-neutral (azul), y así.
function useThemeColors() {
  const [colors, setColors] = useState({ a: '#5D9878', b: '#12547D' })
  useEffect(() => {
    const root = document.documentElement
    const styles = getComputedStyle(root)
    const a = styles.getPropertyValue('--accent-positive').trim() || '#5D9878'
    const b = styles.getPropertyValue('--accent-neutral').trim() || '#12547D'
    setColors({ a, b })
  }, [])
  return colors
}

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window === 'undefined' ? false : window.innerWidth < breakpoint
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return isMobile
}

export function ProjectionChart({ snapshot, resolveName }: Props) {
  const isMobile = useIsMobile()
  const { a: colorA, b: colorB } = useThemeColors()

  const data = snapshot.candidatos.slice(0, 6).map((c, i) => ({
    nombre:   resolveName(c.nombre),
    pct:      c.pct_est,
    margen:   c.margen_pp,
    proy_100: c.proy_100,
    fill:     i % 2 === 0 ? colorA : colorB,
  }))

  return (
    <section className="px-4 py-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-base md:text-lg font-semibold text-ink mb-1">
          Proyección por candidato
        </h3>
        <p className="text-xs md:text-sm text-muted mb-4">
          Barras: % estimado al 100%. El margen de error aparece en el tooltip.
        </p>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(28,28,28,0.12)" vertical={false} />
              <XAxis
                dataKey="nombre"
                hide={isMobile}
                tick={{ fill: 'var(--text)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(28,28,28,0.25)' }}
                tickLine={false}
                interval={0}
                height={40}
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                     axisLine={false} tickLine={false}
                     tickFormatter={(v) => `${v}%`} />
              <Tooltip
                cursor={{ fill: 'rgba(28,28,28,0.06)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const p = payload[0].payload as {
                    nombre: string; pct: number; margen: number; proy_100: number
                  }
                  return (
                    <div className="bg-base border border-ink/25 rounded-md px-3 py-2 text-sm
                                    shadow-md text-ink">
                      <div className="font-medium mb-1">{p.nombre}</div>
                      <div className="tabular-nums">
                        {p.pct.toFixed(2)}% ± {p.margen.toFixed(2)} pp
                      </div>
                      <div className="tabular-nums text-muted text-xs mt-0.5">
                        Votos proyectados: {fmtInt(p.proy_100)}
                      </div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
                <LabelList dataKey="pct"
                           position="top"
                           formatter={(v) => typeof v === 'number' ? `${v.toFixed(2)}%` : ''}
                           style={{ fill: 'var(--text)', fontSize: 11, fontWeight: 500 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
