// Empaqueta `dist/` (build de Vite) en un zip listo para desplegar.
// Uso: `npm run release` — asume que ya existe `dist/`. Si no existe o está
// desactualizado, ejecuta primero `npm run build`.
// Los snapshots viajan dentro de `dist/snapshots/` porque `prebuild` los copia
// a `public/` y Vite los embebe; no hace falta añadirlos aparte.
import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const ROOT     = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT, 'dist')
const REL_DIR  = path.join(ROOT, 'release')

async function main() {
  if (!(await fs.pathExists(DIST_DIR))) {
    console.error('[release] No existe dist/. Corre `npm run build` primero.')
    process.exit(1)
  }

  await fs.ensureDir(REL_DIR)

  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const zipPath = path.join(REL_DIR, `elecciones2026-${stamp}.zip`)

  const output  = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  const done = new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
    archive.on('error', reject)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') console.warn('[release]', err.message)
      else reject(err)
    })
  })

  archive.pipe(output)
  archive.directory(DIST_DIR, false)
  await archive.finalize()
  await done

  const bytes = (await fs.stat(zipPath)).size
  const mb    = (bytes / 1024 / 1024).toFixed(2)
  console.log(`[release] ${path.relative(ROOT, zipPath)} (${mb} MB)`)
  console.log('[release] Despliegue: subir el zip al servidor y descomprimir en la raíz pública.')
}

main().catch(err => { console.error(err); process.exit(1) })
