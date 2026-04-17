## 1. Python snapshot export

- [x] 1.1 Add `SNAPSHOTS_DIR = "snapshots"` constant and `SCHEMA_VERSION = 1` at the top of `elecciones26.py`
- [x] 1.2 Implement `_build_snapshot(resumen, kpis, comparaciones, metodologia) -> dict` that constructs the v1 schema payload
- [x] 1.3 Implement `_save_snapshot(snapshot: dict)` that writes `snapshots/snapshot_YYYYMMDD_HHMMSS.json` (create dir if missing, local America/Lima time)
- [x] 1.4 Implement `_update_snapshot_index()` that scans `snapshots/` and writes `snapshots/index.json` sorted by `generated_at` descending
- [x] 1.5 Wire `_build_snapshot → _save_snapshot → _update_snapshot_index` at the end of `analyze_and_report()` after existing CSV export
- [x] 1.6 Capture KPIs (peru_inc/exc, ext_inc/exc, votos_actuales, proy_total, pct_pond_inc/global, actas_jee, votos_jee_est) into a dict passed to `_build_snapshot`
- [x] 1.7 Capture the ordered `resumen` rows into the `candidatos` array with all required fields (`nombre`, `partido`, `votos_actuales`, `proy_100`, `pct_est`, `margen_pp`, optional `margen_jee_pp`)
- [x] 1.8 Capture the top pairs comparison (with `p_orden_final`) into the `comparaciones` array
- [x] 1.9 Include methodology metadata block (`min_pct_proyeccion`, `sigma_min`, `fuentes_varianza` list)
- [ ] 1.10 Manual test: run the script, verify `snapshots/snapshot_*.json` and `snapshots/index.json` exist and parse as JSON; run twice and verify two files exist
- [ ] 1.11 Manually delete one snapshot file and re-run; verify `index.json` no longer lists it

## 2. Dashboard project scaffold

- [x] 2.1 Create `dashboard/` directory at the project root
- [x] 2.2 Initialize with `npm create vite@latest . -- --template react-ts` inside `dashboard/`
- [x] 2.3 Install runtime dependencies: `recharts`, `lucide-react`
- [x] 2.4 Install dev dependencies: `archiver`, `fs-extra`, `tailwindcss`, `postcss`, `autoprefixer`
- [x] 2.5 Configure Tailwind (`tailwind.config.js`, `postcss.config.js`, base CSS)
- [x] 2.6 Define CSS variables for the color palette in `src/index.css` (`--bg`, `--text`, `--text-muted`, `--accent-negative`, `--accent-warning`, `--accent-positive`)
- [x] 2.7 Extend the Tailwind theme to reference those CSS variables (so `bg-base`, `text-base`, `text-muted`, `accent-neg`, `accent-warn`, `accent-pos` work)
- [x] 2.8 Configure Vite `base: './'` so assets use relative paths (deployable under any subpath)
- [x] 2.9 Add `public/snapshots/.gitkeep` and a symlink or build-time copy from `../snapshots/` for local dev

## 3. Dashboard: snapshot types and loader

- [x] 3.1 Create `src/types/snapshot.ts` with TypeScript interfaces matching the v1 schema (`Snapshot`, `SnapshotIndexEntry`, `Candidate`, `Comparison`, `KPIs`, `Methodology`)
- [x] 3.2 Create `src/lib/snapshotLoader.ts` with `fetchIndex()` and `fetchSnapshot(filename)` functions using `fetch()`
- [x] 3.3 Create `src/lib/diff.ts` with `computeDiff(current: Snapshot, previous?: Snapshot)` returning per-metric deltas and direction flags
- [x] 3.4 Add `DiffCue` React component that renders ↑ (green `#539987`) when delta > 0, ↓ (red `#FF5A5F`) when delta < 0, nothing when delta === 0. Compares the rounded values as emitted by the script.

## 4. Dashboard: core layout & state

- [ ] 4.1 Build `App.tsx` that loads the index on mount, picks the latest snapshot, fetches it, and stores both current and previous snapshot in state
- [ ] 4.2 Implement top-level layout: header with "¿Cómo se calcula?" button, snapshot navigator, main content area, footer with credits
- [ ] 4.3 Add "no snapshots available" fallback screen when `index.json` is empty
- [ ] 4.4 Add loading state while snapshots fetch

## 5. Dashboard: hero comparison (2 candidates)

- [ ] 5.1 Build `HeroComparison.tsx` that displays top-2 candidates side-by-side with names, parties, `pct_est` large, margen, `proy_100`
- [ ] 5.2 Wire `DiffCue` to each metric (pct_est, margen, proy_100)
- [ ] 5.3 Show `p_orden_final` between the two candidates as a prominent indicator (percentage + plain-language label like "ventaja firme" / "muy apretado")
- [ ] 5.4 On mobile: stack vertically. On desktop: side-by-side with vs. divider

