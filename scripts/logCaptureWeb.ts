/**
 * Web 版のログをエージェントが直接回収するための取り込みスクリプト。
 *
 *   bun run logs:web                    # http://localhost:8081 を開いて記録
 *   bun run logs:web http://localhost:8081/some/path
 *   HEADED=1 bun run logs:web           # 画面を表示して操作する
 *
 * 記録先は logs/web-playwright.ndjson（logs/*.ndjson と同じ 1 行 1 JSON）。
 * アプリ側の送信（app/utils/logSink.ts）が使えない場面や、再現手順を固定したい調査で使う。
 * 終了は Ctrl+C かブラウザを閉じる。
 */
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright"

const LOG_DIR = join(process.cwd(), "logs")
const OUTPUT_PATH = join(LOG_DIR, "web-playwright.ndjson")
const DEFAULT_URL = "http://localhost:8081"

const url = process.argv[2] ?? DEFAULT_URL
mkdirSync(LOG_DIR, { recursive: true })
// 毎回作り直す（直前に記録した内容と混ざると原因の切り分けができない）
writeFileSync(OUTPUT_PATH, "")

const session = Math.random().toString(36).slice(2, 8)

function clip(value: string, limit = 4000) {
  return value.length > limit ? `${value.slice(0, limit)}…[+${value.length - limit} chars]` : value
}

function append(level: string, source: string, msg: string, data?: unknown) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    source,
    platform: "web-playwright",
    session,
    msg: clip(msg),
    data,
  }
  appendFileSync(OUTPUT_PATH, `${JSON.stringify(entry)}\n`)
}

const levelOf = (type: string) => (type === "warning" ? "warn" : type === "error" ? "error" : type)

const browser = await chromium.launch({ headless: process.env.HEADED !== "1" })
const context = await browser.newContext({
  locale: "en-US",
  viewport: { width: 1280, height: 900 },
})
const page = await context.newPage()

page.on("console", (message) => {
  append(levelOf(message.type()), "console", message.text())
})
page.on("pageerror", (error) => {
  append("error", "pageerror", error.message, { stack: error.stack })
})
page.on("requestfailed", (request) => {
  append("warn", "requestfailed", `${request.method()} ${request.url()}`, {
    failure: request.failure()?.errorText,
  })
})
page.on("response", (response) => {
  if (response.status() >= 400) {
    append("warn", "http", `${response.status()} ${response.request().method()} ${response.url()}`)
  }
})

console.log(`Recording ${url} -> ${OUTPUT_PATH}`)
console.log("操作してから Ctrl+C で終了してください。")

try {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 })
  if (!response) {
    append("warn", "navigation", "no response")
  } else if (!response.ok()) {
    append("warn", "navigation", `${response.status()} ${url}`)
  }
} catch (error) {
  append("error", "navigation", error instanceof Error ? error.message : String(error))
  console.error("Navigate failed. Is the dev server running? (bun run dev:web)")
}

const shutdown = async () => {
  await browser.close().catch(() => {})
  console.log(`Saved: ${OUTPUT_PATH}`)
  process.exit(0)
}

process.on("SIGINT", () => void shutdown())
process.on("SIGTERM", () => void shutdown())

// ブラウザが閉じられるまで待つ
await new Promise<void>((resolve) => {
  browser.on("disconnected", () => resolve())
})
console.log(`Saved: ${OUTPUT_PATH}`)
