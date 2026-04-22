import type { Snapshot, Candidate } from '../types/snapshot'

// Direction: 1 = subió, -1 = bajó, 0 = igual (incluye "sin snapshot previo").
export type Direction = -1 | 0 | 1

export interface Delta {
  current: number
  previous: number | null
  delta: number
  direction: Direction
}

function toDelta(current: number, previous: number | undefined | null): Delta {
  if (previous == null || Number.isNaN(previous)) {
    return { current, previous: null, delta: 0, direction: 0 }
  }
  const delta = current - previous
  const direction: Direction = delta > 0 ? 1 : delta < 0 ? -1 : 0
  return { current, previous, delta, direction }
}

export interface CandidateDiff {
  pct_est:         Delta
  margen_pp:       Delta
  proy_100:        Delta
  votos_actuales:  Delta
  margen_jee_pp?:  Delta
}

export interface KPIDiffs {
  pct_pond_global: Delta
  pct_pond_inc:    Delta
  votos_actuales:  Delta
  proy_total:      Delta
  actas_jee:       Delta
  votos_jee_est:   Delta
}

export interface Diff {
  candidatos: Map<string, CandidateDiff>   // key: candidato.nombre
  kpis:       KPIDiffs
}

function diffCandidate(curr: Candidate, prev?: Candidate): CandidateDiff {
  const d: CandidateDiff = {
    pct_est:        toDelta(curr.pct_est,        prev?.pct_est),
    margen_pp:      toDelta(curr.margen_pp,      prev?.margen_pp),
    proy_100:       toDelta(curr.proy_100,       prev?.proy_100),
    votos_actuales: toDelta(curr.votos_actuales, prev?.votos_actuales),
  }
  if (curr.margen_jee_pp != null) {
    d.margen_jee_pp = toDelta(curr.margen_jee_pp, prev?.margen_jee_pp)
  }
  return d
}

export function computeDiff(current: Snapshot, previous?: Snapshot): Diff {
  const candidatos = new Map<string, CandidateDiff>()
  const prevByName = new Map<string, Candidate>()
  if (previous) {
    for (const c of previous.candidatos) prevByName.set(c.nombre, c)
  }
  for (const c of current.candidatos) {
    candidatos.set(c.nombre, diffCandidate(c, prevByName.get(c.nombre)))
  }

  const k = current.kpis
  const p = previous?.kpis
  const kpis: KPIDiffs = {
    pct_pond_global: toDelta(k.pct_pond_global, p?.pct_pond_global),
    pct_pond_inc:    toDelta(k.pct_pond_inc,    p?.pct_pond_inc),
    votos_actuales:  toDelta(k.votos_actuales,  p?.votos_actuales),
    proy_total:      toDelta(k.proy_total,      p?.proy_total),
    actas_jee:       toDelta(k.actas_jee,       p?.actas_jee),
    votos_jee_est:   toDelta(k.votos_jee_est,   p?.votos_jee_est),
  }

  return { candidatos, kpis }
}
