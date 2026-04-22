import type { SnapshotIndexEntry } from '../types/snapshot'
import { fmtDate } from '../lib/format'

interface Props {
  entries: SnapshotIndexEntry[]
  activeFilename: string | null
  compareFilename: string | null
  onSelectActive: (filename: string) => void
  onSelectCompare: (filename: string | null) => void
}

function labelFor(e: SnapshotIndexEntry): string {
  // ONPE publica el % con 3 decimales — mantenemos la misma precisión para que
  // el usuario pueda emparejarlo con la UI oficial. Si por algún motivo no hay
  // dato oficial, caemos al pct_pond_global calculado localmente (con ~).
  const actas = e.actas_contabilizadas_onpe
  const pct   = typeof actas === 'number' ? `${actas.toFixed(3)}%` :
                (e.pct_pond_global != null ? `~${e.pct_pond_global.toFixed(1)}%` : '—')
  return `${fmtDate(e.generated_at)} · ${pct} actas`
}

export function SnapshotNavigator({
  entries, activeFilename, compareFilename, onSelectActive, onSelectCompare,
}: Props) {
  const active = entries.find(e => e.filename === activeFilename)
  const activeIdx = entries.findIndex(e => e.filename === activeFilename)
  // Las posibles comparaciones son solo capturas cronológicamente anteriores.
  const compareOptions = activeIdx >= 0 ? entries.slice(activeIdx + 1) : []

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-t border-b border-muted py-2.5 flex flex-col md:flex-row md:items-center gap-1 md:gap-6 text-xs">
        <InlineSelect
          label="Captura"
          value={activeFilename ?? ''}
          onChange={onSelectActive}
          options={entries.map(e => ({ value: e.filename, label: labelFor(e) }))}
        />

        {compareOptions.length > 0 && (
          <InlineSelect
            label="Comparar con"
            value={compareFilename ?? ''}
            onChange={(v) => onSelectCompare(v || null)}
            options={[
              { value: '', label: 'Sin comparación' },
              ...compareOptions.map(e => ({ value: e.filename, label: labelFor(e) })),
            ]}
          />
        )}

        {active && (
          <span className="text-xs text-muted md:ml-auto">
            <span className="font-semibold text-ink">Última captura:</span>{' '}
            {fmtDate(active.generated_at)}
          </span>
        )}
        </div>
      </div>
    </div>
  )
}

interface InlineSelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}

function InlineSelect({ label, value, onChange, options }: InlineSelectProps) {
  const id = `snap-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <label htmlFor={id} className="font-semibold text-ink whitespace-nowrap">
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-ink pr-5 py-0.5
                   focus:outline-none focus:ring-2 focus:ring-accent-neutral rounded cursor-pointer
                   hover:underline"
      >
        {options.map(o => (
          <option key={o.value || '_none'} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
