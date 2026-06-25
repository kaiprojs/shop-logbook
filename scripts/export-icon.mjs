import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const root = join(import.meta.dirname, '..')
const svg = readFileSync(join(root, 'public', 'favicon.svg'))

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#f6f4ef',
  })
  writeFileSync(join(root, 'public', name), resvg.render().asPng())
  console.log(`Wrote public/${name} (${size}x${size})`)
}
