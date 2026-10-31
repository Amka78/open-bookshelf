import { useIncrementalRender } from "@/hooks/useIncrementalRender"
import type { Category } from "@/models/calibre"
import { ScrollView } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"

import { LeftSideMenuItem } from "@/components"
import {
  buildItemKey,
  buildTagQuery,
  type CalibreFieldOperator,
  nextCalibreOperator,
  normalizeTagQuery,
  type QueryOperator,
} from "./leftSideMenuQuery"

export type LeftSideMenuContentProps = {
  tagBrowser: Category[]
  selectedNames?: string[]
  itemOperators?: Record<string, QueryOperator>
  itemCalibreOperators?: Record<string, CalibreFieldOperator>
  onNodePress: (nodeName: string) => Promise<void>
  onSubCategoryLongPress?: (name: string) => void
  onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
  onItemCalibreOperatorChange?: (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => void
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

const NodeItem = ({
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
  onItemCalibreOperatorChange?: (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => void
}) => {
  const itemKey = buildItemKey(categoryKey, node.name)
  const calibreOp: CalibreFieldOperator = itemCalibreOperators?.[itemKey] ?? "="
  const query = buildTagQuery(categoryKey, node.name, calibreOp)
  const isSelected = isTagQuerySelected(selectedNames, categoryKey, node.name)
  const isLastSelected =
    (selectedNames?.length ?? 0) <= 1 ||
    normalizeTagQuery(selectedNames?.[selectedNames.length - 1]) === normalizeTagQuery(query)
  const operator: QueryOperator = itemOperators?.[itemKey] ?? "AND"

  const handlePress = async () => {
    await onPress(query)
  }

  const handleOperatorToggle = () => {
    onItemOperatorChange?.(itemKey, operator === "AND" ? "OR" : "AND")
  }

  const handleCalibreOperatorToggle = () => {
    onItemCalibreOperatorChange?.(categoryKey, node.name, nextCalibreOperator(calibreOp))
  }

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
}

const NodeList = ({
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
  onItemCalibreOperatorChange?: (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => void
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
}

const SubCategoryItem = ({
  subCategory,
  categoryKey,
  onPress,
  onSubCategoryLongPress,
  selectedNames,
  itemOperators,
  itemCalibreOperators,
  onItemOperatorChange,
  onItemCalibreOperatorChange,
}: {
  subCategory: MenuSubCategory
  categoryKey: string
  onPress: (query: string) => Promise<void>
  onSubCategoryLongPress?: (name: string) => void
  selectedNames?: string[]
  itemOperators?: Record<string, QueryOperator>
  itemCalibreOperators?: Record<string, CalibreFieldOperator>
  onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
  onItemCalibreOperatorChange?: (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => void
}) => {
  const itemKey = buildItemKey(categoryKey, subCategory.name)
  const calibreOp: CalibreFieldOperator = itemCalibreOperators?.[itemKey] ?? "="
  const query = buildTagQuery(categoryKey, subCategory.name, calibreOp)
  const isSelected = isTagQuerySelected(selectedNames, categoryKey, subCategory.name)
  const operator: QueryOperator = itemOperators?.[itemKey] ?? "AND"

  const isLastSelected =
    (selectedNames?.length ?? 0) <= 1 ||
    normalizeTagQuery(selectedNames?.[selectedNames.length - 1]) === normalizeTagQuery(query)

  const handlePress = async () => {
    await onPress(query)
  }

  const handleOperatorToggle = () => {
    onItemOperatorChange?.(itemKey, operator === "AND" ? "OR" : "AND")
  }

  const handleCalibreOperatorToggle = () => {
    onItemCalibreOperatorChange?.(categoryKey, subCategory.name, nextCalibreOperator(calibreOp))
  }

  return (
    <LeftSideMenuItem
      mode="subCategory"
      depth={1}
      count={subCategory.count}
      name={subCategory.name}
      onLastNodePress={handlePress}
      onSubCategoryLongPress={onSubCategoryLongPress}
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
}

const SubCategoryList = ({
  subCategories,
  categoryKey,
  onPress,
  onSubCategoryLongPress,
  selectedNames,
  itemOperators,
  itemCalibreOperators,
  onItemOperatorChange,
  onItemCalibreOperatorChange,
}: {
  subCategories: MenuSubCategory[]
  categoryKey: string
  onPress: (query: string) => Promise<void>
  onSubCategoryLongPress?: (name: string) => void
  selectedNames?: string[]
  itemOperators?: Record<string, QueryOperator>
  itemCalibreOperators?: Record<string, CalibreFieldOperator>
  onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
  onItemCalibreOperatorChange?: (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => void
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
          onSubCategoryLongPress={onSubCategoryLongPress}
          selectedNames={selectedNames}
          itemOperators={itemOperators}
          itemCalibreOperators={itemCalibreOperators}
          onItemOperatorChange={onItemOperatorChange}
          onItemCalibreOperatorChange={onItemCalibreOperatorChange}
        />
      ))}
    </>
  )
}

const CategoryItem = ({
  category,
  onPress,
  onSubCategoryLongPress,
  selectedNames,
  itemOperators,
  itemCalibreOperators,
  onItemOperatorChange,
  onItemCalibreOperatorChange,
}: {
  category: Category
  onPress: (query: string) => Promise<void>
  onSubCategoryLongPress?: (name: string) => void
  selectedNames?: string[]
  itemOperators?: Record<string, QueryOperator>
  itemCalibreOperators?: Record<string, CalibreFieldOperator>
  onItemOperatorChange?: (itemKey: string, op: QueryOperator) => void
  onItemCalibreOperatorChange?: (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => void
}) => {
  const itemSubCategories: MenuSubCategory[] = category.subCategory.map((subCategory) => ({
    name: subCategory.name,
    count: subCategory.count,
    children: subCategory.children.map((node) => ({
      name: node.name,
      count: node.count,
    })),
  }))

  const isOneLevelCategory = ONE_LEVEL_CATEGORY_KEYS.has(category.category.toLowerCase())

  const subCategories: MenuSubCategory[] = toInitialGroupedSubCategories(itemSubCategories)

  const leafNodes: MenuNode[] = toLeafNodes(itemSubCategories)

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
          onSubCategoryLongPress={onSubCategoryLongPress}
          selectedNames={selectedNames}
          itemOperators={itemOperators}
          itemCalibreOperators={itemCalibreOperators}
          onItemOperatorChange={onItemOperatorChange}
          onItemCalibreOperatorChange={onItemCalibreOperatorChange}
        />
      ) : null}
    </LeftSideMenuItem>
  )
}

/**
 * タグブラウザの内容のみ。幅・背景・境界線は持たないので、
 * サイドバー（LeftSideMenu）でも全画面（DetailSearchScreen）でも同じ内容を使える。
 */
export const LeftSideMenuContent = observer((props: LeftSideMenuContentProps) => {
  if (!props.tagBrowser) {
    return null
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
      {props.tagBrowser.map((category) => (
        <CategoryItem
          key={category.name}
          category={category}
          onPress={props.onNodePress}
          onSubCategoryLongPress={props.onSubCategoryLongPress}
          selectedNames={props.selectedNames}
          itemOperators={props.itemOperators}
          itemCalibreOperators={props.itemCalibreOperators}
          onItemOperatorChange={props.onItemOperatorChange}
          onItemCalibreOperatorChange={props.onItemCalibreOperatorChange}
        />
      ))}
    </ScrollView>
  )
})
