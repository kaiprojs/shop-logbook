import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const root = join(import.meta.dirname, '..')
const svg = readFileSync(join(root, 'public', 'favicon.svg'))
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 180 },
  background: '#f6f4ef',
})
const png = resvg.render().asPng()

writeFileSync(join(root, 'public', 'apple-touch-icon.png'), png)
console.log('Wrote public/apple-touch-icon.png (180x180)')
