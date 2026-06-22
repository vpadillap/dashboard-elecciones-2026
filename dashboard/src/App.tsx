import { useEffect, useMemo, useState } from 'react'
import type { Snapshot, SnapshotIndex } from './types/snapshot'
import { fetchIndex, fetchSnapshot } from './lib/snapshotLoader'
import { computeDiff } from './lib/diff'
import { fetchDisplayNames, buildResolver, type NameResolver } from './lib/displayNames'
import { fetchDisplayConfig, type DisplayConfig } from './lib/displayConfig'

import { Header } from './components/Header'
import { SnapshotNavigator } from './components/SnapshotNavigator'
import { HeroComparison } from './components/HeroComparison'
import { KPIBar } from './components/KPIBar'
import { ProjectionChart } from './components/ProjectionChart'
import { FullTable } from './components/FullTable'
import { PeruHeatMap } from './components/PeruHeatMap'
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
      compareFilename: string | null  // null = sin comparación (snapshot más antiguo)
      resolveName: NameResolver
      config: DisplayConfig
    }

export default function App() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const [index, dict, config] = await Promise.all([
          fetchIndex(), fetchDisplayNames(), fetchDisplayConfig(),
        ])
        if (cancelled) return
        if (!index.snapshots || index.snapshots.length === 0) {
          setState({ kind: 'empty' })
          return
        }
        const resolveName = buildResolver(dict)
        const latest  = index.snapshots[0]
        const current = await fetchSnapshot(latest.filename)
        if (cancelled) return
        setState({
          kind: 'ready',
          index,
          current,
          previous: null,
          activeFilename:  latest.filename,
          compareFilename: null,
          resolveName,
          config,
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
    // Al cambiar de captura, por defecto comparar con la inmediatamente anterior.
    const defaultPrev = state.index.snapshots[i + 1] ?? null
    try {
      const [current, previous] = await Promise.all([
        fetchSnapshot(filename),
        defaultPrev ? fetchSnapshot(defaultPrev.filename) : Promise.resolve(null),
      ])
      setState({
        ...state,
        current,
        previous,
        activeFilename:  filename,
        compareFilename: defaultPrev?.filename ?? null,
      })
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message })
    }
  }

  async function selectCompare(filename: string | null) {
    if (state.kind !== 'ready') return
    try {
      const previous = filename ? await fetchSnapshot(filename) : null
      setState({ ...state, previous, compareFilename: filename })
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
            compareFilename={state.compareFilename}
            onSelectActive={selectSnapshot}
            onSelectCompare={selectCompare}
          />
          <main className="flex-1">
            <HeroComparison snapshot={state.current} previous={state.previous} diff={diff} resolveName={state.resolveName} config={state.config.hero_comparison} />
            <KPIBar snapshot={state.current} diff={diff} />
            <ProjectionChart snapshot={state.current} resolveName={state.resolveName} candidateColors={state.config.candidate_colors} />
            <FullTable snapshot={state.current} previous={state.previous} diff={diff} resolveName={state.resolveName} />
            <PeruHeatMap snapshot={state.current} resolveName={state.resolveName} candidateColors={state.config.candidate_colors} candidateIcons={state.config.candidate_icons} />
          </main>
        </>
      )}

      <CreditsFooter />
      <MethodologyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
