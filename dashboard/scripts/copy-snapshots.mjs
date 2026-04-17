// Copia los snapshots generados por el script Python al `public/` del dashboard
// para que Vite los sirva durante dev y los embeba en `dist/` en build.
// No falla si la carpeta origen no existe: emite un index.json vacío en su lugar.
import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const SRC = path.resolve(__dirname, '..', '..', 'snapshots')
const DST = path.resolve(__dirname, '..', 'public', 'snapshots')

async function main() {
  await fs.ensureDir(DST)
  // Limpia solo los .json (preserva .gitkeep)
  for (const entry of await fs.readdir(DST)) {
    if (entry.endsWith('.json')) await fs.remove(path.join(DST, entry))
  }

  if (!(await fs.pathExists(SRC))) {
    console.warn(`[copy-snapshots] No existe ${SRC} — escribiendo index vacío`)
    await fs.writeJSON(path.join(DST, 'index.json'), { snapshots: [] }, { spaces: 2 })
    return
  }

  let n = 0
  for (const entry of await fs.readdir(SRC)) {
    if (!entry.endsWith('.json')) continue
    await fs.copy(path.join(SRC, entry), path.join(DST, entry))
    n++
  }
  console.log(`[copy-snapshots] ${n} archivo(s) copiado(s) a ${DST}`)
}

main().catch(err => { console.error(err); process.exit(1) })
