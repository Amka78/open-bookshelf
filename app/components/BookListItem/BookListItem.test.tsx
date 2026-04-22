import { beforeAll, beforeEach, describe as baseDescribe, expect, mock, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import type { Book } from "@/models/calibre/BookModel"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const reactNativeMock = {
  ...((global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock ?? {}),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(value: T) => value,
    hairlineWidth: 1,
  },
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}

function normalizeStyle(style: unknown): React.CSSProperties | undefined {
  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>(
      (acc, value) => (value && typeof value === "object" ? { ...acc, ...value } : acc),
      {},
    )
  }

  return style && typeof style === "object" ? (style as React.CSSProperties) : undefined
}

mock.module("react-native", () => reactNativeMock)
mock.module("/home/amka78/private/open-bookshelf/node_modules/react-native/index.js", () => reactNativeMock)

mock.module("@/theme", () => ({
  usePalette: () => ({
    textPrimary: "#111",
    textSecondary: "#555",
    textTertiary: "#999",
    surfaceBase: "#fff",
    surfaceStrong: "#f0f0f0",
    surfaceMuted: "#e0e0e0",
    borderSubtle: "#ddd",
    borderStrong: "#aaa",
    accent: "#222",
  }),
}))

mock.module("@/theme/typography", () => ({
  typography: {
    primary: {
      normal: "serif",
      medium: "serif",
      semiBold: "serif",
      bold: "serif",
    },
    secondary: {
      light: "sans-serif",
      normal: "sans-serif",
      medium: "sans-serif",
      semiBold: "sans-serif",
      bold: "sans-serif",
    },
  },
}))

const bookDetailMenuProps: Array<Record<string, unknown>> = []

const componentsMock = {
  ...((global as { __componentsMock?: Record<string, unknown> }).__componentsMock ?? {}),
  BookDetailMenu: (props: Record<string, unknown>) => {
    bookDetailMenuProps.push(props)
    return <div data-testid="book-detail-menu" />
  },
  Box: ({
    children,
    style,
    testID,
  }: {
    children?: ReactNode
    style?: unknown
    testID?: string
  }) => (
    <div data-testid={testID} style={normalizeStyle(style)}>
      {children}
    </div>
  ),
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ScrollView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  VStack: ({
    children,
    style,
    testID,
  }: {
    children?: ReactNode
    style?: unknown
    testID?: string
  }) => (
    <div data-testid={testID} style={normalizeStyle(style)}>
      {children}
    </div>
  ),
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  Image: () => <img alt="cover" />,
  MaterialCommunityIcon: () => <span data-testid="mock-icon" />,
  LabeledSpinner: () => <div data-testid="labeled-spinner" />,
  Button: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
  IconButton: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
}

mock.module("@/components", () => componentsMock)
mock.module("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

mock.module("@gluestack-ui/themed", () => ({
  Pressable: ({
    children,
    onPress,
    onLongPress,
  }: {
    children?: ReactNode
    onPress?: (e: React.MouseEvent) => void
    onLongPress?: () => void
  }) => (
    <div
      onClick={onPress as unknown as React.MouseEventHandler}
      onKeyDown={(e) => {
        if (e.key === "Enter") onPress?.(e as unknown as React.MouseEvent)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onLongPress?.()
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  ),
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}))

let BookListItem: typeof import("./BookListItem").BookListItem

beforeAll(async () => {
  ;({ BookListItem } = await import("./BookListItem"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

function makeBook(
  overrides: {
    title?: string
    authors?: string[]
    formats?: string[]
    tags?: string[]
  } = {},
) {
  return {
    id: 1,
    metaData: {
      title: overrides.title ?? "Test Book",
      authors: overrides.authors ?? ["Author One"],
      formats: overrides.formats ?? ["EPUB"],
      tags: overrides.tags ?? [],
      pubdate: null,
    },
  } as unknown as Book
}

describe("BookListItem", () => {
  beforeEach(() => {
    bookDetailMenuProps.length = 0
  })

  test("renders book title", () => {
    const { container } = render(
      <BookListItem book={makeBook({ title: "My Book" })} source={undefined} />,
    )
    expect(container.textContent).toContain("My Book")
  })

  test("renders author name", () => {
    const { container } = render(
      <BookListItem book={makeBook({ authors: ["Jane Doe"] })} source={undefined} />,
    )
    expect(container.textContent).toContain("Jane Doe")
  })

  test("renders format badges", () => {
    const { container } = render(
      <BookListItem book={makeBook({ formats: ["EPUB", "PDF"] })} source={undefined} />,
    )
    expect(container.textContent).toContain("EPUB")
    expect(container.textContent).toContain("PDF")
  })

  test("renders reading progress percentage when > 0", () => {
    const { container } = render(
      <BookListItem book={makeBook()} source={undefined} readingProgress={0.42} />,
    )
    expect(container.textContent).toContain("42%")
  })

  test("does not render progress when readingProgress is 0", () => {
    const { container } = render(
      <BookListItem book={makeBook()} source={undefined} readingProgress={0} />,
    )
    expect(container.textContent).not.toContain("%")
  })

  test("renders without crashing when isSelected is true", () => {
    const { container } = render(
      <BookListItem book={makeBook()} source={undefined} isSelected={true} onPress={() => {}} />,
    )
    expect(container.textContent).toContain("Test Book")
  })

  test("renders a visible selection outline when selected", () => {
    const { container } = render(
      <BookListItem book={makeBook()} source={undefined} isSelected={true} onPress={() => {}} />,
    )

    expect(container.querySelector('[data-testid="book-list-item-selected-outline"]')).not.toBeNull()
  })

  test("renders cover image when source is provided", () => {
    const { container } = render(
      <BookListItem book={makeBook()} source={{ uri: "http://example.com/cover.jpg" }} />,
    )
    const img = container.querySelector("img")
    expect(img).not.toBeNull()
  })

  test("renders a pressable row when onPress is provided", () => {
    const { container } = render(
      <BookListItem
        book={makeBook()}
        source={undefined}
        onPress={() => {}}
        isSelected={false}
      />,
    )
    expect(container.querySelectorAll('[role="button"]').length).toBeGreaterThan(0)
  })

  test("calls onPress when row is clicked", () => {
    const onPress = mock(() => {})
    const { container } = render(
      <BookListItem
        book={makeBook()}
        source={undefined}
        onPress={onPress}
        isSelected={false}
      />,
    )
    const buttons = container.querySelectorAll('[role="button"]')
    expect(buttons.length).toBe(1)
    buttons[0]?.click()
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  test("renders single-selection action menu when requested", () => {
    const { container } = render(
      <BookListItem
        book={makeBook()}
        source={undefined}
        isSelected={true}
        onPress={() => {}}
        showSelectionActions={true}
        detailMenuProps={{
          onOpenBook: async () => {},
          onDownloadBook: () => {},
          onConvertBook: () => {},
          onEditBook: () => {},
          onDeleteBook: () => {},
          onOpenBookDetail: () => {},
        }}
      />,
    )

    expect(container.querySelector('[data-testid="book-detail-menu"]')).not.toBeNull()
    expect(bookDetailMenuProps[0]).toMatchObject({
      iconOpacity: 0.9,
    })
    expect((bookDetailMenuProps[0] as { wrap?: boolean } | undefined)?.wrap).toBeUndefined()
  })
})
