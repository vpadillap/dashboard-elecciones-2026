import type { Snapshot } from '../types/snapshot'
import type { Diff } from '../lib/diff'
import { DiffCue } from './DiffCue'
import { fmtInt, fmtPct } from '../lib/format'

interface Props {
  snapshot: Snapshot
  diff: Diff
}

export function KPIBar({ snapshot, diff }: Props) {
  const { kpis } = snapshot
  const distritos_inc = kpis.peru_inc + kpis.ext_inc
  const distritos_exc = kpis.peru_exc + kpis.ext_exc

  return (
    <section className="px-4 py-4 md:py-6 border-y border-black/5 bg-ink/[0.02]">
      <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <KPI label="Cobertura global"
             value={fmtPct(kpis.pct_pond_global, 1)}
             hint={`Incluye ${distritos_inc.toLocaleString('es-PE')} unidades contabilizadas`}
             cue={<DiffCue delta={diff.kpis.pct_pond_global} format={(n) => `${n.toFixed(2)} pp`} />} />
        <KPI label="Votos contabilizados"
             value={fmtInt(kpis.votos_actuales)}
             hint="Votos válidos actuales"
             cue={<DiffCue delta={diff.kpis.votos_actuales} format={(n) => fmtInt(Math.round(n))} />} />
        <KPI label="Distritos incluidos"
             value={fmtInt(distritos_inc)}
             hint={distritos_exc > 0 ? `${distritos_exc.toLocaleString('es-PE')} excluidos (<10% actas)` : ''} />
        {kpis.actas_jee > 0 ? (
          <KPI label="Actas impugnadas (JEE)"
               value={fmtInt(kpis.actas_jee)}
               hint={`~${fmtInt(kpis.votos_jee_est)} votos en disputa`}
               cue={<DiffCue delta={diff.kpis.actas_jee} format={(n) => fmtInt(Math.round(n))} />} />
        ) : (
          <KPI label="Proyección total"
               value={fmtInt(kpis.proy_total)}
               hint="Votos válidos al 100%"
               cue={<DiffCue delta={diff.kpis.proy_total} format={(n) => fmtInt(Math.round(n))} />} />
        )}
      </div>
    </section>
  )
}

interface KPIProps {
  label: string
  value: string
  hint?: string
  cue?: React.ReactNode
}

function KPI({ label, value, hint, cue }: KPIProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl md:text-2xl font-semibold tabular-nums text-ink">{value}</span>
        {cue}
      </div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  )
}
