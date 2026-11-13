#!/usr/bin/env bun
/**
 * Generates every app icon asset from one vector definition.
 *
 * Run: bun run icons
 *
 * Output:
 *   assets/images/app-icon-source.svg        vector master (full-bleed square)
 *   assets/images/app-icon.png               iOS / Expo (1024, opaque)
 *   assets/images/app-icon-web.png           web favicon
 *   assets/images/adaptive-icon-foreground.png  Android adaptive foreground
 *   assets/images/adaptive-icon-monochrome.png  Android 13+ themed icon layer
 *   assets/images/splash-logo-all.png        splash screen (1242x2436)
 *   assets/icons/icon.png                    Electrobun / Linux
 *   assets/icons/icon.ico                    Electrobun / Windows
 *   assets/icons/icon.iconset/*.png          Electrobun / macOS (.icns source)
 *
 * The artwork is "Spine Row": six book spines packed edge to edge on one shelf
 * board. Rendered through Chromium so the committed assets and the source SVG
 * stay byte-for-byte identical in shape.
 */
import { chromium } from "playwright"
import * as fs from "node:fs"
import * as path from "node:path"

const BG = "#111318"
const INK_HI = "#F7F9FC"
const INK_MID = "#E6EAF1"
const INK_LOW = "#B7BCC7"

type Book = { x: number; w: number; y: number; h: number; fill: string }

/** Spines sit edge to edge: each x starts where the previous one ends. */
const BOOKS: Book[] = [
  { x: 250, w: 78, y: 412, h: 380, fill: INK_LOW },
  { x: 328, w: 92, y: 322, h: 470, fill: INK_HI },
  { x: 420, w: 70, y: 452, h: 340, fill: INK_MID },
  { x: 490, w: 104, y: 292, h: 500, fill: INK_LOW },
  { x: 594, w: 84, y: 372, h: 420, fill: INK_HI },
  { x: 678, w: 96, y: 432, h: 360, fill: INK_MID },
]
const SHELF = { x: 120, y: 792, w: 784, h: 30, r: 15 }

/** Bounds of the shelf and spines, used to place the mark on the splash. */
const ART_BOX = { x: 120, y: 292, w: 784, h: 530 }

/** The monochrome layer is alpha-only, so adjacent spines need a visible gap. */
const MONO_GAP = 7

const artwork = (mono: boolean): string => {
  const book = (b: Book): string =>
    mono
      ? `<rect x="${b.x + MONO_GAP}" y="${b.y}" width="${b.w - MONO_GAP * 2}" height="${
          b.h
        }" rx="12" fill="#FFFFFF"/>`
      : `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="12" fill="${b.fill}"/>`

  return [
    `<rect x="${SHELF.x}" y="${SHELF.y}" width="${SHELF.w}" height="${SHELF.h}" rx="${
      SHELF.r
    }" fill="${mono ? "#FFFFFF" : INK_MID}"/>`,
    ...BOOKS.map(book),
  ].join("\n    ")
}

type Frame = "square" | "rounded" | "none"

/** macOS-style icon: 824 rounded square centred in a 1024 canvas. */
const ROUNDED = { inset: 100, size: 824, radius: 185 }

const svg = (opts: {
  size: number
  frame: Frame
  scale?: number
  mono?: boolean
}): string => {
  const { size, frame, scale = 1, mono = false } = opts
  const transform = `translate(512 512) scale(${scale}) translate(-512 -512)`
  const frameShape =
    frame === "square"
      ? `<rect width="1024" height="1024" fill="${BG}"/>`
      : frame === "rounded"
        ? `<rect x="${ROUNDED.inset}" y="${ROUNDED.inset}" width="${ROUNDED.size}" height="${ROUNDED.size}" rx="${ROUNDED.radius}" fill="${BG}"/>`
        : ""

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">`,
    frameShape ? `  ${frameShape}` : null,
    `  <g transform="${transform}">`,
    `    ${artwork(mono)}`,
    "  </g>",
    "</svg>",
  ]
    .filter(Boolean)
    .join("\n")
}

