import { describe, expect, test } from "vitest"

import { getNextLibraryViewMode, normalizeLibraryViewMode } from "./libraryViewMode"

describe("normalizeLibraryViewMode", () => {
  test("keeps table when table mode is allowed", () => {
    expect(normalizeLibraryViewMode("table", true)).toBe("table")
  })

  test("falls back to list when table mode is not allowed", () => {
    expect(normalizeLibraryViewMode("table", false)).toBe("list")
  })

  test("leaves grid and list unchanged", () => {
    expect(normalizeLibraryViewMode("grid", false)).toBe("grid")
    expect(normalizeLibraryViewMode("list", false)).toBe("list")
    expect(normalizeLibraryViewMode("grid", true)).toBe("grid")
    expect(normalizeLibraryViewMode("list", true)).toBe("list")
  })
})

describe("getNextLibraryViewMode", () => {
  test("cycles grid, list and table when table mode is allowed", () => {
    expect(getNextLibraryViewMode("grid", true)).toBe("list")
    expect(getNextLibraryViewMode("list", true)).toBe("table")
    expect(getNextLibraryViewMode("table", true)).toBe("grid")
  })

  test("cycles only grid and list when table mode is not allowed", () => {
    expect(getNextLibraryViewMode("grid", false)).toBe("list")
    expect(getNextLibraryViewMode("list", false)).toBe("grid")
    expect(getNextLibraryViewMode("table", false)).toBe("grid")
  })
})
