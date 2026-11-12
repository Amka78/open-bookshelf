/**
 * Web / Android / Electrobun の開発ログを 1 か所に集める受け口。
 *
 *   bun run logs      # 単体起動（127.0.0.1:8790）
 *   bun run dev:web   # scripts/devWeb.ts がこのモジュールを内蔵起動する
 *   bun run desktop   # src-electrobun/index.ts が開発時のみ内蔵起動する
 *
 * アプリ側（app/utils/logSink.ts）は __DEV__ のときだけここへログの JSON 配列を POST する。
 * 保存先は logs/<platform>.ndjson で、エージェントはこのファイルを直接読む。
 * 本番ビルドでは送信側が動かないため、このサーバーも開発専用。
 */
import { appendFileSync, mkdirSync, renameSync, statSync } from "node:fs"
import { join } from "node:path"

export const DEFAULT_LOG_SINK_PORT = 8790

const LOG_DIR = join(process.cwd(), "logs")
/** 1 ファイルがこれを超えたら .bak に退避する（開発中に無限に育つのを防ぐ） */
const MAX_FILE_BYTES = 20 * 1024 * 1024
/** 1 リクエストの上限。壊れた送信元でディスクを埋めないための保険 */
const MAX_BODY_BYTES = 512 * 1024
const MAX_LINE_CHARS = 32 * 1024
const MAX_DATA_CHARS = 4000

const LEVELS = new Set(["debug", "info", "warn", "error", "fatal", "log"])
/** ファイル名に使うので、パス区切りやドットを通さない */
const SAFE_ID = /^[a-z0-9_-]{1,32}$/i

export interface LogSinkEntry {
  ts: string
  level: string
  platform: string
  session: string
  source?: string
  msg: string
  data?: unknown
}

function clipText(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}…[+${value.length - limit} chars]` : value
}

function clipData(data: unknown): unknown {
  if (data === undefined) return undefined
  try {
    const text = JSON.stringify(data)
    if (text === undefined) return undefined
    return text.length > MAX_DATA_CHARS ? { truncated: clipText(text, MAX_DATA_CHARS) } : data
  } catch {
    return "[unserializable]"
  }
}

/**
 * アプリ側（app/utils/logSink.ts）は複数エントリを JSON 配列でまとめて送る。
 * 過去の NDJSON（1 行 1 JSON）や単体 JSON も受け付けるが、壊れた行が 1 つでもあれば
 * 部分書き込みを避けて null を返す。
 */
export function parseLogSinkBody(body: string): unknown[] | null {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const items: unknown[] = []
  for (const line of lines) {
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch {
      return null
    }
    if (Array.isArray(parsed)) {
      items.push(...parsed)
    } else {
      items.push(parsed)
    }
  }

  return items
}

/** 受信した任意の JSON を、書き出して安全な形へ正規化する（テスト対象） */
export function normalizeEntries(payload: unknown): LogSinkEntry[] {
  const list = Array.isArray(payload) ? payload : [payload]
  const entries: LogSinkEntry[] = []

  for (const item of list) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const raw = item as Record<string, unknown>
    const level = typeof raw.level === "string" && LEVELS.has(raw.level) ? raw.level : "log"
    const platform =
      typeof raw.platform === "string" && SAFE_ID.test(raw.platform) ? raw.platform : "unknown"
    const session =
      typeof raw.session === "string" && SAFE_ID.test(raw.session) ? raw.session : "nosession"
    const ts =
      typeof raw.ts === "string" && raw.ts.length > 0 && raw.ts.length <= 40
        ? raw.ts
        : new Date().toISOString()
    const msg =
      typeof raw.msg === "string"
        ? clipText(raw.msg, MAX_LINE_CHARS)
        : raw.msg === undefined
          ? ""
          : clipText(JSON.stringify(raw.msg) ?? "", MAX_LINE_CHARS)

    entries.push({
      ts,
      level,
      platform,
      session,
      source: typeof raw.source === "string" ? raw.source.slice(0, 32) : undefined,
      msg,
      data: clipData(raw.data),
    })
  }

  return entries
}

export function logFilePath(platform: string) {
  const safe = SAFE_ID.test(platform) ? platform : "unknown"
  return join(LOG_DIR, `${safe}.ndjson`)
}

function rotateIfNeeded(filePath: string) {
  try {
    if (statSync(filePath).size > MAX_FILE_BYTES) {
      renameSync(filePath, `${filePath}.${Date.now()}.bak`)
    }
  } catch {
    // ファイルが無い（初回）だけなので何もしない
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "600",
  }
}

export interface LogSinkOptions {
  port?: number
  /** warn 以上をこのターミナルにも表示する（既定 true） */
  echo?: boolean
}

export function startLogSink(options: LogSinkOptions = {}) {
  mkdirSync(LOG_DIR, { recursive: true })

  const requestedPort = options.port ?? Number(process.env.LOG_SINK_PORT ?? DEFAULT_LOG_SINK_PORT)
  if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
    throw new Error(`Invalid LOG_SINK_PORT: ${process.env.LOG_SINK_PORT}`)
  }
  const echo = options.echo ?? true

  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: requestedPort,
    async fetch(request) {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() })
      }
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() })
      }

      const body = await request.text()
      if (body.length > MAX_BODY_BYTES) {
        return new Response("Payload Too Large", { status: 413, headers: corsHeaders() })
      }

      const payload = parseLogSinkBody(body)
      if (payload === null) {
        return new Response("Bad JSON", { status: 400, headers: corsHeaders() })
      }

      for (const entry of normalizeEntries(payload)) {
        const filePath = logFilePath(entry.platform)
        rotateIfNeeded(filePath)
        appendFileSync(filePath, `${JSON.stringify(entry)}\n`)
        if (
          echo &&
          (entry.level === "warn" || entry.level === "error" || entry.level === "fatal")
        ) {
          console.log(`[${entry.platform}][${entry.level.toUpperCase()}] ${entry.msg}`)
        }
      }

      return new Response(null, { status: 204, headers: corsHeaders() })
    },
  })

  return {
    port: server.port,
    url: `http://127.0.0.1:${server.port}`,
    logDir: LOG_DIR,
    stop(force = true) {
      server.stop(force)
    },
  }
}

if (import.meta.main) {
  try {
    const sink = startLogSink()
    console.log(`Log sink listening on ${sink.url} -> ${sink.logDir}`)
    console.log("Keep this running, then start the app (web / desktop / android).")
  } catch (error) {
    console.error(
      `Log sink failed to start: ${error instanceof Error ? error.message : String(error)}`,
    )
    process.exit(1)
  }
}
