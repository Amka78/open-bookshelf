type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

function normalizeLevel(level: string | undefined): LogLevel | undefined {
  if (!level) return undefined;
  const normalized = level.toLowerCase();
  if (normalized === "debug") return "debug";
  if (normalized === "info") return "info";
  if (normalized === "warn") return "warn";
  if (normalized === "error") return "error";
  if (normalized === "silent") return "silent";
  return undefined;
}

const envLevelRaw =
  typeof process !== "undefined"
    ? process.env.EXPO_PUBLIC_LOG_LEVEL
    : undefined;
const envLevel = normalizeLevel(envLevelRaw);
const defaultLevel: LogLevel = __DEV__ ? "info" : "warn";
const currentLevel = envLevel ?? defaultLevel;

function shouldLog(level: LogLevel) {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function sendToReactotron(level: LogLevel, args: unknown[]) {
  if (typeof console === "undefined" || !console.tron) return;
  if (console.tron.log) {
    console.tron.log(`[${level.toUpperCase()}]`, ...args);
  }
}

function logDebug(...args: unknown[]) {
  sendToReactotron("debug", args);
  if (!shouldLog("debug")) return;
  if (console.debug) {
    console.debug("[DEBUG]", ...args);
  } else {
    console.log("[DEBUG]", ...args);
  }
}

function logInfo(...args: unknown[]) {
  sendToReactotron("info", args);
  if (!shouldLog("info")) return;
  if (console.info) {
    console.info("[INFO]", ...args);
  } else {
    console.log("[INFO]", ...args);
  }
}

function logWarn(...args: unknown[]) {
  sendToReactotron("warn", args);
  if (!shouldLog("warn")) return;
  console.warn("[WARN]", ...args);
}

function logError(...args: unknown[]) {
  sendToReactotron("error", args);
  if (!shouldLog("error")) return;
  console.error("[ERROR]", ...args);
}

export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  level: currentLevel,
};
