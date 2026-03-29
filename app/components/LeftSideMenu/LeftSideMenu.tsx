import { useIncrementalRender } from "@/hooks/useIncrementalRender"
import type { Category } from "@/models/calibre"
import { usePalette } from "@/theme"
import { ScrollView } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { memo, useCallback, useMemo } from "react"

import { Box } from "../Box/Box"
import { LeftSideMenuItem } from "../LeftSideMenuItem/LeftSideMenuItem"

export type QueryOperator = "AND" | "OR"
export type CalibreFieldOperator = "=" | "~" | "!=" | "!~"

export type LeftSideMenuProps = {
  tagBrowser: Category[]
  selectedNames?: string[]
  itemOperators?: Record<string, QueryOperator>
  itemCalibreOperators?: Record<string, CalibreFieldOperator>
  onNodePress: (nodeName: string) => Promise<void>
  onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
  onItemCalibreOperatorChange?: (categoryKey: string, value: string, op: CalibreFieldOperator) => void
}

type MenuNode = {
  name: string
  count: number
}

type MenuSubCategory = {
  name: string
  count: number
  children: MenuNode[]
}

const INCREMENTAL_RENDER_THRESHOLD = 100
const FALLBACK_INITIAL = "#"
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
const ONE_LEVEL_CATEGORY_KEYS = new Set([
  "language",
  "languages",
  "format",
  "formats",
  "reward",
  "rewards",
  "rating",
  "ratings",
])

export function normalizeCategoryKey(categoryKey: string): string {
  const normalizedKey = categoryKey.trim().toLowerCase()

  return CATEGORY_QUERY_ALIASES[normalizedKey] ?? normalizedKey
}