## 6. Dashboard: KPIs row and charts

- [ ] 6.1 Build `KPIBar.tsx` showing `pct_pond_global`, votos_actuales, distritos incluidos, actas_jee (if > 0) with diff cues
- [ ] 6.2 Build `ProjectionChart.tsx` using Recharts BarChart with ErrorBar for margen
- [ ] 6.3 Build `TimelineChart.tsx` (desktop-only, or mobile in a collapsed section) plotting `pct_est` of top candidates across all snapshots in the index
- [ ] 6.4 Build `OthersSection.tsx` that only renders when there are >2 candidates — collapsible list of remaining candidates with their pct_est

## 7. Dashboard: snapshot navigator

- [ ] 7.1 Build `SnapshotNavigator.tsx` — a dropdown or slider showing all snapshots sorted newest-first with date/time labels
- [ ] 7.2 When user selects a snapshot, update state: set it as current, fetch the previous (if any) for diff computation
- [ ] 7.3 Display the active snapshot's `generated_at` prominently near the navigator
- [ ] 7.4 Handle edge case: selecting the oldest snapshot → render without diff cues

## 8. Dashboard: methodology modal

- [ ] 8.1 Build `MethodologyModal.tsx` as an accessible overlay (focus trap, Escape to close, click outside to close)
- [ ] 8.2 Write the methodology content in 4-5 plain-language sections (obtención de datos, qué es una proyección, qué significa el margen, qué es P(orden final), por qué se excluyen algunas unidades)
- [ ] 8.3 Wire the header button to open the modal; test keyboard navigation

## 9. Dashboard: credits footer

- [ ] 9.1 Build `CreditsFooter.tsx` with two lines: "Dashboard creado por Victor Antonio Padilla Prado" + LinkedIn icon link, "Con el apoyo de Claude Code" + heart icon
- [ ] 9.2 Use `lucide-react` icons (`Linkedin`, `Heart`)
- [ ] 9.3 LinkedIn link → `https://www.linkedin.com/in/vpadillaprado/` — opens in new tab with `target="_blank"` and `rel="noopener noreferrer"`

## 10. Dashboard: responsive polish

- [ ] 10.1 Test on 360×640 viewport — verify no horizontal scroll, tap targets ≥ 44px, body text ≥ 16px
- [ ] 10.2 Test on 1024×768 viewport — verify 2-column layout activates
- [ ] 10.3 Test on 1920×1080 viewport — verify layout remains centered with comfortable max-width
- [ ] 10.4 Audit for colors: grep the built CSS/JS for any hex codes outside the palette; fix violations

## 11. Release packaging

- [ ] 11.1 Create `scripts/release.mjs` that runs `npm run build`, copies `../snapshots/` → `dist/snapshots/`, and packages `dist/` into `release/elecciones-YYYYMMDD-HHMMSS.zip` using `archiver`
- [ ] 11.2 Add to `package.json`: `"release": "node scripts/release.mjs"`
- [ ] 11.3 Handle missing snapshots folder gracefully (write placeholder empty index)
- [ ] 11.4 Add `release/` and `dist/` to `.gitignore` inside `dashboard/`
- [ ] 11.5 Manual test: run `npm run release`, extract the zip to a temp dir, serve with `npx serve` and verify the dashboard loads with the latest snapshot

## 12. Documentation

- [ ] 12.1 Write `dashboard/README.md` with sections: Development (npm install, npm run dev), Build, Release, Deploy (upload zip + unzip + done)
- [ ] 12.2 Document the snapshot schema v1 contract in `dashboard/README.md` or a separate `SCHEMA.md`
- [ ] 12.3 Add a note in the project root README (or create one) pointing to the dashboard and explaining the snapshot → dashboard data flow
- [ ] 12.4 Document the second-round switch procedure: edit `ID_ELECCION` in `elecciones26.py`, regenerate snapshots, run `npm run release`, deploy

## 13. End-to-end validation

- [ ] 13.1 Fresh project clone → `python elecciones26.py` → verify snapshot generated
- [ ] 13.2 `cd dashboard && npm install && npm run dev` → verify dashboard loads the snapshot locally
- [ ] 13.3 Modify one snapshot value manually, re-run script, verify dashboard shows diff cues between old and new snapshot
- [ ] 13.4 `npm run release` → extract zip → serve statically → verify deployed version works identically
- [ ] 13.5 Test all three required scenarios from the `dashboard-web` spec: mobile, desktop, methodology modal
