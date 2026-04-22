// Copia los snapshots generados por el script Python al `public/` del dashboard
// para que Vite los sirva durante dev y los embeba en `dist/` en build.
// Además, mantiene un template editable `public/display_names.json`:
// cada nombre nuevo que aparece en los snapshots se siembra con su forma
// original; las entradas ya personalizadas por el administrador se preservan.
import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const SRC         = path.resolve(__dirname, '..', '..', 'snapshots')
const DST         = path.resolve(__dirname, '..', 'public', 'snapshots')
const NAMES_FILE  = path.resolve(__dirname, '..', 'public', 'display_names.json')

async function copySnapshots() {
  await fs.ensureDir(DST)
  for (const entry of await fs.readdir(DST)) {
    if (entry.endsWith('.json')) await fs.remove(path.join(DST, entry))
  }

  if (!(await fs.pathExists(SRC))) {
    console.warn(`[copy-snapshots] No existe ${SRC} — escribiendo index vacío`)
    await fs.writeJSON(path.join(DST, 'index.json'), { snapshots: [] }, { spaces: 2 })
    return []
  }

  const names = new Set()
  let n = 0
  for (const entry of await fs.readdir(SRC)) {
    if (!entry.endsWith('.json')) continue
    const srcPath = path.join(SRC, entry)
    await fs.copy(srcPath, path.join(DST, entry))
    n++
    // Solo los snapshot_*.json tienen `candidatos`; index.json no.
    if (entry.startsWith('snapshot_')) {
      try {
        const data = await fs.readJSON(srcPath)
        for (const c of data.candidatos ?? []) {
          if (c?.nombre) names.add(String(c.nombre).trim())
        }
      } catch { /* ignora snapshots ilegibles */ }
    }
  }
  console.log(`[copy-snapshots] ${n} archivo(s) copiado(s) a ${DST}`)
  return [...names]
}

async function seedDisplayNames(rawNames) {
  // Formato: { _comment, names: { RAW: "display" } }. Se preservan las
  // entradas existentes (el admin ya las editó); solo se añaden las nuevas.
  let file = {
    _comment:
      'Diccionario editable: nombre tal como aparece en los snapshots → ' +
      'nombre a mostrar en el dashboard. Si dejas el valor igual al raw, ' +
      'se muestra en Title Case automáticamente. Edita libremente.',
    names: {},
  }
  if (await fs.pathExists(NAMES_FILE)) {
    try { file = { ...file, ...(await fs.readJSON(NAMES_FILE)) } } catch { /* usa default */ }
  }
  const current = file.names ?? {}
  let added = 0
  for (const name of rawNames) {
    if (!(name in current)) { current[name] = name; added++ }
  }
  file.names = current
  await fs.writeJSON(NAMES_FILE, file, { spaces: 2 })
  if (added > 0) console.log(`[copy-snapshots] ${added} nombre(s) nuevo(s) en display_names.json`)
}

async function main() {
  const rawNames = await copySnapshots()
  await seedDisplayNames(rawNames)
}

main().catch(err => { console.error(err); process.exit(1) })
