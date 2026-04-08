import { describe as baseDescribe, test as baseTest, beforeAll, expect, mock } from "bun:test"
import { render } from "@testing-library/react"
import type { Book } from "@/models/calibre/BookModel"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

mock.module("expo-image", () => ({
  Image: () => <img alt="cover" />,
}))

mock.module("@/components", () => ({
  ...(global as { __componentsMock?: Record<string, unknown> }).__componentsMock,
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Image: () => <img alt="cover" />,
  MaterialCommunityIcon: () => <span />,
}))

mock.module("@gluestack-ui/themed", () => ({
  ...(global as { __gluestackMock?: Record<string, unknown> }).__gluestackMock,
  Pressable: ({ children, onPress }: { children?: ReactNode; onPress?: () => void }) => (
    <div onClick={onPress} onKeyDown={onPress} role="button" tabIndex={0}>{children}</div>
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
      <BookListItem book={makeBook()} source={undefined} isSelected={true} />,
    )
    expect(container.textContent).toContain("Test Book")
  })

  test("renders cover image when source is provided", () => {
    const { container } = render(
      <BookListItem book={makeBook()} source={{ uri: "http://example.com/cover.jpg" }} />,
    )
    const img = container.querySelector("img")
    expect(img).not.toBeNull()
  })
})
