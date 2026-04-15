import type { QueryOperator } from "@/components/LeftSideMenu/LeftSideMenu"
import {
  buildItemKey,
  normalizeTagQuery,
  parseTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"

export function parseQueryParts(query: string): string[] {
  if (!query.trim()) return []
  return query
    .split(/ AND | OR /i)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function buildQueryFromParts(
  parts: string[],
  itemOperators: Record<string, QueryOperator>,
): string {
  return parts.reduce((acc, part, index) => {
    if (index === 0) return part

    const previousPart = parts[index - 1]
    const previousParsed = parseTagQuery(previousPart)
    const previousKey = previousParsed
      ? buildItemKey(previousParsed.categoryKey, previousParsed.value)
      : ""
    const operator = itemOperators[previousKey] ?? "AND"

    return `${acc} ${operator} ${part}`
  }, "")
}

export function getLeftSideMenuSelectedNames(searchText: string): string[] {
  return parseQueryParts(searchText)
}

export function isMenuDrivenSearchText(searchText: string): boolean {
  const parts = parseQueryParts(searchText)
  return parts.length > 0 && parts.every((part) => parseTagQuery(part) !== null)
}

type NextLeftSideMenuSelectionState = {
  nextQuery: string
  nextOperators: Record<string, QueryOperator>
  shouldResetMenuSettings: boolean
}

export function getNextLeftSideMenuSelectionState(params: {
  currentSearchText: string
  clickedQuery: string
  itemOperators: Record<string, QueryOperator>
}): NextLeftSideMenuSelectionState {
  const { currentSearchText, clickedQuery, itemOperators } = params
  const trimmedCurrentSearchText = currentSearchText.trim()
  const trimmedClickedQuery = clickedQuery.trim()

  if (trimmedCurrentSearchText && !isMenuDrivenSearchText(trimmedCurrentSearchText)) {
    return {
      nextQuery: trimmedClickedQuery,
      nextOperators: {},
      shouldResetMenuSettings: true,
    }
  }

  const currentParts = parseQueryParts(trimmedCurrentSearchText)
  const normalizedClickedQuery = normalizeTagQuery(trimmedClickedQuery)
  const alreadySelected = currentParts.some(
    (existingQuery) => normalizeTagQuery(existingQuery) === normalizedClickedQuery,
  )

  let nextParts: string[]
  let nextOperators: Record<string, QueryOperator>

  if (alreadySelected) {
    nextParts = currentParts.filter(
      (existingQuery) => normalizeTagQuery(existingQuery) !== normalizedClickedQuery,
    )
    const removedQuery = currentParts.find(
      (existingQuery) => normalizeTagQuery(existingQuery) === normalizedClickedQuery,
    )
    const removedParsedQuery = removedQuery ? parseTagQuery(removedQuery) : null

    nextOperators = { ...itemOperators }
    if (removedParsedQuery) {
      delete nextOperators[buildItemKey(removedParsedQuery.categoryKey, removedParsedQuery.value)]
    }
  } else {
    nextParts = [...currentParts, trimmedClickedQuery]
    nextOperators = { ...itemOperators }
  }

  return {
    nextQuery: buildQueryFromParts(nextParts, nextOperators),
    nextOperators,
    shouldResetMenuSettings: false,
  }
}
