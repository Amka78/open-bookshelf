import type { Category } from "@/models/calibre"
import { usePalette } from "@/theme"
import { ScrollView } from "@gluestack-ui/themed"
import React, { memo, useCallback, useMemo } from "react"

import { useIncrementalRender } from "@/hooks/useIncrementalRender"
import { observer } from "mobx-react-lite"
import { LeftSideMenuItem } from "../LeftSideMenuItem/LeftSideMenuItem"

export type LeftSideMenuProps = {
  tagBrowser: Category[]
  selectedName?: string
  onNodePress: (nodeName: string) => Promise<void>
}

// Threshold for enabling incremental rendering
const INCREMENTAL_RENDER_THRESHOLD = 100

// Memoized node list component with incremental rendering
const NodeList = memo(
  ({
    children,
    categoryName,
    onPress,
    selectedName,
  }: {
    children: Array<{ name: string; count: number }>
    categoryName: string
    onPress: (name: string) => Promise<void>
    selectedName?: string
  }) => {
    const shouldUseIncremental = children.length > INCREMENTAL_RENDER_THRESHOLD
    const visibleCount = useIncrementalRender(children.length, 50, shouldUseIncremental)

    const handlePress = useCallback(async () => {
      await onPress(categoryName)
    }, [onPress, categoryName])

    return (
      <>
        {children.slice(0, visibleCount).map((node) => (
          <LeftSideMenuItem
            key={node.name}
            mode="node"
            count={node.count}
            name={node.name}
            onLastNodePress={handlePress}
            selected={node.name === selectedName}
          />
        ))}
      </>
    )
  },
)

// Memoized subcategory component
const SubCategoryItem = memo(
  ({
    subCategory,
    onPress,
    selectedName,
    categoryName,
  }: {
    subCategory: { name: string; count: number; children: Array<{ name: string; count: number }> }
    onPress: (name: string) => Promise<void>
    selectedName?: string
    categoryName: string
  }) => {
    const handlePress = useCallback(async () => {
      await onPress(subCategory.name)
    }, [onPress, subCategory.name])

    return (
      <LeftSideMenuItem
        mode="subCategory"
        count={subCategory.count}
        name={subCategory.name}
        key={subCategory.name}
        onLastNodePress={handlePress}
        selected={subCategory.name === selectedName}
      >
        {subCategory.children.length > 0 && (
          <NodeList
            children={subCategory.children}
            categoryName={categoryName}
            onPress={onPress}
            selectedName={selectedName}
          />
        )}
      </LeftSideMenuItem>
    )
  },
)

// Memoized subcategory list with incremental rendering
const SubCategoryList = memo(
  ({
    subCategories,
    categoryName,
    onPress,
    selectedName,
  }: {
    subCategories: Array<{
      name: string
      count: number
      children: Array<{ name: string; count: number }>
    }>
    categoryName: string
    onPress: (name: string) => Promise<void>
    selectedName?: string
  }) => {
    const shouldUseIncremental = subCategories.length > INCREMENTAL_RENDER_THRESHOLD
    const visibleCount = useIncrementalRender(subCategories.length, 50, shouldUseIncremental)

    return (
      <>
        {subCategories.slice(0, visibleCount).map((subCategory) => (
          <SubCategoryItem
            key={subCategory.name}
            subCategory={subCategory}
            onPress={onPress}
            selectedName={selectedName}
            categoryName={categoryName}
          />
        ))}
      </>
    )
  },
)

// Memoized category component
const CategoryItem = memo(
  ({
    category,
    onPress,
    selectedName,
  }: {
    category: Category
    onPress: (name: string) => Promise<void>
    selectedName?: string
  }) => {
    return (
      <LeftSideMenuItem name={category.name} count={category.count} key={category.name}>
        {category.subCategory.length > 0 && (
          <SubCategoryList
            subCategories={category.subCategory}
            categoryName={category.name}
            onPress={onPress}
            selectedName={selectedName}
          />
        )}
      </LeftSideMenuItem>
    )
  },
)

export const LeftSideMenu = observer((props: LeftSideMenuProps) => {
  const palette = usePalette()
  return props.tagBrowser ? (
    <ScrollView
      backgroundColor={palette.surface}
      maxWidth={"$32"}
      height={"$full"}
      borderRightWidth={1}
      borderRightColor={palette.borderSubtle}
    >
      {props.tagBrowser.map((category) => (
        <CategoryItem
          key={category.name}
          category={category}
          onPress={props.onNodePress}
          selectedName={props.selectedName}
        />
      ))}
    </ScrollView>
  ) : undefined
})
