import { describe, expect, test } from "vitest"

import { getDesktopSetupStep } from "./desktopSetup"

describe("getDesktopSetupStep", () => {
  const base = {
    isLarge: true,
    baseUrl: "http://localhost:8080",
    hasSelectedLibrary: false,
    libraryCount: 0,
  }

  test("does nothing on mobile", () => {
    expect(getDesktopSetupStep({ ...base, isLarge: false, libraryCount: 2 })).toBe("none")
  })

  test("asks for a connection when no base URL is configured", () => {
    expect(getDesktopSetupStep({ ...base, baseUrl: "" })).toBe("connect")
  })

  test("does nothing when a library is already selected", () => {
    expect(getDesktopSetupStep({ ...base, hasSelectedLibrary: true, libraryCount: 2 })).toBe("none")
  })

  test("initializes when a base URL exists but no libraries are loaded", () => {
    expect(getDesktopSetupStep(base)).toBe("initialize")
  })

  test("asks for a library when libraries are loaded but none is selected", () => {
    expect(getDesktopSetupStep({ ...base, libraryCount: 2 })).toBe("data-source")
  })
})
