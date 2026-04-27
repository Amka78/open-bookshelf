import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { act, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { buildTextBookHtmlDocument } from "./textBookHtml"
import {
  STORY_SPINE_KEY,
  playNavigateToSecondPage,
  playPaginationReported,
} from "./textBookSpineStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

// --- mocks (must be declared before lazy import) ---

const useStoresMock = jest.fn()
const usePaletteMock = jest.fn()
const useColorSchemeMock = jest.fn()
const usePreparedCalibreHtmlDocumentMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@/theme", () => ({
  usePalette: usePaletteMock,
}))

mock.module("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}))

const reactNativeMock = {
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
  Platform: {
    OS: "web",
    select: <T,>(config: { web?: T; default?: T }) => config.web ?? config.default,
  },
  StyleSheet: { create: <T,>(styles: T) => styles },
  ActivityIndicator: () => <div data-testid="activity-indicator" />,
  View: ({ children, style: _style }: { children?: ReactNode; style?: unknown }) => (
    <div>{children}</div>
  ),
  useColorScheme: useColorSchemeMock,
}

;(global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock = reactNativeMock

mock.module("react-native", () => reactNativeMock)
mock.module(
  "/home/amka78/private/open-bookshelf/node_modules/react-native/index.js",
  () => reactNativeMock,
)

mock.module("../BookHtmlPage/shared", () => ({
  usePreparedCalibreHtmlDocument: usePreparedCalibreHtmlDocumentMock,
}))

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}

;(global as { __componentsMock?: Record<string, unknown> }).__componentsMock = componentsMock

mock.module("@/components", () => componentsMock)
mock.module(
  "/home/amka78/private/open-bookshelf/app/components/index.ts",
  () => componentsMock,
)

// --- subject under test (lazy import so mocks take effect) ---

let TextBookSpine: typeof import("./TextBookSpine").TextBookSpine

beforeAll(async () => {
  ;({ TextBookSpine } = await import("./TextBookSpine"))
})

// --- shared test fixtures ---

const sampleHtml = buildTextBookHtmlDocument({
  documentData: {
    tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello world"] }] }] },
    ns_map: [],
  },
  documentKey: STORY_SPINE_KEY,
  annotations: [],
  appearance: {
    themeMode: "light",
    textColor: "#111318",
    linkColor: "#111318",
    fallbackBackgroundColor: "#ffffff",
    viewerFontSizePt: 16,
    viewerTheme: "default",
  },
  readingStyle: "singlePage",
  pageDirection: "left",
  initialPage: 0,
  leadingBlankPage: false,
})

function setupMocks() {
  useStoresMock.mockReturnValue({
    settingStore: {
      viewerFontSizePt: 16,
      viewerTheme: "default",
    },
  })
  usePaletteMock.mockReturnValue({
    bg0: "#ffffff",
    textPrimary: "#111318",
  })
  useColorSchemeMock.mockReturnValue("light")
  usePreparedCalibreHtmlDocumentMock.mockReturnValue({
    documentKey: STORY_SPINE_KEY,
    error: null,
    loading: false,
    preparedDocument: null,
  })
}

function renderSpine(
  onPaginationChange?: (payload: { currentPage: number; totalPages: number }) => void,
) {
  return render(
    <TextBookSpine
      libraryId=""
      bookId={0}
      format=""
      size={0}
      hash={0}
      pagePath={STORY_SPINE_KEY}
      sourceHtml={sampleHtml}
      currentPage={0}
      readingStyle="singlePage"
      pageDirection="left"
      leadingBlankPage={false}
      annotations={[]}
      onPaginationChange={onPaginationChange}
    />,
  )
}

// --- tests ---

describe("TextBookSpine story play", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  test("renders spine iframe when sourceHtml is provided", async () => {
    const { container } = renderSpine()

    let iframe: HTMLElement | null = null
    await act(async () => {
      for (let i = 0; i < 10; i++) {
        iframe = container.querySelector(
          `iframe[title="text-book-spine-${STORY_SPINE_KEY}"]`,
        ) as HTMLElement | null
        if (iframe) {
          break
        }
        await new Promise((r) => setTimeout(r, 10))
      }
    })

    expect(iframe).not.toBeNull()
  })

  test("calls onPaginationChange when pagination message is dispatched", async () => {
    const onPaginationChange = jest.fn()
    const { container } = renderSpine(onPaginationChange)

    await act(async () => {
      await playPaginationReported({ canvasElement: container })
    })

    expect(onPaginationChange).toHaveBeenCalledWith({
      currentPage: 0,
      totalPages: 3,
    })
  })

  test("calls onPaginationChange with currentPage 1 when navigating to second page", async () => {
    const onPaginationChange = jest.fn()
    const { container } = renderSpine(onPaginationChange)

    await act(async () => {
      await playNavigateToSecondPage({ canvasElement: container })
    })

    expect(onPaginationChange).toHaveBeenCalledWith({
      currentPage: 1,
      totalPages: 3,
    })
  })

  test("ignores pagination messages with a different key", async () => {
    const onPaginationChange = jest.fn()
    renderSpine(onPaginationChange)

    await act(async () => {
      window.postMessage(
        JSON.stringify({
          type: "open-bookshelf:text-book-pagination",
          key: "different-key",
          currentPage: 0,
          totalPages: 5,
        }),
        "*",
      )
      await new Promise((r) => setTimeout(r, 30))
    })

    expect(onPaginationChange).not.toHaveBeenCalled()
  })
})
