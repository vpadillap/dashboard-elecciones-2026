## ADDED Requirements

### Requirement: Dashboard is a static single-page application

The dashboard SHALL be deliverable as static assets (HTML, CSS, JS, JSON) that run entirely in the browser without requiring a backend server. All data MUST be loaded via `fetch()` from snapshot JSON files served as static files.

#### Scenario: Dashboard loads without a server-side application

- **WHEN** the built dashboard is placed in any static file server root (Nginx, Apache, GitHub Pages, etc.)
- **THEN** opening `index.html` loads the dashboard successfully
- **AND** snapshots are fetched from `/snapshots/*.json` via HTTP GET only
- **AND** no server-side rendering, API calls, or dynamic endpoints are required

### Requirement: Dashboard loads the latest snapshot by default

On first load, the dashboard SHALL read `snapshots/index.json`, select the most recent entry, fetch the corresponding snapshot file, and render it as the active view.

#### Scenario: Most recent snapshot is displayed on load

- **WHEN** the user visits the dashboard URL
- **THEN** the dashboard fetches `snapshots/index.json`
- **AND** the first entry (most recent by `generated_at`) is loaded as the active snapshot
- **AND** the rendered page shows data from that snapshot

#### Scenario: No snapshots available

- **WHEN** `snapshots/index.json` exists but contains zero entries
- **THEN** the dashboard displays a friendly message: "Aún no hay datos disponibles"
- **AND** no error or crash occurs

### Requirement: User can navigate historical snapshots

The dashboard SHALL provide a control (dropdown, slider, or equivalent) that lists all snapshots from the index and allows the user to select any one for display. Selecting a snapshot MUST re-render the view with its data and update the diff comparisons to the previous snapshot in chronological order.

#### Scenario: Navigating to an older snapshot

- **WHEN** the user selects a non-latest snapshot from the navigation control
- **THEN** the dashboard fetches that snapshot file
- **AND** the rendered view updates to show its data
- **AND** visual cues compare against the snapshot that preceded it chronologically (not against the latest)

#### Scenario: Navigating to the oldest snapshot

- **WHEN** the user selects the earliest available snapshot
- **THEN** the dashboard renders it without diff indicators (no previous snapshot exists)
- **AND** no error is raised

### Requirement: Visual diff cues compared to previous snapshot

Every numeric metric displayed (candidate `pct_est`, `margen_pp`, `proy_100`, global KPIs) SHALL show a visual cue indicating change direction versus the previous snapshot, using the project color palette. The comparison MUST use the rounded values as emitted by the script (the dashboard does not round further).

#### Scenario: Value increased

- **WHEN** the current metric value is greater than the same metric in the previous snapshot (post-rounding from the script)
- **THEN** the metric is rendered with an up arrow "↑" icon and delta label (e.g., "+0.32 pp", "+1,204 votos")
- **AND** the arrow uses color `#539987` (positive green)

#### Scenario: Value decreased

- **WHEN** the current metric value is less than the same metric in the previous snapshot
- **THEN** the metric is rendered with a down arrow "↓" icon and delta label (e.g., "−0.18 pp")
- **AND** the arrow uses color `#FF5A5F` (negative red)

#### Scenario: Value unchanged

- **WHEN** the current metric value equals the previous (rounded values identical)
- **THEN** no arrow is rendered next to that metric
- **AND** only the current value is displayed

#### Scenario: No previous snapshot available

- **WHEN** the active snapshot is the oldest in the index (no prior snapshot exists)
- **THEN** no diff cues are rendered for any metric
- **AND** only current values are displayed

### Requirement: Mobile-first responsive layout

The dashboard SHALL render correctly and remain fully usable on mobile viewports (≥ 360px width). On desktop viewports (≥ 1024px width) the layout MAY present an expanded version with additional columns, larger charts, and tabular detail.

#### Scenario: Mobile portrait viewport

- **WHEN** the dashboard is opened on a 360×640 viewport
- **THEN** all content is visible via vertical scroll only (no horizontal scroll)
- **AND** tap targets are at least 44×44 CSS pixels
- **AND** typography remains legible (body text ≥ 16px)

#### Scenario: Desktop viewport

- **WHEN** the dashboard is opened on a viewport ≥ 1024px wide
- **THEN** the layout uses at least a 2-column arrangement
- **AND** charts expand to use available horizontal space
- **AND** additional detail tables visible (province-level breakdown, full comparison matrix)

### Requirement: Charts show projection with margin of error

The dashboard SHALL render at least one chart showing candidate projected percentages with their margin of error visually represented (error bars, confidence band, or equivalent).

#### Scenario: Bar chart with error bars

- **WHEN** the active snapshot is rendered
- **THEN** a bar chart displays each candidate's `pct_est` as bar height
- **AND** an error bar or confidence interval reflects `margen_pp` (± pp)
- **AND** the bars use candidate-distinguishable colors that remain legible against the `#FCF6ED` background

### Requirement: Fixed color palette applied consistently

All UI elements SHALL use only these colors (and their transparency variants), exposed as CSS variables: background `#FCF6ED`, primary text `#1C1C1C`, muted text `#525252`, negative/alert `#FF5A5F`, warning/info `#EFA743`, positive/success `#539987`.

#### Scenario: No colors outside the palette

- **WHEN** the dashboard is audited for colors
- **THEN** every color used is one of the 6 palette colors (including opacity variants)
- **AND** every component references colors via CSS variables, not hardcoded hex values

### Requirement: Methodology modal explains calculations in plain language

The dashboard SHALL include a button in the header labelled "¿Cómo se calcula?" (or equivalent). Clicking it opens a modal overlay explaining the methodology in terms accessible to non-statisticians.

#### Scenario: Modal opens and closes

- **WHEN** the user clicks the methodology button
- **THEN** a modal overlay appears over the main content
- **AND** the user can close it by clicking outside, pressing Escape, or clicking a close button
- **AND** the dashboard content remains in its previous state after closing

#### Scenario: Modal content covers required topics

- **WHEN** the modal is open
- **THEN** it contains at minimum these sections: how the data is obtained, what "proyección" means, what the margin of error represents, what "probabilidad de orden final" means, and why some units are excluded
- **AND** the language avoids technical jargon (no "varianza", "cascada", "Bernoulli" without plain-language definition)

### Requirement: Credits footer with external links

The dashboard SHALL render a credits footer at the bottom of the page with two lines:
1. "Dashboard creado por Victor Antonio Padilla Prado" with a LinkedIn icon that links to his profile.
2. "Con el apoyo de Claude Code" with a heart icon.

#### Scenario: LinkedIn icon links out

- **WHEN** the user clicks the LinkedIn icon in the credits
- **THEN** a new tab opens to the author's LinkedIn profile URL
- **AND** the link uses `rel="noopener noreferrer"` and `target="_blank"`

#### Scenario: Heart icon is visible

- **WHEN** the footer is rendered
- **THEN** the heart icon appears adjacent to "Con el apoyo de Claude Code"
- **AND** the icon uses the palette positive color or the primary text color
