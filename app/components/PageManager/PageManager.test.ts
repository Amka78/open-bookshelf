import { describe, expect, test } from "bun:test"
import { formatPageIndicator } from "./pageIndicator"

describe("formatPageIndicator", () => {
  test("shows single page indicator for non-facing mode", () => {
    expect(formatPageIndicator(0, 10, false)).toBe("1/10")
    expect(formatPageIndicator(4, 10, false)).toBe("5/10")
  })

  test("shows page range for facing-page mode", () => {
    expect(formatPageIndicator(0, 10, true)).toBe("1-2/10")
    expect(formatPageIndicator(2, 10, true)).toBe("3-4/10")
  })

  test("falls back to a single page when the spread has no next page", () => {
    expect(formatPageIndicator(4, 5, true)).toBe("5/5")
  })

  test("shows single page when facingSecondPageExists is false", () => {
    expect(formatPageIndicator(0, 10, true, false)).toBe("1/10")
    expect(formatPageIndicator(2, 10, true, false)).toBe("3/10")
  })

  test("shows page range when facingSecondPageExists is true", () => {
    expect(formatPageIndicator(0, 10, true, true)).toBe("1-2/10")
    expect(formatPageIndicator(2, 10, true, true)).toBe("3-4/10")
  })
})
