import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  bookDetailFieldListStoryArgs,
  bookDetailFieldListWithCustomFieldsStoryArgs,
} from "../../../.storybook/stories/data/bookDetailFieldListStoryData"
import { playCustomFieldsTab } from "./bookEditFieldListStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

// --- Mocks ---

function applyBookEditFieldListMocks() {
  mock.module("@gluestack-ui/themed", () => ({
    ...global.__gluestackMock,
    Tabs: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
      <div data-testid={testID}>{children}</div>
    ),
    TabsTabList: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
      <div data-testid={testID}>{children}</div>
    ),
    TabsTab: ({
      children,
      value,
      testID,
      onPress,
    }: {
      children?: ReactNode
      value?: string
      testID?: string
      onPress?: () => void
    }) => (
      <button
        type="button"
        data-testid={testID}
        data-tab-value={value}
        onClick={onPress}
      >
        {children}
      </button>
    ),
    TabsTabPanels: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    TabsTabPanel: ({ children, value }: { children?: ReactNode; value?: string }) => (
      <div data-panel-value={value}>{children}</div>
    ),
    TabsTabTitle: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  }))

  mock.module("./BookEditField", () => ({
    BookEditField: ({
      fieldMetadata,
      formPath,
    }: {
      fieldMetadata: { label: string }
      formPath?: string
    }) => (
      <div
        data-testid="book-edit-field"
        data-label={fieldMetadata.label}
        data-form-path={formPath ?? fieldMetadata.label}
      />
    ),
  }))

  mock.module("./useEditFieldSuggestions", () => ({
    useEditFieldSuggestions: () => ({
      suggestionMap: new Map<string, string[]>(),
      languageCodeSuggestions: [],
    }),
  }))
}

applyBookEditFieldListMocks()

let BookEditFieldList: typeof import("./BookEditFieldList").BookEditFieldList

beforeAll(async () => {
  applyBookEditFieldListMocks()
  ;({ BookEditFieldList } = await import("./BookEditFieldList.tsx?story-test"))
})

beforeEach(() => {
  applyBookEditFieldListMocks()
  jest.clearAllMocks()
})

describe("BookEditFieldList", () => {
  describe("standard fields only (no custom fields)", () => {
    test("renders standard tab", () => {
      const { control } = require("react-hook-form").useForm
      // Render via FormBookEditFieldList to get a control prop
      const { container } = render(
        <BookEditFieldListWrapper storyArgs={bookDetailFieldListStoryArgs} />,
      )
      const customTab = container.querySelector('[data-testid="book-edit-tab-custom"]')
      expect(customTab).toBeNull()
    })

    test("standard tab is always present", () => {
      const { container } = render(
        <BookEditFieldListWrapper storyArgs={bookDetailFieldListStoryArgs} />,
      )
      const standardTab = container.querySelector('[data-testid="book-edit-tab-standard"]')
      expect(standardTab).not.toBeNull()
    })
  })

  describe("with custom fields", () => {
    test("custom tab is rendered when custom fields exist", () => {
      const { container } = render(
        <BookEditFieldListWrapper storyArgs={bookDetailFieldListWithCustomFieldsStoryArgs} />,
      )
      const customTab = container.querySelector('[data-testid="book-edit-tab-custom"]')
      expect(customTab).not.toBeNull()
    })

    test("custom fields use customColumns. form path prefix", () => {
      const { container } = render(
        <BookEditFieldListWrapper storyArgs={bookDetailFieldListWithCustomFieldsStoryArgs} />,
      )
      const customPanel = container.querySelector('[data-panel-value="custom"]')
      expect(customPanel).not.toBeNull()
      const customFields = customPanel!.querySelectorAll('[data-form-path^="customColumns."]')
      expect(customFields.length).toBeGreaterThan(0)
    })

    test("clicking custom tab triggers play function without throwing", async () => {
      const { container } = render(
        <BookEditFieldListWrapper storyArgs={bookDetailFieldListWithCustomFieldsStoryArgs} />,
      )
      await expect(playCustomFieldsTab({ canvasElement: container })).resolves.toBeUndefined()
    })

    test("standard fields are in the standard panel", () => {
      const { container } = render(
        <BookEditFieldListWrapper storyArgs={bookDetailFieldListWithCustomFieldsStoryArgs} />,
      )
      const standardPanel = container.querySelector('[data-panel-value="standard"]')
      expect(standardPanel).not.toBeNull()
      const standardFields = standardPanel!.querySelectorAll('[data-testid="book-edit-field"]')
      expect(standardFields.length).toBeGreaterThan(0)
    })
  })
})

// --- Test harness ---

import { useForm } from "react-hook-form"
import type { MetadataSnapshotIn } from "@/models/calibre"
import { getSnapshot } from "mobx-state-tree"
import type { FormBookEditFieldListProps } from "./FormBookEditFieldList"

type StoryArgs = Pick<FormBookEditFieldListProps, "fieldMetadataList" | "book">

function BookEditFieldListWrapper({ storyArgs }: { storyArgs: StoryArgs }) {
  const form = useForm<MetadataSnapshotIn>({
    defaultValues: storyArgs.book.metaData
      ? (getSnapshot(storyArgs.book.metaData) as MetadataSnapshotIn)
      : undefined,
  })
  return (
    <BookEditFieldList
      fieldMetadataList={storyArgs.fieldMetadataList}
      book={storyArgs.book}
      control={form.control}
    />
  )
}