export function buildTagQuery(
  categoryKey: string,
  value: string,
  calibreOp: CalibreFieldOperator = "=",
): string {
  return `${normalizeCategoryKey(categoryKey)}:${calibreOp}${value.trim()}`
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

function isTagQuerySelected(
  selectedQueries: string[] | undefined,
  categoryKey: string,
  value: string,
): boolean {
  if (!selectedQueries || selectedQueries.length === 0) return false

  const normalizedTargetQuery = normalizeTagQuery(buildTagQuery(categoryKey, value))
  if (!normalizedTargetQuery) return false

  return selectedQueries.some((q) => normalizeTagQuery(q) === normalizedTargetQuery)
}

function getInitialCharacter(name: string): string {
  const trimmedName = name.trim()

  if (!trimmedName.length) return FALLBACK_INITIAL

  return trimmedName.at(0)?.toUpperCase() ?? FALLBACK_INITIAL
}

function toInitialGroupedSubCategories(subCategories: MenuSubCategory[]): MenuSubCategory[] {
  const itemCountMap = new Map<string, number>()

  subCategories.forEach((subCategory) => {
    if (subCategory.children.length > 0) {
      subCategory.children.forEach((node) => {
        const normalizedItem = node.name.trim()
        if (!normalizedItem.length) return

        itemCountMap.set(normalizedItem, (itemCountMap.get(normalizedItem) ?? 0) + node.count)
      })
      return
    }

    const normalizedItem = subCategory.name.trim()
    if (!normalizedItem.length) return

    itemCountMap.set(normalizedItem, (itemCountMap.get(normalizedItem) ?? 0) + subCategory.count)
  })

  const initialMap = new Map<string, MenuNode[]>()

  Array.from(itemCountMap.entries()).forEach(([itemName, count]) => {
    const initial = getInitialCharacter(itemName)
    const groupedItems = initialMap.get(initial) ?? []

    groupedItems.push({ name: itemName, count })
    initialMap.set(initial, groupedItems)
  })

  return Array.from(initialMap.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([initial, items]) => {
      const sortedItems = items.sort((first, second) => first.name.localeCompare(second.name))

      return {
        name: initial,
        count: sortedItems.reduce((total, item) => total + item.count, 0),
        children: sortedItems,
      }
    })
}

function toLeafNodes(subCategories: MenuSubCategory[]): MenuNode[] {
  const itemCountMap = new Map<string, number>()

  subCategories.forEach((subCategory) => {
    if (subCategory.children.length > 0) {
      subCategory.children.forEach((node) => {
        const normalizedItem = node.name.trim()
        if (!normalizedItem.length) return

        itemCountMap.set(normalizedItem, (itemCountMap.get(normalizedItem) ?? 0) + node.count)
      })
      return
    }

    const normalizedItem = subCategory.name.trim()
    if (!normalizedItem.length) return

    itemCountMap.set(normalizedItem, (itemCountMap.get(normalizedItem) ?? 0) + subCategory.count)
  })

  return Array.from(itemCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => first.name.localeCompare(second.name))
}

const NodeItem = memo(
  ({
    node,
    depth,
    categoryKey,
    onPress,
    selectedNames,
    itemOperators,
    itemCalibreOperators,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  }: {
    node: MenuNode
    depth: number
    categoryKey: string
    onPress: (query: string) => Promise<void>
    selectedNames?: string[]
    itemOperators?: Record<string, QueryOperator>
    itemCalibreOperators?: Record<string, CalibreFieldOperator>
    onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
    onItemCalibreOperatorChange?: (categoryKey: string, value: string, op: CalibreFieldOperator) => void
  }) => {
    const itemKey = useMemo(() => buildItemKey(categoryKey, node.name), [categoryKey, node.name])
    const calibreOp: CalibreFieldOperator = itemCalibreOperators?.[itemKey] ?? "="
    const query = useMemo(
      () => buildTagQuery(categoryKey, node.name, calibreOp),
      [categoryKey, node.name, calibreOp],
    )
    const isSelected = useMemo(
      () => isTagQuerySelected(selectedNames, categoryKey, node.name),
      [selectedNames, categoryKey, node.name],
    )
    const isLastSelected = useMemo(
      () =>
        (selectedNames?.length ?? 0) <= 1 ||
        normalizeTagQuery(selectedNames?.[selectedNames.length - 1]) ===
          normalizeTagQuery(query),
      [selectedNames, query],
    )
    const operator: QueryOperator = itemOperators?.[itemKey] ?? "AND"

    const handlePress = useCallback(async () => {
      await onPress(query)
    }, [onPress, query])

    const handleOperatorToggle = useCallback(() => {
      onItemOperatorChange?.(itemKey, operator === "AND" ? "OR" : "AND")
    }, [onItemOperatorChange, itemKey, operator])

    const handleCalibreOperatorToggle = useCallback(() => {
      onItemCalibreOperatorChange?.(categoryKey, node.name, nextCalibreOperator(calibreOp))
    }, [onItemCalibreOperatorChange, categoryKey, node.name, calibreOp])

    return (
      <LeftSideMenuItem
        mode="node"
        depth={depth}
        count={node.count}
        name={node.name}
        onLastNodePress={handlePress}
        selected={isSelected}
        operator={operator}
        onOperatorToggle={isSelected && !isLastSelected ? handleOperatorToggle : undefined}
        calibreOperator={calibreOp}
        onCalibreOperatorToggle={handleCalibreOperatorToggle}
      />
    )
  },
)

const NodeList = memo(
  ({
    nodes,
    depth,
    categoryKey,
    onPress,
    selectedNames,
    itemOperators,
    itemCalibreOperators,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  }: {
    nodes: MenuNode[]
    depth: number
    categoryKey: string
    onPress: (query: string) => Promise<void>
    selectedNames?: string[]
    itemOperators?: Record<string, QueryOperator>
    itemCalibreOperators?: Record<string, CalibreFieldOperator>
    onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
    onItemCalibreOperatorChange?: (categoryKey: string, value: string, op: CalibreFieldOperator) => void
  }) => {
    const shouldUseIncremental = nodes.length > INCREMENTAL_RENDER_THRESHOLD
    const visibleCount = useIncrementalRender(nodes.length, 50, shouldUseIncremental)

    return (
      <>
        {nodes.slice(0, visibleCount).map((node) => (
          <NodeItem
            key={node.name}
            node={node}
            depth={depth}
            categoryKey={categoryKey}
            onPress={onPress}
            selectedNames={selectedNames}
            itemOperators={itemOperators}
            itemCalibreOperators={itemCalibreOperators}
            onItemOperatorChange={onItemOperatorChange}
            onItemCalibreOperatorChange={onItemCalibreOperatorChange}
          />
        ))}
      </>
    )
  },
)

const SubCategoryItem = memo(
  ({
    subCategory,
    categoryKey,
    onPress,
    selectedNames,
    itemOperators,
    itemCalibreOperators,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  }: {
    subCategory: MenuSubCategory
    categoryKey: string
    onPress: (query: string) => Promise<void>
    selectedNames?: string[]
    itemOperators?: Record<string, QueryOperator>
    itemCalibreOperators?: Record<string, CalibreFieldOperator>
    onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
    onItemCalibreOperatorChange?: (categoryKey: string, value: string, op: CalibreFieldOperator) => void
  }) => {
    const itemKey = useMemo(
      () => buildItemKey(categoryKey, subCategory.name),
      [categoryKey, subCategory.name],
    )
    const calibreOp: CalibreFieldOperator = itemCalibreOperators?.[itemKey] ?? "="
    const query = useMemo(
      () => buildTagQuery(categoryKey, subCategory.name, calibreOp),
      [categoryKey, subCategory.name, calibreOp],
    )
    const isSelected = useMemo(
      () => isTagQuerySelected(selectedNames, categoryKey, subCategory.name),
      [selectedNames, categoryKey, subCategory.name],
    )
    const operator: QueryOperator = itemOperators?.[itemKey] ?? "AND"

    const isLastSelected = useMemo(
      () =>
        (selectedNames?.length ?? 0) <= 1 ||
        normalizeTagQuery(selectedNames?.[selectedNames.length - 1]) ===
          normalizeTagQuery(query),
      [selectedNames, query],
    )

    const handlePress = useCallback(async () => {
      await onPress(query)
    }, [onPress, query])

    const handleOperatorToggle = useCallback(() => {
      onItemOperatorChange?.(itemKey, operator === "AND" ? "OR" : "AND")
    }, [onItemOperatorChange, itemKey, operator])

    const handleCalibreOperatorToggle = useCallback(() => {
      onItemCalibreOperatorChange?.(
        categoryKey,
        subCategory.name,
        nextCalibreOperator(calibreOp),
      )
    }, [onItemCalibreOperatorChange, categoryKey, subCategory.name, calibreOp])

    return (
      <LeftSideMenuItem
        mode="subCategory"
        depth={1}
        count={subCategory.count}
        name={subCategory.name}
        onLastNodePress={handlePress}
        selected={isSelected}
        operator={operator}
        onOperatorToggle={isSelected && !isLastSelected ? handleOperatorToggle : undefined}
        calibreOperator={calibreOp}
        onCalibreOperatorToggle={handleCalibreOperatorToggle}
      >
        {subCategory.children.length > 0 && (
          <NodeList
            nodes={subCategory.children}
            depth={2}
            categoryKey={categoryKey}
            onPress={onPress}
            selectedNames={selectedNames}
            itemOperators={itemOperators}
            itemCalibreOperators={itemCalibreOperators}
            onItemOperatorChange={onItemOperatorChange}
            onItemCalibreOperatorChange={onItemCalibreOperatorChange}
          />
        )}
      </LeftSideMenuItem>
    )
  },
)

const SubCategoryList = memo(
  ({
    subCategories,
    categoryKey,
    onPress,
    selectedNames,
    itemOperators,
    itemCalibreOperators,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  }: {
    subCategories: MenuSubCategory[]
    categoryKey: string
    onPress: (query: string) => Promise<void>
    selectedNames?: string[]
    itemOperators?: Record<string, QueryOperator>
    itemCalibreOperators?: Record<string, CalibreFieldOperator>
    onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
    onItemCalibreOperatorChange?: (categoryKey: string, value: string, op: CalibreFieldOperator) => void
  }) => {
    const shouldUseIncremental = subCategories.length > INCREMENTAL_RENDER_THRESHOLD
    const visibleCount = useIncrementalRender(subCategories.length, 50, shouldUseIncremental)

    return (
      <>
        {subCategories.slice(0, visibleCount).map((subCategory) => (
          <SubCategoryItem
            key={subCategory.name}
            subCategory={subCategory}
            categoryKey={categoryKey}
            onPress={onPress}
            selectedNames={selectedNames}
            itemOperators={itemOperators}
            itemCalibreOperators={itemCalibreOperators}
            onItemOperatorChange={onItemOperatorChange}
            onItemCalibreOperatorChange={onItemCalibreOperatorChange}
          />
        ))}
      </>
    )
  },
)

const CategoryItem = memo(
  ({
    category,
    onPress,
    selectedNames,
    itemOperators,
    itemCalibreOperators,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  }: {
    category: Category
    onPress: (query: string) => Promise<void>
    selectedNames?: string[]
    itemOperators?: Record<string, QueryOperator>
    itemCalibreOperators?: Record<string, CalibreFieldOperator>
    onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
    onItemCalibreOperatorChange?: (categoryKey: string, value: string, op: CalibreFieldOperator) => void
  }) => {
    const itemSubCategories: MenuSubCategory[] = useMemo(
      () =>
        category.subCategory.map((subCategory) => ({
          name: subCategory.name,
          count: subCategory.count,
          children: subCategory.children.map((node) => ({
            name: node.name,
            count: node.count,
          })),
        })),
      [category.subCategory],
    )

    const isOneLevelCategory = useMemo(
      () => ONE_LEVEL_CATEGORY_KEYS.has(category.category.toLowerCase()),
      [category.category],
    )

    const subCategories: MenuSubCategory[] = useMemo(() => {
      return toInitialGroupedSubCategories(itemSubCategories)
    }, [itemSubCategories])

    const leafNodes: MenuNode[] = useMemo(() => {
      return toLeafNodes(itemSubCategories)
    }, [itemSubCategories])

    return (
      <LeftSideMenuItem name={category.name} count={category.count} depth={0}>
        {isOneLevelCategory ? (
          <NodeList
            nodes={leafNodes}
            depth={1}
            categoryKey={category.category}
            onPress={onPress}
            selectedNames={selectedNames}
            itemOperators={itemOperators}
            itemCalibreOperators={itemCalibreOperators}
            onItemOperatorChange={onItemOperatorChange}
            onItemCalibreOperatorChange={onItemCalibreOperatorChange}
          />
        ) : subCategories.length > 0 ? (
          <SubCategoryList
            subCategories={subCategories}
            categoryKey={category.category}
            onPress={onPress}
            selectedNames={selectedNames}
            itemOperators={itemOperators}
            itemCalibreOperators={itemCalibreOperators}
            onItemOperatorChange={onItemOperatorChange}
            onItemCalibreOperatorChange={onItemCalibreOperatorChange}
          />
        ) : null}
      </LeftSideMenuItem>
    )
  },
)

export const LeftSideMenu = observer((props: LeftSideMenuProps) => {
  const palette = usePalette()

  return props.tagBrowser ? (
    <Box
      backgroundColor={palette.surface}
      maxWidth={"$48"}
      height={"$full"}
      borderRightWidth={1}
      borderRightColor={palette.borderSubtle}
    >
      <ScrollView>
        {props.tagBrowser.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            onPress={props.onNodePress}
            selectedNames={props.selectedNames}
            itemOperators={props.itemOperators}
            itemCalibreOperators={props.itemCalibreOperators}
            onItemOperatorChange={props.onItemOperatorChange}
            onItemCalibreOperatorChange={props.onItemCalibreOperatorChange}
          />
        ))}
      </ScrollView>
    </Box>
  ) : undefined
})
