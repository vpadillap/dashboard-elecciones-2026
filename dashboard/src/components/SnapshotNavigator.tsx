import type { SnapshotIndexEntry } from '../types/snapshot'
import { fmtDate } from '../lib/format'

interface Props {
  entries: SnapshotIndexEntry[]
  activeFilename: string | null
  onSelect: (filename: string) => void
}

export function SnapshotNavigator({ entries, activeFilename, onSelect }: Props) {
  const active = entries.find(e => e.filename === activeFilename) ?? entries[0]
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-black/5 bg-base">
      <label className="text-sm text-muted" htmlFor="snap-select">Captura:</label>
      <select
        id="snap-select"
        value={activeFilename ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="min-h-[44px] rounded-md border border-ink/20 bg-base px-3 py-1.5 text-sm text-ink
                   focus:outline-none focus:ring-2 focus:ring-ink/30"
      >
        {entries.map(e => (
          <option key={e.filename} value={e.filename}>
            {fmtDate(e.generated_at)} · {e.pct_pond_global != null ? `${e.pct_pond_global.toFixed(1)}%` : '—'}
          </option>
        ))}
      </select>
      {active && (
        <span className="text-xs text-muted">
          Actualizado: <span className="text-ink font-medium">{fmtDate(active.generated_at)}</span>
        </span>
      )}
    </div>
  )
}
