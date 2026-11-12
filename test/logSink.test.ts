import { describe, expect, test } from "vitest"
import { logFilePath, normalizeEntries, parseLogSinkBody } from "../scripts/logSink"

describe("logSink parseLogSinkBody", () => {
  test("NDJSON（1 行 1 JSON）を複数件として読む", () => {
    const body = ['{"level":"debug","msg":"one"}', '{"level":"info","msg":"two"}'].join("\n")

    expect(parseLogSinkBody(body)).toEqual([
      { level: "debug", msg: "one" },
      { level: "info", msg: "two" },
    ])
  })

  test("単体 JSON と JSON 配列も受け付ける", () => {
    expect(parseLogSinkBody('{"level":"warn","msg":"solo"}')).toEqual([
      { level: "warn", msg: "solo" },
    ])
    expect(parseLogSinkBody('[{"msg":"a"},{"msg":"b"}]')).toEqual([{ msg: "a" }, { msg: "b" }])
  })

  test("空行は無視し、壊れた行があれば全体を拒否する", () => {
    expect(parseLogSinkBody("\n\n")).toEqual([])
    expect(parseLogSinkBody('{"msg":"ok"}\nnot json')).toBeNull()
  })
})

describe("logSink normalizeEntries", () => {
  test("配列と単体の両方を受け付け、フィールドを補完する", () => {
    const entries = normalizeEntries({ level: "warn", platform: "web", msg: "hello" })

    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ level: "warn", platform: "web", msg: "hello" })
    expect(entries[0].ts).toEqual(expect.any(String))
    expect(entries[0].session).toBe("nosession")
  })

  test("未知の level は log にフォールバックする", () => {
    const [entry] = normalizeEntries({ level: "trace", platform: "android", msg: "" })
    expect(entry.level).toBe("log")
  })

  test("platform にパス区切りやドットが来てもファイル名に使わない", () => {
    const [entry] = normalizeEntries({ level: "info", platform: "../../etc/passwd", msg: "x" })
    expect(entry.platform).toBe("unknown")
    expect(logFilePath(entry.platform)).toMatch(/logs[/\\]unknown\.ndjson$/)
  })

  test("長すぎる msg は切り詰めて残量を記録する", () => {
    const longMessage = "a".repeat(40_000)
    const [entry] = normalizeEntries({ level: "info", platform: "web", msg: longMessage })

    expect(entry.msg.length).toBeLessThan(longMessage.length)
    expect(entry.msg).toContain("chars]")
  })

  test("オブジェクトでない要素は捨てる", () => {
    expect(
      normalizeEntries([null, "text", 42, { level: "info", platform: "web", msg: "ok" }]),
    ).toHaveLength(1)
  })

  test("巨大な data は truncated に置き換える", () => {
    const [entry] = normalizeEntries({
      level: "debug",
      platform: "web",
      msg: "big",
      data: { payload: "b".repeat(10_000) },
    })

    expect(entry.data).toEqual({ truncated: expect.stringContaining("chars]") })
  })

  test("循環参照する data は unserializable として残す", () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    const [entry] = normalizeEntries({
      level: "debug",
      platform: "web",
      msg: "circular",
      data: circular,
    })
    expect(entry.data).toBe("[unserializable]")
  })
})
