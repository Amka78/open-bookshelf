import { describe, expect, test } from "bun:test"
import { generateCfiForPage } from "./cfi"

describe("generateCfiForPage", () => {
  test("generates correct CFI for page 0 (first page)", () => {
    const cfi = generateCfiForPage(0)
    // page 0 -> 1-based page 1 -> spine index 2
    expect(cfi).toBe("epubcfi(/2/2/4/2[page_1]@50:49.87)")
  })

  test("generates correct CFI for page 15 (16th page)", () => {
    const cfi = generateCfiForPage(15)
    // page 15 -> 1-based page 16 -> spine index 32
    expect(cfi).toBe("epubcfi(/2/2/4/32[page_16]@50:49.87)")
  })

  test("generates correct CFI for page 32 (33rd page)", () => {
    const cfi = generateCfiForPage(32)
    // page 32 -> 1-based page 33 -> spine index 66
    expect(cfi).toBe("epubcfi(/2/2/4/66[page_33]@50:49.87)")
  })

  test("allows custom spatial offset", () => {
    const cfi = generateCfiForPage(5, 25, 75.5)
    expect(cfi).toBe("epubcfi(/2/2/4/12[page_6]@25:75.50)")
  })

  test("spatial Y offset is always formatted to 2 decimal places", () => {
    const cfi = generateCfiForPage(0, 50, 0)
    expect(cfi).toBe("epubcfi(/2/2/4/2[page_1]@50:0.00)")
  })

  test("CFI format matches expected pattern from mock data", () => {
    // Verify against mock data patterns:
    // CBZ page 1: epubcfi(/2/2/4/2[page_1]@50:49.87)
    // EPUB page 16: epubcfi(/2/2/4/32[page_16]@50:49.87)
    expect(generateCfiForPage(0)).toBe("epubcfi(/2/2/4/2[page_1]@50:49.87)")
    expect(generateCfiForPage(15)).toBe("epubcfi(/2/2/4/32[page_16]@50:49.87)")
  })
})
