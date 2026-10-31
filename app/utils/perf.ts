/**
 * Opt-in performance diagnostics.
 *
 * Enable with the `EXPO_PUBLIC_PERF_LOG` environment variable, which accepts a
 * comma-separated list of modes (`search`, or `all`). Example:
 *
 *   EXPO_PUBLIC_PERF_LOG=search bun run start:perf
 *
 * Logs are emitted as a single-line JSON string with a shared `performance.now()`
 * clock (`t`) so callers, requests, and conversions can be correlated by time.
 * They bypass the logger level filter because they are meant to be readable in
 * production builds too, but nothing is emitted unless a mode is requested.
 */
export type PerfMode = "search"

const rawModes: string =
  typeof process !== "undefined" ? String(process.env.EXPO_PUBLIC_PERF_LOG ?? "") : ""

const enabledModes = new Set<string>(
  rawModes
    .split(",")
    .map((mode) => mode.trim())
    .filter(Boolean),
)

export function isPerfLogEnabled(mode: PerfMode): boolean {
  return enabledModes.has("all") || enabledModes.has(mode)
}

export function perfNow(): number {
  const now = globalThis.performance?.now?.()
  return Math.round((typeof now === "number" ? now : Date.now()) * 10) / 10
}

export function perfLog(
  mode: PerfMode,
  event: string,
  data: Record<string, string | number | boolean | null | undefined> = {},
): void {
  if (!isPerfLogEnabled(mode)) return
  if (typeof console === "undefined") return

  console.log(`[PERF] ${JSON.stringify({ mode, event, t: perfNow(), ...data })}`)
}
