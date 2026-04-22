// Empaqueta el scraper Python para desplegar en el VPS.
// Uso: `npm run release:scraper`
// Produce un zip con `elecciones26.py`, `requirements.txt` y `DEPLOY.md`
// dentro de una carpeta `elecciones-scraper/`. El dashboard (dist) se
// empaqueta por separado con `npm run release`.
import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const PROJ_ROOT = path.resolve(__dirname, '..', '..')
const DASH_ROOT = path.resolve(__dirname, '..')
const REL_DIR   = path.join(DASH_ROOT, 'release')

const FILES = [
  { src: path.join(PROJ_ROOT, 'elecciones26.py'),  dest: 'elecciones26.py'  },
  { src: path.join(PROJ_ROOT, 'requirements.txt'), dest: 'requirements.txt' },
  { src: path.join(PROJ_ROOT, 'DEPLOY.md'),        dest: 'DEPLOY.md'        },
]

async function main() {
  for (const { src } of FILES) {
    if (!(await fs.pathExists(src))) {
      console.error(`[release:scraper] Falta ${src}`)
      process.exit(1)
    }
  }

  await fs.ensureDir(REL_DIR)
  const stamp   = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const zipPath = path.join(REL_DIR, `elecciones-scraper-${stamp}.zip`)
  const output  = fs.createWriteStream(zipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  const done = new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
    archive.on('error', reject)
  })

  archive.pipe(output)
  for (const { src, dest } of FILES) {
    archive.file(src, { name: `elecciones-scraper/${dest}` })
  }
  await archive.finalize()
  await done

  const mb = ((await fs.stat(zipPath)).size / 1024 / 1024).toFixed(2)
  console.log(`[release:scraper] ${path.relative(DASH_ROOT, zipPath)} (${mb} MB)`)
}

main().catch(err => { console.error(err); process.exit(1) })
