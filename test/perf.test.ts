import { afterEach, describe, expect, test, vi } from "vitest"

const ORIGINAL_MODE = process.env.EXPO_PUBLIC_PERF_LOG

async function loadPerf(mode?: string) {
  vi.resetModules()
  if (mode === undefined) {
    process.env.EXPO_PUBLIC_PERF_LOG = ""
  } else {
    process.env.EXPO_PUBLIC_PERF_LOG = mode
  }
  return await import("@/utils/perf")
}

afterEach(() => {
  if (ORIGINAL_MODE === undefined) {
    process.env.EXPO_PUBLIC_PERF_LOG = ""
  } else {
    process.env.EXPO_PUBLIC_PERF_LOG = ORIGINAL_MODE
  }
  vi.restoreAllMocks()
  vi.resetModules()
})

describe("perf logging", () => {
  test("stays silent when no mode is requested", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const { perfLog } = await loadPerf(undefined)

    perfLog("search", "api.getLibrary", { ms: 10 })

    expect(spy).not.toHaveBeenCalled()
  })

  test("stays silent for modes that are not enabled", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const { perfLog } = await loadPerf("other")

    perfLog("search", "api.getLibrary", { ms: 10 })

    expect(spy).not.toHaveBeenCalled()
  })

  test("writes one JSON line with a shared clock when the mode is enabled", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const { perfLog } = await loadPerf("search")

    perfLog("search", "api.getLibrary", { ms: 12, ok: true, num: 50 })

    expect(spy).toHaveBeenCalledTimes(1)
    const line = spy.mock.calls[0][0] as string
    expect(line.startsWith("[PERF] ")).toBe(true)

    const payload = JSON.parse(line.slice("[PERF] ".length))
    expect(payload).toMatchObject({ mode: "search", event: "api.getLibrary", ms: 12, ok: true })
    expect(typeof payload.t).toBe("number")
  })

  test("all enables every mode", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const { perfLog, isPerfLogEnabled } = await loadPerf("all")

    expect(isPerfLogEnabled("search")).toBe(true)
    perfLog("search", "converted", { books: 50 })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
