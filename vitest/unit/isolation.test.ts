import { describe, expect, it } from "vitest"

describe("unit project isolation", () => {
  it("runs in jsdom without the bun preload mocks", () => {
    expect(typeof document).toBe("object")

    const globals = globalThis as Record<string, unknown>
    expect(globals.__reactNativeMock).toBeUndefined()
    expect(globals.__componentsMock).toBeUndefined()
    expect(globals.__gluestackMock).toBeUndefined()
  })
})
