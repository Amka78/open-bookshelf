import { beforeAll, beforeEach, describe as baseDescribe, expect, mock, test as baseTest } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

function normalizeStyle(style: unknown): React.CSSProperties | undefined {
  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>(
      (acc, value) => (value && typeof value === "object" ? { ...acc, ...value } : acc),
      {},
    )
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
    <button data-testid={testID} disabled={isDisabled} onClick={() => void onPress?.()} type="button">
      {children}
    </button>
  ),
  HStack: ({ children, style }: { children?: ReactNode; style?: unknown }) => (
    <div style={normalizeStyle(style)}>{children}</div>
  ),
  Image: () => <img alt="" />,
  Input: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ScrollView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
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

mock.module("@/components", () => componentsMock)
mock.module("/home/amka78/private/open-bookshelf/app/components/index.ts", () => componentsMock)

mock.module("@/components/InputField/InputField", () => ({
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

mock.module("@gluestack-ui/themed", () => ({
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
      role="button"
      style={style as React.CSSProperties | undefined}
      tabIndex={0}
    >
      {children}
    </div>
  ),
}))

mock.module("mobx-react-lite", () => ({
  observer: <T extends (...args: never[]) => unknown>(component: T) => component,
}))

mock.module("react-native", () => ({
  StyleSheet: {
    create: <T extends Record<string, unknown>>(value: T) => value,
    hairlineWidth: 1,
  },
}))

let LibraryTableItem: typeof import("./LibraryTableItem").LibraryTableItem

beforeAll(async () => {
  ;({ LibraryTableItem } = await import("./LibraryTableItem"))
})

describe("LibraryTableItem", () => {
  beforeEach(() => {
    bookDetailMenuProps.length = 0
  })

  test("pressing the book cell triggers selection", () => {
    const onPress = mock(() => {})
    const update = mock(async () => true)
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

  test("saving inline metadata updates the book", async () => {
    const update = mock(async () => true)
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

    fireEvent.change(screen.getByTestId("library-table-title-1"), { target: { value: "Dune Messiah" } })
    fireEvent.change(screen.getByTestId("library-table-authors-1"), {
      target: { value: "Frank Herbert, Brian Herbert" },
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId("library-table-save-1"))
    })

    expect(update).toHaveBeenCalledWith(
      "library",
      {
        authors: ["Frank Herbert", "Brian Herbert"],
        publisher: "Ace",
        series: "Dune",
        tags: ["Sci-Fi"],
        title: "Dune Messiah",
      },
      ["title", "authors", "series", "tags", "publisher"],
    )
  })

  test("selected rows show an outline and keep the action menu inline", () => {
    const update = mock(async () => true)
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
})
