export type QueryOperator = "AND" | "OR"
export type CalibreFieldOperator = "=" | "~" | "!=" | "!~"

const CATEGORY_QUERY_ALIASES: Record<string, string> = {
  author: "authors",
  authors: "authors",
  format: "formats",
  formats: "formats",
  language: "languages",
  languages: "languages",
  reward: "rating",
  rewards: "rating",
  rating: "rating",
  ratings: "rating",
  series: "series",
}

export function normalizeCategoryKey(categoryKey: string): string {
  const normalizedKey = categoryKey.trim().toLowerCase()

  return CATEGORY_QUERY_ALIASES[normalizedKey] ?? normalizedKey
}

export function buildTagQuery(
  categoryKey: string,
  value: string,
  calibreOp: CalibreFieldOperator = "=",
): string {
  const trimmedValue = value.trim()
  // スペースを含む値を 1 つの語として検索させるため引用符で囲む。
  // 囲まないと calibre-web 側で空白区切りに分解され、
  // 絞込が空結果となり、さらに壊れたクエリに次々連結されて絞込全体が動かなくなる。
  const quotedValue = /\s/.test(trimmedValue) ? `"${trimmedValue}"` : trimmedValue
  return `${normalizeCategoryKey(categoryKey)}:${calibreOp}${quotedValue}`
}

/** Stable key for a menu item: `"category:value"` (no calibre op, lowercase) */
export function buildItemKey(categoryKey: string, value: string): string {
  return `${normalizeCategoryKey(categoryKey)}:${value.trim().toLowerCase()}`
}

export function nextCalibreOperator(current: CalibreFieldOperator): CalibreFieldOperator {
  const cycle: CalibreFieldOperator[] = ["=", "~", "!=", "!~"]
  return cycle[(cycle.indexOf(current) + 1) % cycle.length]
}

function decodeIfPossible(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function stripWrappingQuotes(value: string): string {
  const trimmedValue = value.trim()

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1).trim()
  }

  return trimmedValue
}

function normalizeQueryValue(value: string): string {
  let normalizedValue = decodeIfPossible(value).trim()
  normalizedValue = stripWrappingQuotes(normalizedValue)
  normalizedValue = normalizedValue.replace(/^(!?[=~])/, "").trim()
  normalizedValue = stripWrappingQuotes(normalizedValue)

  return normalizedValue.toLowerCase()
}

export function parseTagQuery(query: string): { categoryKey: string; value: string } | null {
  const trimmedQuery = decodeIfPossible(query).trim()
  const separatorIndex = trimmedQuery.indexOf(":")

  if (separatorIndex <= 0) return null

  const rawCategory = trimmedQuery.slice(0, separatorIndex).trim()
  let rawValue = trimmedQuery.slice(separatorIndex + 1).trim()

  const booleanOperatorMatch = rawValue.match(/\s+(and|or)\s+/i)
  if (booleanOperatorMatch && booleanOperatorMatch.index !== undefined) {
    rawValue = rawValue.slice(0, booleanOperatorMatch.index).trim()
  }

  // strip any leading calibre operator: =, ~, !=, !~
  rawValue = rawValue.replace(/^(!?[=~])/, "").trim()
  // buildTagQuery が空白入り値を引用符で囲むため、value は引用符を外した素の値で返す
  // （buildItemKey 等の下流で引用符を含まないキーと一致させるため）
  rawValue = stripWrappingQuotes(rawValue)

  if (!rawCategory || !rawValue) return null

  return { categoryKey: rawCategory, value: rawValue }
}

export function normalizeTagQuery(query: string | undefined): string | null {
  if (!query) return null

  const parsedQuery = parseTagQuery(query)
  if (!parsedQuery) return null

  const normalizedCategory = normalizeCategoryKey(parsedQuery.categoryKey)
  const normalizedValue = normalizeQueryValue(parsedQuery.value)

  if (!normalizedCategory || !normalizedValue) return null

  return `${normalizedCategory}:=${normalizedValue}`
}
