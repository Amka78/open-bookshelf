/**
 * 開発中だけ、ログをローカルの受け口（scripts/logSink.ts）へ JSON 配列で送る。
 *
 * 目的は「ユーザーがログを貼り付けなくても、エージェントが logs/*.ndjson を読める」こと。
 * __DEV__ 以外では一切動かない。受け口が起動していなくても、送信失敗を数回数えたら
 * 自動で無効化するのでアプリの動作には影響しない。
 *
 * 送信元は 3 系統:
 *   - logger（source: "app"）… 構造化された引数をそのまま送る
 *   - console.warn / console.error（source: "console"）… ライブラリ警告も拾う
 *   - 未捕捉例外（source: "error"）
 */
type SinkLevel = "debug" | "info" | "warn" | "error" | "log"

interface SinkEntry {
  ts: string
  level: SinkLevel
  source: string
  platform: string
  session: string
  msg: string
  data?: unknown
}

const DEFAULT_SINK_URL = "http://127.0.0.1:8790"
const FLUSH_INTERVAL_MS = 300
const MAX_QUEUE_LENGTH = 40
const MAX_MESSAGE_CHARS = 4000
const MAX_FAILURES = 5
const LOGGER_PREFIX = /^\[(DEBUG|INFO|WARN|ERROR)\]$/

interface LogSinkGlobal {
  __ELECTROBUN__?: boolean
  __LOG_SINK_URL?: string
  ErrorUtils?: {
    setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void
    getGlobalHandler?: () => ((error: unknown, isFatal?: boolean) => void) | undefined
  }
}

const appGlobal = globalThis as typeof globalThis & LogSinkGlobal

function detectPlatform(): string {
  if (appGlobal.__ELECTROBUN__) return "electrobun"
  if (typeof document !== "undefined") return "web"
  try {
    // react-native を静的に import するとユニットテスト側の解決に巻き込まれるため遅延取得する
    const { Platform } = require("react-native") as { Platform: { OS: string } }
    return Platform.OS
  } catch {
    return "native"
  }
}

function resolveSinkUrl(): string | undefined {
  const inline = typeof process !== "undefined" ? process.env.EXPO_PUBLIC_LOG_SINK : undefined
  if (inline === "off") return undefined
  if (inline?.startsWith("http")) return inline

  const injected = appGlobal.__LOG_SINK_URL
  if (injected) return injected.startsWith("http") ? injected : undefined

  return DEFAULT_SINK_URL
}

const sinkUrl = resolveSinkUrl()
// テスト中は送らない（jsdom から実ポートへ fetch し、タイマーも残るため）
const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test"
const enabled = __DEV__ && !isTestEnv && Boolean(sinkUrl)
const platform = detectPlatform()
const session = Math.random().toString(36).slice(2, 8)

let queue: SinkEntry[] = []
let timer: ReturnType<typeof setTimeout> | undefined
let consecutiveFailures = 0
let installed = false

function clipText(value: string) {
  return value.length > MAX_MESSAGE_CHARS
    ? `${value.slice(0, MAX_MESSAGE_CHARS)}…[+${value.length - MAX_MESSAGE_CHARS} chars]`
    : value
}

function normalizeArg(arg: unknown): unknown {
  if (arg instanceof Error) {
    return { name: arg.name, message: arg.message, stack: arg.stack }
  }
  return arg
}

function clipData(data: unknown): unknown {
  if (data === undefined) return undefined
  try {
    const text = JSON.stringify(data)
    if (text === undefined) return undefined
    // 受け口側でも切るが、巨大なオブジェクトを fetch に載せないよう手前で落とす
    return text.length > 8000 ? { truncated: text.slice(0, 8000) } : normalizeArg(data)
  } catch {
    return "[unserializable]"
  }
}

function flush(useBeacon = false) {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
  if (!enabled || !sinkUrl || queue.length === 0 || consecutiveFailures >= MAX_FAILURES) return

  const body = JSON.stringify(queue)
  queue = []

  try {
    if (
      useBeacon &&
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      if (navigator.sendBeacon(sinkUrl, body)) {
        consecutiveFailures = 0
        return
      }
    }

    const keepalive = typeof document !== "undefined"
    void fetch(sinkUrl, {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain" },
      ...(keepalive ? { keepalive: true } : {}),
    })
      .then((response) => {
        consecutiveFailures = response.ok ? 0 : consecutiveFailures + 1
      })
      .catch(() => {
        consecutiveFailures += 1
      })
  } catch {
    consecutiveFailures += 1
  }
}

function enqueue(level: SinkLevel, source: string, args: unknown[]) {
  if (!enabled || consecutiveFailures >= MAX_FAILURES) return

  const [first, ...rest] = args
  const msgSource = typeof first === "string" ? first : first === undefined ? "" : String(first)
  const dataParts = (typeof first === "string" ? rest : args).map(normalizeArg)

  queue.push({
    ts: new Date().toISOString(),
    level,
    source,
    platform,
    session,
    msg: clipText(msgSource),
    data:
      dataParts.length === 0
        ? undefined
        : clipData(dataParts.length === 1 ? dataParts[0] : dataParts),
  })

  if (queue.length >= MAX_QUEUE_LENGTH) {
    flush()
    return
  }
  if (!timer) timer = setTimeout(() => flush(), FLUSH_INTERVAL_MS)
}

/** logger から呼ばれる。level は logger のフィルタ結果とは独立に全レベル送る */
export function enqueueLog(level: SinkLevel, args: unknown[]) {
  enqueue(level, "app", args)
}

function installConsoleCapture() {
  for (const level of ["warn", "error"] as const) {
    const original = console[level].bind(console)
    console[level] = (...args: unknown[]) => {
      // logger は "[WARN]" 等のプレフィックスを付けて console に出すので二重送信を避ける
      const isLoggerOutput = typeof args[0] === "string" && LOGGER_PREFIX.test(args[0])
      if (!isLoggerOutput) enqueue(level, "console", args)
      original(...args)
    }
  }
}

function installErrorCapture() {
  const globalObject = appGlobal

  if (typeof globalObject.addEventListener === "function") {
    globalObject.addEventListener("error", (event: ErrorEvent) => {
      enqueue("error", "error", [
        event.message ?? "window error",
        { filename: event.filename, lineno: event.lineno, colno: event.colno, error: event.error },
      ])
      flush(true)
    })
    globalObject.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      enqueue("error", "error", ["unhandledrejection", event.reason])
      flush(true)
    })
    // タブを閉じる・隠す直前に取りこぼさない（fetch ではなく Beacon を使う）
    globalObject.addEventListener("pagehide", () => flush(true))
  }

  const errorUtils = globalObject.ErrorUtils
  if (errorUtils && typeof errorUtils.setGlobalHandler === "function") {
    const previous =
      typeof errorUtils.getGlobalHandler === "function" ? errorUtils.getGlobalHandler() : undefined
    errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      enqueue("error", "error", [isFatal ? "fatal JS error" : "JS error", error])
      flush(true)
      previous?.(error, isFatal)
    })
  }
}

/** __DEV__ のときだけ、コンソールと例外の横取りを有効にする（複数回呼んでも 1 回だけ） */
export function installLogSink() {
  if (!enabled || installed) return
  installed = true

  installConsoleCapture()
  installErrorCapture()
  enqueue("info", "sink", ["log sink enabled", { url: sinkUrl, platform, session }])
}

/** テスト用: 送信待ちを捨てて初期状態に戻す */
export function __resetLogSinkForTests() {
  queue = []
  consecutiveFailures = 0
  installed = false
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
}

export const logSink = { enabled, url: sinkUrl, platform, session } as const
