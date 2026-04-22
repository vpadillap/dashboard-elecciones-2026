import type { Snapshot, SnapshotIndex } from '../types/snapshot'

// Usa import.meta.env.BASE_URL para que la carga funcione bajo cualquier subpath.
const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

export async function fetchIndex(): Promise<SnapshotIndex> {
  const res = await fetch(`${base}/snapshots/index.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`No se pudo cargar index.json (${res.status})`)
  return res.json()
}

export async function fetchSnapshot(filename: string): Promise<Snapshot> {
  const res = await fetch(`${base}/snapshots/${filename}`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`No se pudo cargar ${filename} (${res.status})`)
  return res.json()
}
