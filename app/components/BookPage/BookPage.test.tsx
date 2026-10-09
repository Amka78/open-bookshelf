import { render } from "@testing-library/react"
import React from "react"
import type { ReactNode } from "react"
import { describe as baseDescribe, test as baseTest, beforeAll, expect, vi } from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  BookDetailMenu: () => <div data-testid="book-detail-menu" />,
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Button: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Image: ({ source }: { source: unknown }) => {
    const uri =
      typeof source === "object" && source !== null && "uri" in source
        ? (source as { uri?: string }).uri
        : String(source)
    return <img src={uri} alt="page" />
  },
  IconButton: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
  LabeledSpinner: () => <div data-testid="labeled-spinner" />,
  MaterialCommunityIcon: () => <span data-testid="material-community-icon" />,
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}

vi.doMock("@/components", () => componentsMock)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

const reactNativeMock = {
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
  useWindowDimensions: () => ({ width: 375, height: 812 }),
}

vi.doMock("react-native", () => reactNativeMock)
vi.doMock(
  "/home/amka78/private/open-bookshelf/node_modules/react-native/index.js",
  () => reactNativeMock,
)

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let BookPage: typeof import("./BookPage").BookPage

beforeAll(async () => {
  ;({ BookPage } = await import("./BookPage"))
})

describe("BookPage", () => {
  test("renders an image with the provided URI", () => {
    const { container } = render(
      <BookPage
        source={{ uri: "http://example.com/page1.jpg" }}
        availableWidth={375}
        availableHeight={812}
      />,
    )
    const img = container.querySelector("img")
    expect(img?.getAttribute("src")).toBe("http://example.com/page1.jpg")
  })

  test("passes the same source object to Image when re-rendered with a new object but same URI", async () => {
    const capturedSources: unknown[] = []

    const rerenderComponentsMock = {
      ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
      BookDetailMenu: () => <div data-testid="book-detail-menu" />,
      Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Button: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
        <button type="button" onClick={onPress}>
          {children}
        </button>
      ),
      HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Image: ({ source }: { source: unknown }) => {
        capturedSources.push(source)
        const uri =
          typeof source === "object" && source !== null && "uri" in source
            ? (source as { uri?: string }).uri
            : String(source)
        return <img src={uri} alt="page" />
      },
      IconButton: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
        <button type="button" onClick={onPress}>
          {children}
        </button>
      ),
      LabeledSpinner: () => <div data-testid="labeled-spinner" />,
      MaterialCommunityIcon: () => <span data-testid="material-community-icon" />,
      Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
      VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    }

    vi.doMock("@/components", () => rerenderComponentsMock)
    vi.doMock(
      "/home/amka78/private/open-bookshelf/app/components/index.ts",
      () => rerenderComponentsMock,
    )
    // 再 import しないと capturedSources が空のままになり、
    // expect(secondSource).toBe(firstSource) が undefined === undefined で空振りする。
    vi.resetModules()
    const { BookPage: BookPageWithCapture } = await import("./BookPage")

    function Wrapper({ headers }: { headers?: Record<string, string> }) {
      return (
        <BookPageWithCapture
          source={{ uri: "http://example.com/page2.jpg", headers }}
          availableWidth={375}
          availableHeight={812}
        />
      )
    }

    const { rerender } = render(<Wrapper headers={{ Authorization: "Basic abc" }} />)
    const firstSource = capturedSources[capturedSources.length - 1]

    // Re-render with a new headers object but same URI
    rerender(<Wrapper headers={{ Authorization: "Basic abc" }} />)
    const secondSource = capturedSources[capturedSources.length - 1]

    // The useMemo-stabilized source must be the same object reference (no re-trigger of expo-image)
    expect(secondSource).toBe(firstSource)
  })

  test("updates source when URI changes", async () => {
    const capturedSources: unknown[] = []

    const rerenderComponentsMock = {
      ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
      BookDetailMenu: () => <div data-testid="book-detail-menu" />,
      Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Button: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
        <button type="button" onClick={onPress}>
          {children}
        </button>
      ),
      HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      Image: ({ source }: { source: unknown }) => {
        capturedSources.push(source)
        const uri =
          typeof source === "object" && source !== null && "uri" in source
            ? (source as { uri?: string }).uri
            : String(source)
        return <img src={uri} alt="page" />
      },
      IconButton: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
        <button type="button" onClick={onPress}>
          {children}
        </button>
      ),
      LabeledSpinner: () => <div data-testid="labeled-spinner" />,
      MaterialCommunityIcon: () => <span data-testid="material-community-icon" />,
      Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
      VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    }

    vi.doMock("@/components", () => rerenderComponentsMock)
    vi.doMock(
      "/home/amka78/private/open-bookshelf/app/components/index.ts",
      () => rerenderComponentsMock,
    )
    // 既に import 済みの BookPage は古い mock を保持し続けるため、再 import しないと
    // capturedSources が常に空になりアサートが空振りする。
    vi.resetModules()
    const { BookPage: BookPageWithCapture } = await import("./BookPage")

    function Wrapper({ page }: { page: number }) {
      return (
        <BookPageWithCapture
          source={{ uri: `http://example.com/page${page}.jpg` }}
          availableWidth={375}
          availableHeight={812}
        />
      )
    }

    const { rerender } = render(<Wrapper page={1} />)
    rerender(<Wrapper page={2} />)

    const lastSource = capturedSources[capturedSources.length - 1] as { uri?: string }
    expect(lastSource?.uri).toBe("http://example.com/page2.jpg")
  })
})
