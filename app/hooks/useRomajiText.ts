import i18n from "i18n-js"
import * as transliterationModule from "transliteration"
import { toRomaji } from "wanakana"

const japaneseLocalePrefix = "ja"
const kanjiRegex = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/
const nonKanjiRegex = /[^\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]+/g

function resolveTransliterate() {
  const candidate = transliterationModule as {
    transliterate?: unknown
    default?: unknown
  }

  if (typeof candidate.transliterate === "function") {
    return candidate.transliterate as (value: string) => string
  }

  if (typeof candidate.default === "function") {
    return candidate.default as (value: string) => string
  }

  if (
    typeof candidate.default === "object" &&
    candidate.default !== null &&
    "transliterate" in candidate.default &&
    typeof (candidate.default as { transliterate?: unknown }).transliterate === "function"
  ) {
    return (candidate.default as { transliterate: (value: string) => string }).transliterate
  }

  return (value: string) => value
}

const transliterate = resolveTransliterate()

function isJapaneseLocale() {
  return i18n.currentLocale().toLowerCase().startsWith(japaneseLocalePrefix)
}

function transliterateWithoutKanji(value: string) {
  return value.replace(nonKanjiRegex, (segment) => toRomaji(segment))
}

export function useRomajiText() {
  const toRomajiText = (value: string) => {
    const converted =
      isJapaneseLocale() && kanjiRegex.test(value)
        ? transliterateWithoutKanji(value)
        : transliterate(value)

    return converted.replace(/\s+/g, " ").trim()
  }

  const toSortValue = (value: unknown) => {
    const converted = toRomajiText(String(value ?? ""))
    return converted.length > 0 ? converted : null
  }

  const toAuthorSortValue = (authorsValue: unknown) => {
    const source = Array.isArray(authorsValue)
      ? authorsValue
      : typeof authorsValue === "string"
        ? [authorsValue]
        : []

    const converted = source
      .map((entry) => toSortValue(entry))
      .filter((entry) => entry !== null)
      .filter((entry) => entry.length > 0)
      .join(" & ")

    return converted.length > 0 ? converted : null
  }

  return {
    toRomajiText,
    toSortValue,
    toAuthorSortValue,
  }
}
