import type { Snapshot } from '../types/snapshot'
import type { Diff } from '../lib/diff'
import { DiffCue } from './DiffCue'
import { fmtInt } from '../lib/format'

interface Props {
  snapshot: Snapshot
  diff: Diff
}

export function KPIBar({ snapshot, diff }: Props) {
  const { kpis } = snapshot
  const distritos_inc = kpis.peru_inc + kpis.ext_inc
  const distritos_exc = kpis.peru_exc + kpis.ext_exc

  const proyHint = typeof kpis.electores_habiles === 'number' && kpis.electores_habiles > 0
    ? `de ${fmtInt(kpis.electores_habiles)} electores hábiles`
    : 'Votos válidos al 100%'

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-b border-muted grid grid-cols-2 md:grid-cols-4">
          <KPI label="Proyección votos válidos"
               value={fmtInt(kpis.proy_total)}
               hint={proyHint}
               cue={<DiffCue delta={diff.kpis.proy_total} format={(n) => fmtInt(Math.round(n))} size="sm" />}
               className="md:border-r border-muted" />
          <KPI label="Votos contabilizados"
               value={fmtInt(kpis.votos_actuales)}
               hint="Votos válidos actuales"
               cue={<DiffCue delta={diff.kpis.votos_actuales} format={(n) => fmtInt(Math.round(n))} size="sm" />}
               className="md:border-r border-muted" />
          <KPI label="Distritos incluidos"
               value={fmtInt(distritos_inc)}
               hint={distritos_exc > 0 ? `${distritos_exc.toLocaleString('es-PE')} excluidos (<10% actas)` : ''}
               className="border-t md:border-t-0 md:border-r border-muted" />
          {kpis.actas_jee > 0 ? (
            <KPI label="Actas impugnadas (JEE)"
                 value={fmtInt(kpis.actas_jee)}
                 hint={`~${fmtInt(kpis.votos_jee_est)} votos en disputa`}
                 cue={<DiffCue delta={diff.kpis.actas_jee} format={(n) => fmtInt(Math.round(n))} size="sm" />}
                 className="border-t md:border-t-0 border-muted" />
          ) : (
            <KPI label="Cobertura"
                 value={`${kpis.pct_pond_global.toFixed(1)}%`}
                 hint="Avance ponderado del conteo"
                 className="border-t md:border-t-0 border-muted" />
          )}
        </div>
      </div>
    </section>
  )
}

interface KPIProps {
  label: string
  value: string
  hint?: string
  cue?: React.ReactNode
  className?: string
}

function KPI({ label, value, hint, cue, className = '' }: KPIProps) {
  return (
    <div className={`px-3 md:px-5 py-4 md:py-5 text-center ${className}`}>
      <div className="text-[10px] md:text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 flex items-baseline justify-center gap-2 flex-wrap">
        <span className="text-xl md:text-2xl font-bold tabular-nums text-ink">{value}</span>
        {cue}
      </div>
      {hint && <div className="mt-1 text-[11px] md:text-xs text-muted">{hint}</div>}
    </div>
  )
}