const ROOT = process.cwd()
const write = (file: string, data: Buffer | string): void => {
  const full = path.resolve(ROOT, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, data)
  console.log(`  ${file.padEnd(46)} ${data.length}B`)
}

/** PNG-in-ICO container: works for every size Windows Vista and later needs. */
const ico = (images: { size: number; data: Buffer }[]): Buffer => {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1024, height: 1024 },
  deviceScaleFactor: 1,
})

const render = async (markup: string, size: number): Promise<Buffer> => {
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style></head><body>${markup}</body></html>`,
    { waitUntil: "load" },
  )
  return page.screenshot({
    omitBackground: true,
    clip: { x: 0, y: 0, width: size, height: size },
  })
}

/** Full-page render used for the splash, where the canvas is portrait. */
const renderPage = async (html: string, width: number, height: number): Promise<Buffer> => {
  await page.setViewportSize({ width, height })
  await page.setContent(html, { waitUntil: "load" })
  await page.evaluate(() => document.fonts.ready)
  const png = await page.screenshot({ clip: { x: 0, y: 0, width, height } })
  await page.setViewportSize({ width: 1024, height: 1024 })
  return png
}

console.log("Rendering icons")

const master = svg({ size: 1024, frame: "square" })
write("assets/images/app-icon-source.svg", `${master}\n`)
write("assets/images/app-icon.png", await render(master, 1024))
write("assets/images/app-icon-web.png", await render(svg({ size: 128, frame: "square" }), 128))

const adaptive = svg({ size: 1024, frame: "none", scale: 0.68 })
write("assets/images/adaptive-icon-foreground.png", await render(adaptive, 1024))
write(
  "assets/images/adaptive-icon-monochrome.png",
  await render(svg({ size: 1024, frame: "none", scale: 0.68, mono: true }), 1024),
)

const rounded = (size: number): string => svg({ size, frame: "rounded", scale: 0.85 })

write("assets/icons/icon.png", await render(rounded(1024), 1024))

const icoImages: { size: number; data: Buffer }[] = []
for (const size of [16, 24, 32, 48, 64, 128, 256]) {
  icoImages.push({ size, data: await render(rounded(size), size) })
}
write("assets/icons/icon.ico", ico(icoImages))

const iconset: [string, number][] = [
  ["icon_16x16.png", 16],
  ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32],
  ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128],
  ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256],
  ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512],
  ["icon_512x512@2x.png", 1024],
]
for (const [name, size] of iconset) {
  write(`assets/icons/icon.iconset/${name}`, await render(rounded(size), size))
}

// Splash: the same mark on a portrait canvas, with the wordmark underneath.
const SPLASH = { width: 1242, height: 2436, markWidth: 560, markCenterY: 1120, baselineY: 1520 }
const splashScale = SPLASH.markWidth / ART_BOX.w
const artCenterX = ART_BOX.x + ART_BOX.w / 2
const artCenterY = ART_BOX.y + ART_BOX.h / 2
const wordmarkFont = fs
  .readFileSync(
    path.resolve(ROOT, "node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_700Bold.ttf"),
  )
  .toString("base64")

const splash = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH.width}" height="${SPLASH.height}" viewBox="0 0 ${SPLASH.width} ${SPLASH.height}">`,
  `  <rect width="${SPLASH.width}" height="${SPLASH.height}" fill="${BG}"/>`,
  `  <g transform="translate(${SPLASH.width / 2} ${
    SPLASH.markCenterY
  }) scale(${splashScale}) translate(${-artCenterX} ${-artCenterY})">`,
  `    ${artwork(false)}`,
  "  </g>",
  `  <text x="${SPLASH.width / 2}" y="${
    SPLASH.baselineY
  }" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="64" letter-spacing="8" fill="${INK_LOW}">Shoin</text>`,
  "</svg>",
].join("\n")

write(
  "assets/images/splash-logo-all.png",
  await renderPage(
    `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:"Space Grotesk";src:url(data:font/ttf;base64,${wordmarkFont}) format("truetype");font-weight:700;font-style:normal}html,body{margin:0;padding:0;background:${BG}}svg{display:block}</style></head><body>${splash}</body></html>`,
    SPLASH.width,
    SPLASH.height,
  ),
)

await browser.close()
console.log("Done")
