import type { Snapshot } from '../types/snapshot'
import {
  BarChart, Bar, XAxis, YAxis, ErrorBar, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList,
} from 'recharts'

interface Props {
  snapshot: Snapshot
}

// Paleta derivada de las 6 variables — evita introducir nuevos colores.
// Se alternan entre accent-positive, warning y text para distinguir candidatos
// sin salir del sistema.
const BAR_COLORS = ['#539987', '#EFA743', '#1C1C1C', '#525252', '#FF5A5F']

export function ProjectionChart({ snapshot }: Props) {
  // Hasta los primeros 6 candidatos para que el gráfico sea legible en móvil.
  const data = snapshot.candidatos.slice(0, 6).map((c, i) => ({
    nombre: shortName(c.nombre),
    pct: c.pct_est,
    margen: c.margen_pp,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }))

  return (
    <section className="px-4 py-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-base md:text-lg font-semibold text-ink mb-1">
          Proyección por candidato
        </h3>
        <p className="text-xs md:text-sm text-muted mb-4">
          Barras: % estimado al 100% · Líneas: margen de error (IC 95%)
        </p>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(28,28,28,0.08)" vertical={false} />
              <XAxis dataKey="nombre"
                     tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                     axisLine={{ stroke: 'rgba(28,28,28,0.2)' }}
                     tickLine={false}
                     interval={0}
                     height={40} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                     axisLine={false} tickLine={false}
                     tickFormatter={(v) => `${v}%`} />
              <Tooltip
                cursor={{ fill: 'rgba(28,28,28,0.05)' }}
                contentStyle={{
                  background: 'var(--bg)',
                  border: '1px solid rgba(28,28,28,0.15)',
                  borderRadius: 8,
                  color: 'var(--text)',
                }}
                formatter={(_value: unknown, _name: unknown, entry: { payload?: { pct: number; margen: number } }) => {
                  const p = entry?.payload
                  if (!p) return null
                  return [`${p.pct.toFixed(2)}% ± ${p.margen.toFixed(2)} pp`, 'Proyección']
                }}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                <ErrorBar dataKey="margen" width={6} strokeWidth={2} stroke="var(--text)" />
                <LabelList dataKey="pct"
                           position="top"
                           formatter={(v: number) => `${v.toFixed(1)}%`}
                           style={{ fill: 'var(--text)', fontSize: 11, fontWeight: 500 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return name
  // Primer nombre + primer apellido
  return `${parts[0]} ${parts[parts.length - 2]}`
}
