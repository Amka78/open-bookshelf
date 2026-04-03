import type { CalibreFieldOperator, QueryOperator } from "@/components/LeftSideMenu/LeftSideMenu"
import {
  buildItemKey,
  buildTagQuery,
  normalizeTagQuery,
  parseTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"
import { useStores } from "@/models"
import { useState } from "react"

function parseQueryParts(query: string): string[] {
  if (!query.trim()) return []
  return query
    .split(/ AND | OR /i)
    .map((q) => q.trim())
    .filter(Boolean)
}

export function useDetailSearch(initialQuery: string) {
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary

  const [itemOperators, setItemOperators] = useState<Record<string, QueryOperator>>({})
  const [itemCalibreOperators, setItemCalibreOperators] = useState<
    Record<string, CalibreFieldOperator>
  >({})
  const [pendingQuery, setPendingQuery] = useState(initialQuery)

  const buildNextQuery = (parts: string[], operators: Record<string, QueryOperator>): string =>
    parts.reduce((acc, part, i) => {
      if (i === 0) return part
      const prevParsed = parseTagQuery(parts[i - 1])
      const prevKey = prevParsed ? buildItemKey(prevParsed.categoryKey, prevParsed.value) : ""
      const op = operators[prevKey] ?? "AND"
      return `${acc} ${op} ${part}`
    }, "")

  const onNodePress = async (query: string) => {
    const currentParts = parseQueryParts(pendingQuery)
    const normalizedNew = normalizeTagQuery(query)
    const alreadySelected = currentParts.some((q) => normalizeTagQuery(q) === normalizedNew)

    let nextParts: string[]
    let nextOperators: Record<string, QueryOperator>

    if (alreadySelected) {
      nextParts = currentParts.filter((q) => normalizeTagQuery(q) !== normalizedNew)
      const removedParsed = currentParts.find((q) => normalizeTagQuery(q) === normalizedNew)
      const removedItemKey = removedParsed
        ? (() => {
            const p = parseTagQuery(removedParsed)
            return p ? buildItemKey(p.categoryKey, p.value) : null
          })()
        : null
      nextOperators = { ...itemOperators }
      if (removedItemKey) delete nextOperators[removedItemKey]
    } else {
      nextParts = [...currentParts, query.trim()]
      nextOperators = { ...itemOperators }
    }

    setItemOperators(nextOperators)
    setPendingQuery(buildNextQuery(nextParts, nextOperators))
  }

  const onItemOperatorChange = (itemKey: string, op: QueryOperator) => {
    const nextOperators = { ...itemOperators, [itemKey]: op }
    setItemOperators(nextOperators)
    setPendingQuery(buildNextQuery(parseQueryParts(pendingQuery), nextOperators))
  }

  const onItemCalibreOperatorChange = (
    categoryKey: string,
    value: string,
    newOp: CalibreFieldOperator,
  ) => {
    const itemKey = buildItemKey(categoryKey, value)
    const oldOp = itemCalibreOperators[itemKey] ?? "="
    setItemCalibreOperators((prev) => ({ ...prev, [itemKey]: newOp }))

    const parts = parseQueryParts(pendingQuery)
    const oldNorm = normalizeTagQuery(buildTagQuery(categoryKey, value, oldOp))
    const updatedParts = parts.map((p) =>
      normalizeTagQuery(p) === oldNorm ? buildTagQuery(categoryKey, value, newOp) : p,
    )

    if (updatedParts.some((p, i) => p !== parts[i])) {
      setPendingQuery(buildNextQuery(updatedParts, itemOperators))
    }
  }

  return {
    tagBrowser: selectedLibrary?.tagBrowser ?? [],
    itemOperators,
    itemCalibreOperators,
    pendingQuery,
    selectedNames: parseQueryParts(pendingQuery),
    onNodePress,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  }
}
