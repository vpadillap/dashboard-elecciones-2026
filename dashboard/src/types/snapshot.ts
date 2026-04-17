// Contrato v1 entre el script Python (`_build_snapshot`) y el dashboard.
// Cambios no-retrocompatibles requieren `schema_version: 2`.

export interface Candidate {
  nombre: string
  partido: string
  votos_actuales: number
  proy_100: number
  pct_est: number
  margen_pp: number
  margen_jee_pp?: number
}

export interface Comparison {
  a: string
  b: string
  diff_pp: number
  p_orden_final: number
}

export interface KPIs {
  peru_inc: number
  peru_exc: number
  ext_inc: number
  ext_exc: number
  votos_actuales: number
  proy_total: number
  pct_pond_inc: number
  pct_pond_global: number
  actas_jee: number
  votos_jee_est: number
}

export interface Methodology {
  min_pct_proyeccion: number
  sigma_min: number
  fuentes_varianza: string[]
}

export interface Snapshot {
  schema_version: 1
  generated_at: string   // ISO 8601 con offset (-05:00)
  id_eleccion: string
  ronda: 1 | 2
  kpis: KPIs
  candidatos: Candidate[]
  comparaciones: Comparison[]
  metodologia: Methodology
}

export interface SnapshotIndexEntry {
  filename: string
  generated_at: string
  id_eleccion: string
  ronda: 1 | 2
  schema_version: number
  pct_pond_global: number | null
}

export interface SnapshotIndex {
  snapshots: SnapshotIndexEntry[]
}
