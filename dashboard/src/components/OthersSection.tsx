import { useState } from 'react'
import type { Snapshot } from '../types/snapshot'
import type { Diff } from '../lib/diff'
import { DiffCue } from './DiffCue'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fmtInt, fmtPP } from '../lib/format'

interface Props {
  snapshot: Snapshot
  diff: Diff
}

export function OthersSection({ snapshot, diff }: Props) {
  const others = snapshot.candidatos.slice(2)
  const [open, setOpen] = useState(false)

  if (others.length === 0) return null

  return (
    <section className="px-4 py-4 md:py-6">
      <div className="mx-auto max-w-6xl border border-black/10 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left
                     bg-ink/[0.02] hover:bg-ink/[0.05] focus:outline-none
                     focus:ring-2 focus:ring-ink/20 min-h-[44px]"
          aria-expanded={open}
        >
          <span className="text-sm md:text-base font-medium text-ink">
            Otros candidatos ({others.length})
          </span>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {open && (
          <ul className="divide-y divide-black/5">
            {others.map(c => {
              const d = diff.candidatos.get(c.nombre)
              return (
                <li key={c.nombre} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm md:text-base text-ink truncate">{c.nombre}</div>
                    <div className="text-xs text-muted truncate">{c.partido}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-base md:text-lg font-semibold tabular-nums text-ink">
                        {c.pct_est.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted tabular-nums">
                        ±{fmtPP(c.margen_pp)} · {fmtInt(c.proy_100)}
                      </div>
                    </div>
                    {d && <DiffCue delta={d.pct_est} format={(n) => `${n.toFixed(2)} pp`} />}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
