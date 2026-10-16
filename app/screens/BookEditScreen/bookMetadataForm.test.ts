import { describe, expect, test } from "vitest"
import { toLanguageNamesForDisplay, toLanguageNamesForUpdate } from "./bookMetadataForm"
import type { MetadataFormValues } from "./bookMetadataForm"

function makeValue(languages: string[]): MetadataFormValues {
  return { languages } as MetadataFormValues
}

describe("toLanguageNamesForUpdate", () => {
  const langNames = { en: "English", ja: "日本語", fr: "Français" }

  test("converts display names back to codes", () => {
    const result = toLanguageNamesForUpdate(makeValue(["English", "日本語"]), langNames)
    expect(result.languages).toEqual(["en", "ja"])
  })

  test("removes 'Unknown' (case-insensitive)", () => {
    const result = toLanguageNamesForUpdate(makeValue(["English", "Unknown", "ja"]), langNames)
    expect(result.languages).toEqual(["en", "ja"])
  })

  test("removes 'unknown' (lowercase)", () => {
    const result = toLanguageNamesForUpdate(makeValue(["unknown", "English"]), langNames)
    expect(result.languages).toEqual(["en"])
  })

  test("removes 'UNKNOWN' (uppercase)", () => {
    const result = toLanguageNamesForUpdate(makeValue(["UNKNOWN", "English"]), langNames)
    expect(result.languages).toEqual(["en"])
  })

  test("removes 'und' language code", () => {
    const result = toLanguageNamesForUpdate(makeValue(["und", "English"]), langNames)
    expect(result.languages).toEqual(["en"])
  })

  test("removes 'UND' (uppercase)", () => {
    const result = toLanguageNamesForUpdate(makeValue(["UND", "English"]), langNames)
    expect(result.languages).toEqual(["en"])
  })

  test("removes '不明' (Japanese)", () => {
    const result = toLanguageNamesForUpdate(makeValue(["不明", "English"]), langNames)
    expect(result.languages).toEqual(["en"])
  })

  test("removes all unknown values and keeps valid ones", () => {
    const result = toLanguageNamesForUpdate(
      makeValue(["Unknown", "English", "und", "日本語", "不明"]),
      langNames,
    )
    expect(result.languages).toEqual(["en", "ja"])
  })

  test("returns empty array when all values are unknown", () => {
    const result = toLanguageNamesForUpdate(makeValue(["Unknown", "und", "不明"]), langNames)
    expect(result.languages).toEqual([])
  })

  test("handles empty langNames (no name-to-code mapping)", () => {
    const result = toLanguageNamesForUpdate(makeValue(["Unknown", "en", "und"]), {})
    expect(result.languages).toEqual(["en"])
  })

  test("preserves non-language fields unchanged", () => {
    const value = { languages: ["Unknown", "English"], title: "Test Book" } as MetadataFormValues
    const result = toLanguageNamesForUpdate(value, langNames)
    expect(result.title).toBe("Test Book")
    expect(result.languages).toEqual(["en"])
  })
})

describe("toLanguageNamesForDisplay", () => {
  const langNames = { en: "English", ja: "日本語" }

  test("converts codes to display names", () => {
    const result = toLanguageNamesForDisplay(makeValue(["en", "ja"]), langNames)
    expect(result.languages).toEqual(["English", "日本語"])
  })

  test("passes through values already in display name form", () => {
    const result = toLanguageNamesForDisplay(makeValue(["English"]), langNames)
    expect(result.languages).toEqual(["English"])
  })
})
