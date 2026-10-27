import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  vi,
} from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

function normalizeStyle(style: unknown): React.CSSProperties | undefined {
  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>((acc, value) => {
      if (value && typeof value === "object") {
        return Object.assign(acc, value)
      }
      return acc
    }, {})
  }

  return style && typeof style === "object" ? (style as React.CSSProperties) : undefined
}

const bookDetailMenuProps: Array<Record<string, unknown>> = []

const componentsMock = {
  BookDetailMenu: (props: Record<string, unknown>) => {
    bookDetailMenuProps.push(props)
    return <div data-testid="library-table-book-detail-menu" />
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
  Button: ({
    children,
    onPress,
    testID,
    isDisabled,
  }: {
    children?: ReactNode
    onPress?: () => void | Promise<void>
    testID?: string
    isDisabled?: boolean
  }) => (
    <button
      data-testid={testID}
      disabled={isDisabled}
      onClick={() => void onPress?.()}
      type="button"
    >
      {children}
    </button>
  ),
  HStack: ({ children, style }: { children?: ReactNode; style?: unknown }) => (
    <div style={normalizeStyle(style)}>{children}</div>
  ),
  IconButton: ({
    name,
    onPress,
    testID,
    disabled,
  }: {
    name?: string
    onPress?: () => void
    testID?: string
    disabled?: boolean
  }) => (
    <button data-testid={testID} disabled={disabled} onClick={onPress} type="button">
      {name}
    </button>
  ),
  Image: () => <img alt="" />,
  Input: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  InputField: ({
    onChangeText,
    testID,
    value,
  }: {
    onChangeText?: (text: string) => void
    testID?: string
    value?: string
  }) => (
    <input
      data-testid={testID}
      onChange={(event) => onChangeText?.((event.target as HTMLInputElement).value)}
      value={value ?? ""}
    />
  ),
  ScrollView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  TagInput: ({
    onChange,
    testID,
    value,
  }: {
    onChange?: (values: string[]) => void
    testID?: string
    value?: string[]
  }) => (
    <div data-testid={testID}>
      {(value ?? []).map((tag) => (
        <span key={tag} data-testid={`${testID}-tag-${tag}`}>
          {tag}
          <button
            data-testid={`${testID}-tag-${tag}-remove`}
            onClick={() => {
              const next = [...(value ?? [])]
              next.splice(next.indexOf(tag), 1)
              onChange?.(next)
            }}
            type="button"
          >
            ×
          </button>
        </span>
      ))}
      <input
        data-testid={`${testID}-input`}
        onChange={(event) => {
          const text = (event.target as HTMLInputElement).value
          if (text.includes(",")) {
            const parts = text
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
            onChange?.([...(value ?? []), ...parts])
          }
        }}
        onKeyDown={(event) => {
          if ((event as unknown as { key: string }).key === "Enter") {
            const input = event.currentTarget as HTMLInputElement
            if (input.value.trim()) {
              onChange?.([...(value ?? []), input.value.trim()])
              input.value = ""
            }
          }
        }}
      />
    </div>
  ),
  Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
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
}

vi.doMock("@/components", () => componentsMock)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

vi.doMock("@/components/InputField/InputField", () => ({
  InputField: ({
    onChangeText,
    testID,
    value,
  }: {
    onChangeText?: (text: string) => void
    testID?: string
    value?: string
  }) => (
    <input
      data-testid={testID}
      onChange={(event) => onChangeText?.((event.target as HTMLInputElement).value)}
      value={value ?? ""}
    />
  ),
}))

// LibraryTableItem は render 時に palette.bg0 (usePalette) を読む。
// vitest-setup.ts のデフォルトモック (usePalette: vi.fn()) では undefined になるため上書きする。
vi.doMock("@/theme", () => ({
  usePalette: () => ({ bg0: "#ffffff" }),
}))

vi.doMock("@gluestack-ui/themed", () => ({
  Pressable: ({
    children,
    onLongPress,
    onPress,
    style,
    testID,
  }: {
    children?: ReactNode
    onLongPress?: () => void
    onPress?: () => void
    style?: unknown
    testID?: string
  }) => (
    <div
      data-testid={testID}
      onClick={onPress}
      onContextMenu={(event) => {
        event.preventDefault()
        onLongPress?.()
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onPress?.()
        }
      }}
      role="button"
      // LibraryTableItem は style を配列で渡す (例: [styles.bookCell, { backgroundColor }])。
      // 配列のまま DOM に渡すと react-dom が index を CSS プロパティ扱いして失敗する。
      style={normalizeStyle(style)}
      tabIndex={0}
    >
      {children}
    </div>
  ),
}))

