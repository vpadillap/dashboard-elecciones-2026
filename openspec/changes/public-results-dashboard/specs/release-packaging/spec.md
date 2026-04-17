## ADDED Requirements

### Requirement: npm run build produces production assets

The dashboard project SHALL define an `npm run build` script that produces production-ready static assets in `dist/` ready to be served by any static web server.

#### Scenario: Build output is self-contained

- **WHEN** a developer runs `npm run build` from the dashboard project root
- **THEN** the command exits with status 0
- **AND** a `dist/` directory exists containing at minimum: `index.html`, JS bundle(s), CSS bundle(s), and any referenced static assets
- **AND** all file references inside `dist/index.html` use relative paths (no absolute URLs that assume a specific host)

### Requirement: npm run release packages build and snapshots into a deployable zip

The dashboard project SHALL define an `npm run release` script that:
1. Runs `npm run build`.
2. Copies the contents of `../snapshots/` (sibling directory at the repo root) into `dist/snapshots/`.
3. Creates a timestamped zip archive in `release/` containing the full contents of `dist/`.

#### Scenario: Release command produces a deployable zip

- **WHEN** a developer runs `npm run release`
- **THEN** the command exits with status 0
- **AND** a file `release/elecciones-YYYYMMDD-HHMMSS.zip` exists
- **AND** the zip contains `index.html`, JS/CSS bundles, and a `snapshots/` folder with all snapshot JSON files and `index.json`
- **AND** the zip does NOT contain `node_modules`, source files, or development-only artifacts

#### Scenario: Release snapshot copy preserves index.json

- **WHEN** `npm run release` executes and the sibling `snapshots/` folder contains snapshots
- **THEN** the zipped `snapshots/` folder includes `index.json`
- **AND** every snapshot file referenced by `index.json` is present in the zip

#### Scenario: Release fails gracefully when snapshots folder is missing

- **WHEN** `npm run release` executes but `../snapshots/` does not exist
- **THEN** the release continues and produces a zip with an empty `snapshots/` folder plus a placeholder `index.json` with zero entries
- **AND** a warning is printed: "No snapshots found — release built with empty data"

### Requirement: Deploy via upload and unzip

The release zip SHALL be deployable by uploading it to any static file hosting service and unzipping its contents into the served root directory. No additional configuration, build step, or environment variables SHALL be required at deploy time.

#### Scenario: Deploy to a static hosting service

- **WHEN** the zip is extracted into the web root of a static server (e.g., Nginx `html/`, shared hosting `public_html/`)
- **THEN** visiting the site URL loads the dashboard with the latest snapshot
- **AND** no `.env` files, server config changes, or additional commands are needed
- **AND** the site works identically whether the root is `/` or a subpath (e.g., `/elecciones/`)

### Requirement: Release is reproducible and dated

Each release zip SHALL have a filename that includes a timestamp (format: `YYYYMMDD-HHMMSS`) so that multiple releases coexist without overwriting one another.

#### Scenario: Two consecutive releases produce two zips

- **WHEN** `npm run release` is run twice with at least 1 second between completions
- **THEN** two distinct zip files exist in `release/` with different timestamps in their filenames
- **AND** neither zip overwrites the other
