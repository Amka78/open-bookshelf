import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import type { Category } from "@/models/calibre"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { LeftSideMenu, type CalibreFieldOperator, type QueryOperator } from "./LeftSideMenu"
import {
  playLeftSideMenuCalibreOperatorVisible,
  playLeftSideMenuExpandsCategory,
  playLeftSideMenuNodeIsVisible,
  playLeftSideMenuOperatorBadgeVisible,
  playLeftSideMenuSelectNode,
  playLeftSideMenuToggleCalibreOperator,
  playLeftSideMenuToggleOperator,
} from "./leftSideMenuStoryPlay"

const mockTagBrowser = [
  {
    category: "authors",
    name: "Authors",
    count: 3,
    isEditable: true,
    subCategory: [
      { category: "authors", name: "Tolkien, J.R.R.", count: 2, children: [] },
      { category: "authors", name: "Martin, George R.R.", count: 1, children: [] },
    ],
  },
  {
    category: "formats",
    name: "Formats",
    count: 4,
    isEditable: false,
    subCategory: [
      { category: "formats", name: "EPUB", count: 2, children: [] },
      { category: "formats", name: "PDF", count: 1, children: [] },
      { category: "formats", name: "MOBI", count: 1, children: [] },
    ],
  },
] as unknown as Category[]

function InteractiveMenu({ initialSelected = [] }: { initialSelected?: string[] }) {
  const [selectedNames, setSelectedNames] = useState<string[]>(initialSelected)
  const [itemOperators, setItemOperators] = useState<Record<string, QueryOperator>>({})
  const [itemCalibreOperators, setItemCalibreOperators] = useState<
    Record<string, CalibreFieldOperator>
  >({})

  const handleNodePress = async (query: string) => {
    setSelectedNames((prev) => {
      const exists = prev.some((q) => q.toLowerCase() === query.toLowerCase())
      return exists ? prev.filter((q) => q.toLowerCase() !== query.toLowerCase()) : [...prev, query]
    })
  }

  const handleItemOperatorChange = (itemKey: string, op: QueryOperator) => {
    setItemOperators((prev) => ({ ...prev, [itemKey]: op }))
  }

  const handleItemCalibreOperatorChange = (
    categoryKey: string,
    value: string,
    op: CalibreFieldOperator,
  ) => {
    const key = `${categoryKey.toLowerCase()}:${value.toLowerCase()}`
    setItemCalibreOperators((prev) => ({ ...prev, [key]: op }))
  }

  return (
    <LeftSideMenu
      tagBrowser={mockTagBrowser}
      selectedNames={selectedNames}
      itemOperators={itemOperators}
      itemCalibreOperators={itemCalibreOperators}
      onNodePress={handleNodePress}
      onItemOperatorChange={handleItemOperatorChange}
      onItemCalibreOperatorChange={handleItemCalibreOperatorChange}
    />
  )
}

export default {
  title: "LeftSideMenu",
  component: LeftSideMenu,
  parameters: {
    notes: "Browse tag categories on the left panel. Supports multi-select with AND/OR operators.",
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof LeftSideMenu>

type StoryProps = StoryObj<typeof LeftSideMenu>

export const Basic: StoryProps = {
  render: () => <InteractiveMenu />,
  play: async ({ canvasElement }) => {
    await playLeftSideMenuExpandsCategory({ canvasElement, categoryName: "Formats" }).catch(
      () => {},
    )
  },
}

export const ExpandedAndSelectNode: StoryProps = {
  render: () => <InteractiveMenu />,
  play: async ({ canvasElement }) => {
    await playLeftSideMenuExpandsCategory({ canvasElement, categoryName: "Formats" }).catch(
      () => {},
    )
    await playLeftSideMenuNodeIsVisible({ canvasElement, nodeName: "EPUB" }).catch(() => {})
    await playLeftSideMenuSelectNode({ canvasElement, nodeName: "EPUB" }).catch(() => {})
  },
}

export const WithMultipleSelectionAndOperator: StoryProps = {
  render: () => (
    <InteractiveMenu initialSelected={["formats:=EPUB", "formats:=PDF"]} />
  ),
  play: async ({ canvasElement }) => {
    await playLeftSideMenuExpandsCategory({ canvasElement, categoryName: "Formats" }).catch(
      () => {},
    )
    await playLeftSideMenuOperatorBadgeVisible({ canvasElement, operator: "AND" }).catch(() => {})
    await playLeftSideMenuToggleOperator({ canvasElement, operator: "AND" }).catch(() => {})
  },
}

export const CalibreOperatorToggle: StoryProps = {
  render: () => <InteractiveMenu />,
  play: async ({ canvasElement }) => {
    await playLeftSideMenuExpandsCategory({ canvasElement, categoryName: "Formats" }).catch(
      () => {},
    )
    await playLeftSideMenuCalibreOperatorVisible({ canvasElement, calibreOp: "=" }).catch(() => {})
    await playLeftSideMenuToggleCalibreOperator({ canvasElement, calibreOp: "=" }).catch(() => {})
  },
}
