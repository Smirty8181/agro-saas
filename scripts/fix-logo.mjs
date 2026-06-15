import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'public', 'logo.png')
const outLogo = join(root, 'public', 'logo.png')
const outFavicon = join(root, 'public', 'favicon.png')

const input = readFileSync(source)
const meta = await sharp(input).metadata()
const size = Math.min(meta.width ?? 512, meta.height ?? 512)

const circleMask = Buffer.from(
  `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
)

const logo = await sharp(input)
  .resize(size, size, { fit: 'cover', position: 'center' })
  .ensureAlpha()
  .composite([{ input: circleMask, blend: 'dest-in' }])
  .png({ compressionLevel: 9 })
  .toBuffer()

writeFileSync(outLogo, logo)
writeFileSync(outFavicon, await sharp(logo).resize(32, 32).png().toBuffer())

console.log(`Logo fixed: ${size}x${size} PNG with transparent corners → public/logo.png, public/favicon.png`)