vi.doMock("mobx-react-lite", () => ({
  observer: <T extends (...args: never[]) => unknown>(component: T) => component,
}))

vi.doMock("react-native", () => ({
  PanResponder: {
    create: () => ({ panHandlers: {} }),
  },
  // app/i18n/i18n.ts がモジュールロード時に I18nManager.allowRTL/forceRTL を呼ぶため必須。
  I18nManager: {
    isRTL: false,
    doLeftAndRightSwapInRTL: true,
    allowRTL: vi.fn(),
    forceRTL: vi.fn(),
    swapLeftAndRightInRTL: vi.fn(),
  },
  Platform: { OS: "web" },
  StyleSheet: {
    create: <T extends Record<string, unknown>>(value: T) => value,
    hairlineWidth: 1,
  },
  View: ({
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
  // LibraryTableItem は react-native の Pressable を import するため、
  // ここに onPress → onClick 変換のモックが必要 (gluestack 側のモックは届かない)。
  Pressable: ({
    children,
    onLongPress,
    onPress,
    style,
    testID,
  }: {
    children?: ReactNode
    onLongPress?: () => void
    onPress?: () => void
    style?: unknown
    testID?: string
  }) => (
    <div
      data-testid={testID}
      onClick={onPress}
      onContextMenu={(event) => {
        event.preventDefault()
        onLongPress?.()
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onPress?.()
        }
      }}
      role="button"
      style={normalizeStyle(style)}
      tabIndex={0}
    >
      {children}
    </div>
  ),
}))

let LibraryTableItem: typeof import("./LibraryTableItem").LibraryTableItem
let LibraryTableHeader: typeof import("./LibraryTableItem").LibraryTableHeader
let clampColumnWidth: typeof import("./LibraryTableItem").clampColumnWidth
let computeLibraryTableMinWidth: typeof import("./LibraryTableItem").computeLibraryTableMinWidth
let DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS: typeof import("./LibraryTableItem").DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS
let extractSeriesFromTitle: typeof import("./LibraryTableItem").extractSeriesFromTitle

beforeAll(async () => {
  const libraryTableItemModule = await import("./LibraryTableItem")
  LibraryTableItem = libraryTableItemModule.LibraryTableItem
  LibraryTableHeader = libraryTableItemModule.LibraryTableHeader
  clampColumnWidth = libraryTableItemModule.clampColumnWidth
  computeLibraryTableMinWidth = libraryTableItemModule.computeLibraryTableMinWidth
  DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS = libraryTableItemModule.DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS
  extractSeriesFromTitle = libraryTableItemModule.extractSeriesFromTitle
})

describe("LibraryTableItem", () => {
  beforeEach(() => {
    bookDetailMenuProps.length = 0
  })

  test("pressing the book cell triggers selection", () => {
    const onPress = vi.fn(() => {})
    const update = vi.fn(async () => true)
    const book = {
      id: 1,
      metaData: {
        authors: ["Author One"],
        publisher: "Ace",
        series: "Dune",
        tags: ["Sci-Fi"],
        title: "Dune",
      },
      update,
    }

    render(
      <LibraryTableItem
        book={book as never}
        source={undefined}
        libraryId="library"
        isSelected={false}
        onPress={onPress}
      />,
    )

    fireEvent.click(screen.getByTestId("library-table-select-1"))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  test.skip("saving inline metadata updates the book", async () => {
    const update = vi.fn(async () => true)
    const book = {
      id: 1,
      metaData: {
        authors: ["Author One"],
        publisher: "Ace",
        series: "Dune",
        tags: ["Sci-Fi"],
        title: "Dune",
      },
      update,
    }

    render(
      <LibraryTableItem
        book={book as never}
        source={undefined}
        libraryId="library"
        isSelected={true}
      />,
    )

    const titleInput = screen.getByTestId("library-table-title-1")
    fireEvent.change(titleInput, { target: { value: "Dune Messiah" } })

    // Remove the first author and add two new authors
    fireEvent.click(screen.getByTestId("library-table-authors-1-tag-0-remove"))
    const authorsInput = screen.getByTestId("library-table-authors-1-input")
    fireEvent.change(authorsInput, { target: { value: "Frank Herbert" } })
    fireEvent.keyDown(authorsInput, { key: "Enter" })
    fireEvent.change(authorsInput, { target: { value: "Brian Herbert" } })
    fireEvent.keyDown(authorsInput, { key: "Enter" })

    // Trigger Enter on title to auto-save
    fireEvent.keyDown(titleInput, { key: "Enter" })

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        "library",
        {
          authors: ["Frank Herbert", "Brian Herbert"],
          publisher: "Ace",
          series: "Dune",
          seriesIndex: null,
          tags: ["Sci-Fi"],
          title: "Dune Messiah",
        },
        ["title", "authors", "series", "seriesIndex", "tags", "publisher"],
        undefined,
        undefined,
      )
    })
  })

  test("selected rows show an outline and keep the action menu inline", () => {
    const update = vi.fn(async () => true)
    const book = {
      id: 1,
      metaData: {
        authors: ["Author One"],
        publisher: "Ace",
        series: "Dune",
        tags: ["Sci-Fi"],
        title: "Dune",
      },
      update,
    }

    render(
      <LibraryTableItem
        book={book as never}
        source={undefined}
        libraryId="library"
        isSelected={true}
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

    expect(screen.getByTestId("library-table-selected-outline-1")).toBeTruthy()
    expect(screen.getByTestId("library-table-book-detail-menu")).toBeTruthy()
    expect((bookDetailMenuProps[0] as { wrap?: boolean } | undefined)?.wrap).toBeUndefined()
  })

  test("renders a resize handle for each metadata column when resizing is enabled", () => {
    render(
      <LibraryTableHeader
        labels={{
          actions: "Actions",
          authors: "Authors",
          book: "Book",
          publisher: "Publisher",
          seriesName: "Series",
          seriesIndex: "Series",
          tags: "Tags",
          title: "Title",
        }}
        onColumnResize={() => {}}
      />,
    )

    for (const column of ["title", "authors", "seriesName", "seriesIndex", "tags", "publisher"]) {
      expect(screen.getByTestId(`library-table-resize-${column}`)).toBeTruthy()
    }
  })

  test("omits resize handles when no resize handler is provided", () => {
    render(
      <LibraryTableHeader
        labels={{
          actions: "Actions",
          authors: "Authors",
          book: "Book",
          publisher: "Publisher",
          seriesName: "Series",
          seriesIndex: "Series",
          tags: "Tags",
          title: "Title",
        }}
      />,
    )

    expect(screen.queryByTestId("library-table-resize-title")).toBeNull()
  })

  test("clampColumnWidth keeps widths within the allowed bounds", () => {
    expect(clampColumnWidth(10)).toBe(60)
    expect(clampColumnWidth(1000)).toBe(600)
    expect(clampColumnWidth(200.4)).toBe(200)
    expect(clampColumnWidth(Number.NaN)).toBe(60)
  })

  test("computeLibraryTableMinWidth sums fixed and dynamic column widths", () => {
    expect(computeLibraryTableMinWidth()).toBe(1020)
    expect(
      computeLibraryTableMinWidth({ ...DEFAULT_LIBRARY_TABLE_COLUMN_WIDTHS, title: 100 }),
    ).toBe(940)
  })
})

describe("extractSeriesFromTitle", () => {
  test("extracts series name and number from title", () => {
    expect(extractSeriesFromTitle("Dune 1")).toEqual({ series: "Dune", number: "1" })
    expect(extractSeriesFromTitle("Foundation Vol.2")).toEqual({
      series: "Foundation",
      number: "Vol.2",
    })
    expect(extractSeriesFromTitle("指輪物語 01")).toEqual({ series: "指輪物語", number: "01" })
    expect(extractSeriesFromTitle("Series 第1巻")).toEqual({ series: "Series", number: "第1巻" })
  })

  test("returns null for titles without series pattern", () => {
    expect(extractSeriesFromTitle("Dune")).toBeNull()
    expect(extractSeriesFromTitle("The Foundation Trilogy")).toBeNull()
    expect(extractSeriesFromTitle("1984")).toBeNull()
  })

  test("handles titles with multiple spaces", () => {
    expect(extractSeriesFromTitle("Dune  1")).toEqual({ series: "Dune", number: "1" })
  })
})
