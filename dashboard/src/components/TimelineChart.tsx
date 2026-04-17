import { useEffect, useState } from 'react'
import type { SnapshotIndexEntry, Snapshot } from '../types/snapshot'
import { fetchSnapshot } from '../lib/snapshotLoader'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'

interface Props {
  entries: SnapshotIndexEntry[]
  topNames: string[]   // nombres de los candidatos a graficar (generalmente top-2)
}

const LINE_COLORS = ['#539987', '#EFA743', '#1C1C1C', '#525252', '#FF5A5F']

export function TimelineChart({ entries, topNames }: Props) {
  const [series, setSeries] = useState<{ ts: string; label: string; [k: string]: number | string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      // Cargar en orden cronológico ascendente (más antiguo primero)
      const ordered = [...entries].reverse()
      const snaps = await Promise.all(
        ordered.map(e => fetchSnapshot(e.filename).catch(() => null as Snapshot | null))
      )
      if (cancelled) return
      const rows = snaps.map((s, i) => {
        const row: { ts: string; label: string; [k: string]: number | string } = {
          ts: ordered[i].generated_at,
          label: new Date(ordered[i].generated_at)
            .toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                       timeZone: 'America/Lima' }),
        }
        if (s) {
          for (const name of topNames) {
            const c = s.candidatos.find(x => x.nombre === name)
            if (c) row[name] = c.pct_est
          }
        }
        return row
      })
      setSeries(rows)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [entries, topNames])

  if (entries.length < 2) return null

  return (
    <section className="hidden md:block px-4 py-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-base md:text-lg font-semibold text-ink mb-1">
          Evolución entre capturas
        </h3>
        <p className="text-xs md:text-sm text-muted mb-4">
          % estimado de los candidatos principales en cada snapshot
        </p>
        <div className="h-64 md:h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted text-sm">
              Cargando serie…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="rgba(28,28,28,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                       axisLine={{ stroke: 'rgba(28,28,28,0.2)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                       axisLine={false} tickLine={false}
                       tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg)',
                    border: '1px solid rgba(28,28,28,0.15)',
                    borderRadius: 8,
                    color: 'var(--text)',
                  }}
                  formatter={(v: number) => `${v.toFixed(2)}%`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {topNames.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}
                        connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  )
}
