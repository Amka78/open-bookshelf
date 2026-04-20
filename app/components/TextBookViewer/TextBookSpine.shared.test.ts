import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

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

const reactNativeMock = {
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
  Platform: {
    OS: "web",
    select: <T,>(config: { web?: T; default?: T }) => config.web ?? config.default,
  },
  StyleSheet: { create: <T,>(styles: T) => styles },
  useColorScheme: useColorSchemeMock,
}

;(global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock = reactNativeMock

mock.module("react-native", () => reactNativeMock)
mock.module("/home/amka78/private/open-bookshelf/node_modules/react-native/index.js", () => reactNativeMock)

mock.module("../BookHtmlPage/shared", () => ({
  usePreparedCalibreHtmlDocument: usePreparedCalibreHtmlDocumentMock,
}))

let useTextBookSpineDocument: typeof import("./TextBookSpine.shared").useTextBookSpineDocument

beforeAll(async () => {
  ;({ useTextBookSpineDocument } = await import("./TextBookSpine.shared"))
})

describe("useTextBookSpineDocument", () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      documentKey: "doc-key",
      error: null,
      loading: false,
      preparedDocument: {
        tree: {
          n: "html",
          c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }],
        },
        ns_map: [],
      },
    })
  })

  test("keeps generated html stable while only the current page changes", () => {
    const baseProps = {
      libraryId: "main",
      bookId: 1,
      format: "AZW3",
      size: 1,
      hash: 1,
      pagePath: "text/chapter-1.xhtml",
      currentPage: 0,
      readingStyle: "singlePage" as const,
      pageDirection: "left" as const,
      leadingBlankPage: false,
      annotations: [],
    }

    const { result, rerender } = renderHook((props) => useTextBookSpineDocument(props), {
      initialProps: baseProps,
    })

    const initialHtml = result.current.html

    rerender({
      ...baseProps,
      currentPage: 3,
      readingStyle: "facingPageWithTitle",
      pageDirection: "right",
      leadingBlankPage: true,
    })

    expect(result.current.html).toBe(initialHtml)
  })
})
