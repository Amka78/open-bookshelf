import { findByTestId, fireEvent } from "@testing-library/react"
import type { Meta, StoryObj } from "@storybook/react"
import { RootStoreModel } from "@/models"
import { api } from "@/services/api"
import { withComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { LibraryTableItem } from "./LibraryTableItem"

/**
 * UI操作の検証は story の play 関数で行う（test ファイルでは行わない）。
 * API 呼び出しは api サービスのメソッドを差し替えて Mock 化する。
 * book.update → BookModel の flow → api.editBook の経路を実物のまま通し、
 * 最後の API 境界だけを差し替えることで、ローカル state → 保存トリガー → API 引数の
 * 一連の流れを検証できる。
 */
type EditBookCall = {
  libraryId: string
  bookId: number
  changes: Record<string, unknown>
}

const editBookCalls: EditBookCall[] = []

function installEditBookMock() {
  editBookCalls.length = 0
  api.editBook = (async (...args: Parameters<typeof api.editBook>) => {
    const [libraryId, bookId, bookData] = args
    editBookCalls.push({ libraryId, bookId, changes: bookData.changes ?? {} })
    return { kind: "ok" }
  }) as typeof api.editBook
}

function stubClipboard(text: string) {
  // 貼りつけボタンは navigator.clipboard.readText() を読むため、
  // ブラウザ実装（権限ダイアログ）に依存せず固定値を返すようにする。
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { readText: async () => text },
  })
}

async function waitForEditBookCall(match: (call: EditBookCall) => boolean): Promise<EditBookCall> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const call = editBookCalls.find(match)
    if (call) return call
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error("editBook was never called with the expected value")
}

function createTableItemStoryStore() {
  return RootStoreModel.create({
    authenticationStore: {
      token: "dXNlcjpwYXNz",
      userId: "user",
      password: "pass",
    },
    calibreRootStore: {
      defaultLibraryId: "library-1",
      numPerPage: 20,
      libraryMap: {
        "library-1": {
          id: "library-1",
          books: {
            "1": {
              id: 1,
              metaData: {
                authors: [],
                formats: ["EPUB"],
                series: null,
                seriesIndex: null,
                tags: [],
                title: "Sample Book",
              },
              path: [],
              hash: 1,
              pageProgressionDirection: "ltr",
            },
          },
          searchSetting: {
            offset: 0,
            query: "",
            sort: "title",
            sortOrder: "asc",
            totalNum: 1,
            vl: null,
          },
          sortField: [],
          tagBrowser: [],
          clientSetting: [],
          bookDisplayFields: [],
          fieldMetadataList: {},
          selectedBook: 1,
          virtualLibraries: [],
        },
      },
      selectedLibrary: "library-1",
      readingHistories: [],
    },
  })
}

const storyStore = createTableItemStoryStore()
const storyBook = storyStore.calibreRootStore.libraryMap.get("library-1")?.books.get("1")
if (!storyBook) {
  throw new Error("LibraryTableItem story: book 1 not found in the story store")
}

function renderTableItemStory() {
  return (
    <LibraryTableItem
      book={storyBook}
      source={undefined}
      libraryId="library-1"
      isSelected={false}
    />
  )
}

async function playPasteAutoSaves({
  canvasElement,
  testID,
  clipboardText,
  field,
  expectedValue,
}: {
  canvasElement: HTMLElement
  testID: string
  clipboardText: string
  field: "authors" | "tags"
  expectedValue: string
}) {
  installEditBookMock()
  stubClipboard(clipboardText)

  const pasteButton = await findByTestId(canvasElement, `${testID}-paste`)
  fireEvent.click(pasteButton)

  // 貼りつけ後、waitFor 相当のポーリングで API モックへの保存呼び出しを確認する。
  // 変更なしの early return やトリガー漏れがあるとここでタイムアウト例外になる。
  const call = await waitForEditBookCall((candidate) => candidate.changes[field] === expectedValue)
  if (call.libraryId !== "library-1" || call.bookId !== 1) {
    throw new Error(
      `paste auto-save: unexpected target library/book (library="${call.libraryId}", book=${call.bookId})`,
    )
  }
}

export default {
  title: "Screens/LibraryTableItem",
  component: LibraryTableItem,
  decorators: [withComponentHolder],
} as Meta<typeof LibraryTableItem>

type LibraryTableItemStory = StoryObj<typeof LibraryTableItem>

export const PasteTags: LibraryTableItemStory = {
  render: renderTableItemStory,
  play: async ({ canvasElement }) => {
    await playPasteAutoSaves({
      canvasElement,
      testID: "library-table-tags-1",
      clipboardText: "Science Fiction, Space Opera",
      field: "tags",
      // 貼りつけ時にカンマ区切りで分割されるため、API 送信時は "," 結合（スペースなし）になる
      expectedValue: "Science Fiction,Space Opera",
    })
  },
}

export const PasteAuthors: LibraryTableItemStory = {
  render: renderTableItemStory,
  play: async ({ canvasElement }) => {
    await playPasteAutoSaves({
      canvasElement,
      testID: "library-table-authors-1",
      clipboardText: "Ada Lovelace",
      field: "authors",
      expectedValue: "Ada Lovelace",
    })
  },
}
