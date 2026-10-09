import { useStores } from "@/models"
import { logger } from "@/utils/logger"
import { describe, expect, it, vi } from "vitest"

// test/vitest-setup.ts が setupFiles として登録した vi.doMock が、
// テストファイルの静的 import に効いていることを確認する。
describe("vitest unit environment", () => {
  it("runs in jsdom", () => {
    expect(typeof document).toBe("object")
    expect(typeof window).toBe("object")
  })

  it("mocks @/models useStores", () => {
    expect(vi.isMockFunction(useStores)).toBe(true)
  })

  it("mocks @/utils/logger", () => {
    expect(vi.isMockFunction(logger.debug)).toBe(true)
    expect(vi.isMockFunction(logger.error)).toBe(true)
  })
})
