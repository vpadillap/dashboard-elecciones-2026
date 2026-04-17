## ADDED Requirements

### Requirement: Script produces a JSON snapshot on every run

The script `elecciones26.py` SHALL write a JSON snapshot file to `snapshots/snapshot_YYYYMMDD_HHMMSS.json` at the end of every successful `analyze_and_report()` execution. The filename timestamp MUST reflect the script's completion time in local timezone (America/Lima).

#### Scenario: Snapshot is written after successful analysis

- **WHEN** the script completes `analyze_and_report()` without error
- **THEN** a new file exists at `snapshots/snapshot_{timestamp}.json` where timestamp matches the completion time
- **AND** the file contains valid JSON parseable by `json.load()`
- **AND** the `snapshots/` directory is created if it does not already exist

#### Scenario: Snapshot is not written when analysis fails

- **WHEN** `analyze_and_report()` aborts early because `self.all_data` is empty
- **THEN** no snapshot file is created
- **AND** the script prints a message indicating no data was collected

### Requirement: Snapshot schema version 1 contract

The snapshot JSON MUST conform to schema version 1 with these top-level fields: `schema_version`, `generated_at`, `id_eleccion`, `ronda`, `kpis`, `candidatos`, `comparaciones`, `metodologia`. Additional fields MAY be present but MUST NOT change the meaning of existing fields.

#### Scenario: Schema version is always present

- **WHEN** a snapshot is generated
- **THEN** it includes `"schema_version": 1` at the top level
- **AND** it includes `generated_at` as an ISO 8601 timestamp with timezone offset

#### Scenario: KPIs block contains required metrics

- **WHEN** a snapshot is generated
- **THEN** the `kpis` object contains: `peru_inc`, `peru_exc`, `ext_inc`, `ext_exc`, `votos_actuales`, `proy_total`, `pct_pond_inc`, `pct_pond_global`, `actas_jee`, `votos_jee_est`
- **AND** each numeric field is a number (not a string)

#### Scenario: Candidates block is an ordered array

- **WHEN** a snapshot is generated
- **THEN** `candidatos` is an array sorted by `pct_est` descending
- **AND** each candidate entry contains: `nombre`, `partido`, `votos_actuales`, `proy_100`, `pct_est`, `margen_pp`
- **AND** when JEE actas are present, each candidate entry also contains `margen_jee_pp`

#### Scenario: Comparisons block lists ordered pairs

- **WHEN** a snapshot is generated and there are at least 2 candidates
- **THEN** `comparaciones` contains at minimum the pair (rank 1, rank 2)
- **AND** each pair entry contains: `a` (candidate name), `b` (candidate name), `diff_pp`, `p_orden_final`
- **AND** `p_orden_final` is a probability in the range [0, 1]

### Requirement: Snapshot index is regenerated on every run

The script SHALL maintain a `snapshots/index.json` file that lists all snapshots present in the directory, sorted by `generated_at` descending (newest first). The index MUST be regenerated on every script run by scanning the directory — not by appending, to handle manual additions or deletions.

#### Scenario: Index reflects all present snapshots

- **WHEN** the script completes and multiple snapshot files exist in `snapshots/`
- **THEN** `snapshots/index.json` contains an entry for each `snapshot_*.json` file
- **AND** the entries are sorted by `generated_at` descending
- **AND** each entry contains at minimum: `filename`, `generated_at`, `id_eleccion`, `ronda`, `pct_pond_global`

#### Scenario: Manually deleted snapshot is removed from index

- **WHEN** a user deletes a snapshot file manually and re-runs the script
- **THEN** the new `index.json` does not include the deleted file
- **AND** no error is raised by the script for the missing file

### Requirement: Snapshots are immutable once written

Once written, a snapshot file SHALL NOT be modified or overwritten by subsequent script runs. Each run produces a new file with a distinct timestamp.

#### Scenario: Two consecutive runs produce two files

- **WHEN** the script is run twice with at least 1 second between completions
- **THEN** two distinct `snapshot_*.json` files exist
- **AND** neither file has been modified (same content as when written)
