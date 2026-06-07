import { useState } from 'react'
import type { Snapshot } from '../types/snapshot'
import type { Diff, Delta } from '../lib/diff'
import type { NameResolver } from '../lib/displayNames'
import { DiffCue } from './DiffCue'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fmtInt, fmtPP } from '../lib/format'

interface Props {
  snapshot: Snapshot
  diff: Diff
  resolveName: NameResolver
}

// Ranura con altura fija para el indicador de modificación: cuando no hay
// cambio se renderiza un espacio vacío para mantener la cuadrícula alineada.
function DiffSlot({
  delta, format, align = 'left',
}: {
  delta?: Delta
  format: (n: number) => string
  align?: 'left' | 'right'
}) {
  const justify = align === 'right' ? 'justify-end' : 'justify-start'
  return (
    <div className={`h-4 flex items-center ${justify}`}>
      {delta ? <DiffCue delta={delta} format={format} size="sm" /> : null}
    </div>
  )
}

export function FullTable({ snapshot, diff, resolveName }: Props) {
  const [open, setOpen] = useState(false)
  const rows = snapshot.candidatos

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-t border-muted py-6 md:py-8">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className="w-full flex items-center justify-between gap-2
                       text-ink focus:outline-none focus:ring-2 focus:ring-accent-neutral rounded"
          >
            <h3 className="text-base md:text-lg font-semibold text-ink">Vista completa</h3>
            <span className="text-muted">
              {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          {open && (
            <>
              {/* Móvil */}
              <ul className="md:hidden mt-4 divide-y divide-muted border-t border-muted">
                {rows.map(c => {
                  const d = diff.candidatos.get(c.nombre)
                  return (
                    <li key={c.nombre} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ink truncate">
                            {resolveName(c.nombre)}
                          </div>
                          <div className="text-[11px] uppercase tracking-wider text-muted truncate">
                            {c.partido}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-semibold tabular-nums text-ink">
                            {c.pct_est.toFixed(2)}%
                          </div>
                          <DiffSlot delta={d?.pct_est} format={(n) => `${n.toFixed(2)} pp`} align="right" />
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted">Votos proyectados</div>
                          <div className="text-ink font-medium tabular-nums">{fmtInt(c.proy_100)}</div>
                          <DiffSlot delta={d?.proy_100} format={(n) => fmtInt(Math.round(n))} />
                        </div>
                        <div className="text-right">
                          <div className="text-muted">Margen</div>
                          <div className="text-ink font-medium tabular-nums">±{fmtPP(c.margen_pp)}</div>
                          <DiffSlot delta={d?.margen_pp} format={(n) => `${n.toFixed(2)} pp`} align="right" />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Escritorio */}
              <div className="hidden md:block mt-4 overflow-x-auto border-t border-muted">
                <table className="w-full text-sm">
                  <thead className="text-ink border-b border-muted">
                    <tr>
                      <th className="text-left font-semibold px-2 py-3">Candidato</th>
                      <th className="text-right font-semibold px-2 py-3">% Est.</th>
                      <th className="text-right font-semibold px-2 py-3">Margen ± pp</th>
                      <th className="text-right font-semibold px-2 py-3">Votos proyectados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {rows.map(c => {
                      const d = diff.candidatos.get(c.nombre)
                      return (
                        <tr key={c.nombre} className="align-top">
                          <td className="px-2 py-3">
                            <div className="text-ink font-medium">{resolveName(c.nombre)}</div>
                            <div className="text-[11px] uppercase tracking-wider text-muted mt-0.5">
                              {c.partido}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="text-ink tabular-nums font-medium">
                              {c.pct_est.toFixed(2)}%
                            </div>
                            <DiffSlot delta={d?.pct_est} format={(n) => `${n.toFixed(2)} pp`} align="right" />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="text-ink tabular-nums">±{fmtPP(c.margen_pp)}</div>
                            <DiffSlot delta={d?.margen_pp} format={(n) => `${n.toFixed(2)} pp`} align="right" />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="text-ink tabular-nums">{fmtInt(c.proy_100)}</div>
                            <DiffSlot delta={d?.proy_100} format={(n) => fmtInt(Math.round(n))} align="right" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
