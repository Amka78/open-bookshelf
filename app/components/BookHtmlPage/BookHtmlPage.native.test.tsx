import { beforeAll, describe as baseDescribe, expect, mock, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import type React from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const capturedWebViewProps: Record<string, unknown>[] = []

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  Text: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}

mock.module("@/components", () => componentsMock)
mock.module("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

mock.module("@/theme", () => ({
  usePalette: () => ({
    textPrimary: "#fff",
    bg0: "#000",
  }),
}))

const reactNativeMock = {
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
  ActivityIndicator: () => <div data-testid="spinner" />,
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  useColorScheme: () => "dark",
}

mock.module("react-native", () => reactNativeMock)
mock.module("/home/amka78/private/open-bookshelf/node_modules/react-native/index.js", () => reactNativeMock)

mock.module("react-native-webview", () => ({
  WebView: (props: Record<string, unknown>) => {
    capturedWebViewProps.push(props)
    return <div data-testid="webview" />
  },
}))

mock.module("./shared", () => ({
  calibreHtmlPageInteractionMessageType: "interaction",
  calibreHtmlPageLongPressAction: "longPress",
  calibreHtmlPageSizeMessageType: "size",
  useCalibreHtmlDocument: () => ({
    autoHeight: false,
    documentKey: "doc-key",
    error: null,
    html: "<html><body>Hello</body></html>",
    loading: false,
  }),
}))

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let BookHtmlPage: typeof import("./BookHtmlPage.native").BookHtmlPage

beforeAll(async () => {
  ;({ BookHtmlPage } = await import("./BookHtmlPage.native"))
})

describe("BookHtmlPage.native", () => {
  test("disables Android WebView force dark so page images keep original colors", () => {
    capturedWebViewProps.length = 0

    render(
      <BookHtmlPage
        availableWidth={320}
        availableHeight={480}
        pageType="singlePage"
        bookId={1}
        format="AZW3"
        hash={1}
        headers={{ Authorization: "Bearer token" }}
        libraryId="main"
        pagePath="Text/chapter.xhtml"
        size={1}
      />,
    )

    expect(capturedWebViewProps).toHaveLength(1)
    expect(capturedWebViewProps[0]?.forceDarkOn).toBe(false)
  })
})
