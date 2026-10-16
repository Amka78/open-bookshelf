type LogLevel = "debug" | "info" | "warn" | "error" | "silent"

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
}

function normalizeLevel(level: string | undefined): LogLevel | undefined {
  if (!level) return undefined
  const normalized = level.toLowerCase()
  if (normalized === "debug") return "debug"
  if (normalized === "info") return "info"
  if (normalized === "warn") return "warn"
  if (normalized === "error") return "error"
  if (normalized === "silent") return "silent"
  return undefined
}

const envLevelRaw = typeof process !== "undefined" ? process.env.EXPO_PUBLIC_LOG_LEVEL : undefined
const envLevel = normalizeLevel(envLevelRaw)
const defaultLevel: LogLevel = __DEV__ ? "debug" : "warn"
const currentLevel = envLevel ?? defaultLevel

function shouldLog(level: LogLevel) {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function sendToReactotron(level: LogLevel, args: unknown[]) {
  if (typeof console === "undefined" || !console.tron) return
  // Web 環境では Reactotron が動作しないためスキップ（巨大オブジェクトのシリアライズでメモリーオーバーフロー防止）
  if (typeof document !== "undefined") return
  if (console.tron.log) {
    // 巨大なオブジェクトや循環参照を避けるため、安全にシリアライズ可能な引数のみ渡す
    const safeArgs = args.map((arg) => {
      if (arg === null || arg === undefined) return arg
      if (typeof arg === "string" || typeof arg === "number" || typeof arg === "boolean") return arg
      // ファイルオブジェクトや巨大な配列は除外
      if (typeof arg === "object" && arg !== null) {
        try {
          const size = JSON.stringify(arg).length
          if (size > 10000) return `[Object too large: ${size} chars]`
        } catch {
          return "[Circular or non-serializable]"
        }
      }
      return String(arg)
    })
    console.tron.log(`[${level.toUpperCase()}]`, ...safeArgs)
  }
}

function logDebug(...args: unknown[]) {
  sendToReactotron("debug", args)
  if (!shouldLog("debug")) return
  if (console.debug) {
    console.debug("[DEBUG]", ...args)
  } else {
    console.log("[DEBUG]", ...args)
  }
}

function logInfo(...args: unknown[]) {
  sendToReactotron("info", args)
  if (!shouldLog("info")) return
  if (console.info) {
    console.info("[INFO]", ...args)
  } else {
    console.log("[INFO]", ...args)
  }
}

function logWarn(...args: unknown[]) {
  sendToReactotron("warn", args)
  if (!shouldLog("warn")) return
  console.warn("[WARN]", ...args)
}

function logError(...args: unknown[]) {
  sendToReactotron("error", args)
  if (!shouldLog("error")) return
  console.error("[ERROR]", ...args)
}

export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  level: currentLevel,
}
