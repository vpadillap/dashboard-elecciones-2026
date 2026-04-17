import { useEffect, useMemo, useState } from 'react'
import type { Snapshot, SnapshotIndex } from './types/snapshot'
import { fetchIndex, fetchSnapshot } from './lib/snapshotLoader'
import { computeDiff } from './lib/diff'

import { Header } from './components/Header'
import { SnapshotNavigator } from './components/SnapshotNavigator'
import { HeroComparison } from './components/HeroComparison'
import { KPIBar } from './components/KPIBar'
import { ProjectionChart } from './components/ProjectionChart'
import { TimelineChart } from './components/TimelineChart'
import { OthersSection } from './components/OthersSection'
import { MethodologyModal } from './components/MethodologyModal'
import { CreditsFooter } from './components/CreditsFooter'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ready'
      index: SnapshotIndex
      current: Snapshot
      previous: Snapshot | null
      activeFilename: string
    }

export default function App() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const index = await fetchIndex()
        if (cancelled) return
        if (!index.snapshots || index.snapshots.length === 0) {
          setState({ kind: 'empty' })
          return
        }
        const latest   = index.snapshots[0]
        const previous = index.snapshots[1] ?? null
        const [current, prev] = await Promise.all([
          fetchSnapshot(latest.filename),
          previous ? fetchSnapshot(previous.filename) : Promise.resolve(null),
        ])
        if (cancelled) return
        setState({
          kind: 'ready',
          index,
          current,
          previous: prev,
          activeFilename: latest.filename,
        })
      } catch (err) {
        if (cancelled) return
        setState({ kind: 'error', message: (err as Error).message })
      }
    }
    boot()
    return () => { cancelled = true }
  }, [])

  async function selectSnapshot(filename: string) {
    if (state.kind !== 'ready') return
    const i = state.index.snapshots.findIndex(e => e.filename === filename)
    if (i < 0) return
    const prevEntry = state.index.snapshots[i + 1] ?? null
    try {
      const [current, previous] = await Promise.all([
        fetchSnapshot(filename),
        prevEntry ? fetchSnapshot(prevEntry.filename) : Promise.resolve(null),
      ])
      setState({
        kind: 'ready',
        index: state.index,
        current,
        previous,
        activeFilename: filename,
      })
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message })
    }
  }

  const diff = useMemo(() => {
    if (state.kind !== 'ready') return null
    return computeDiff(state.current, state.previous ?? undefined)
  }, [state])

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenMethodology={() => setModalOpen(true)} />

      {state.kind === 'loading' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted text-sm">Cargando datos…</p>
        </div>
      )}

      {state.kind === 'empty' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="text-xl md:text-2xl font-semibold text-ink mb-2">
              Aún no hay datos disponibles
            </h2>
            <p className="text-sm text-muted">
              No se encontraron capturas en <code>snapshots/index.json</code>.
              Cuando ONPE publique resultados, esta página los mostrará automáticamente.
            </p>
          </div>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-accent-neg mb-2">
              No se pudieron cargar los datos
            </h2>
            <p className="text-sm text-muted">{state.message}</p>
          </div>
        </div>
      )}

      {state.kind === 'ready' && diff && (
        <>
          <SnapshotNavigator
            entries={state.index.snapshots}
            activeFilename={state.activeFilename}
            onSelect={selectSnapshot}
          />
          <main className="flex-1">
            <HeroComparison snapshot={state.current} diff={diff} />
            <KPIBar snapshot={state.current} diff={diff} />
            <ProjectionChart snapshot={state.current} />
            <TimelineChart
              entries={state.index.snapshots}
              topNames={state.current.candidatos.slice(0, 2).map(c => c.nombre)}
            />
            <OthersSection snapshot={state.current} diff={diff} />
          </main>
        </>
      )}

      <CreditsFooter />
      <MethodologyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
