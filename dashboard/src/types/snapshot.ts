// Contrato v1 entre el script Python (`_build_snapshot`) y el dashboard.
// Cambios no-retrocompatibles requieren `schema_version: 2`.

export interface Candidate {
  nombre: string
  partido: string
  votos_actuales: number
  proy_100: number
  pct_est: number
  margen_pp: number
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
  // % actasContabilizadas nacional tal como lo publica ONPE (dato oficial).
  // Opcional: snapshots antiguos pueden no tenerlo.
  actas_contabilizadas_onpe?: number
  // Total del padrón electoral (electores hábiles). Opcional para backcompat.
  electores_habiles?: number
}

export interface Methodology {
  min_pct_proyeccion: number
  fuentes_varianza: string[]
  // Campos del modelo bayesiano jerárquico (snapshot v2+).
  modelo?: string
  prior_discount_a0?: number
  prior_strength_cap?: number
  sigma_matriz_transfer?: number
  mc_iterations?: number
  // Campo legacy del cascade (presente solo en snapshots antiguos).
  sigma_min?: number
}

export interface RegionCandidate {
  nombre: string
  votos_actuales: number
  pct_actual: number
  // Proyección del modelo bayesiano (% esperado al cierre del conteo).
  // Para regiones sin actas todavía, viene del prior R1 + matriz Ipsos.
  // Opcional: snapshots anteriores a 9-jun-2026 1PM no lo traen.
  pct_proyectado?: number
}

export interface Region {
  nombre: string                    // e.g. "LIMA", "ÁNCASH", "AMÉRICA"
  ambito: 'PERU' | 'EXTRANJERO'
  n_inc: number                     // distritos incluidos (>= MIN_PCT_PROYECCION)
  n_exc: number                     // distritos bajo el umbral
  pct_pond: number                  // cobertura ponderada por tamaño (0–100)
  ganador: string | null            // candidato con más votos actuales en la región
  ganador_proyectado?: string | null // candidato con mayor proyección en la región
  candidatos: RegionCandidate[]
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
  // Opcional: agregación por departamento/continente. Solo presente en
  // snapshots generados con scraper >= v2; ausente en históricos.
  regiones?: Region[]
}

export interface SnapshotIndexEntry {
  filename: string
  generated_at: string
  id_eleccion: string
  ronda: 1 | 2
  schema_version: number
  pct_pond_global: number | null
  actas_contabilizadas_onpe?: number | null
}

export interface SnapshotIndex {
  snapshots: SnapshotIndexEntry[]
}
