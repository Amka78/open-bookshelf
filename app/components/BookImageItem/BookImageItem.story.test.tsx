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
  playBookImageItemSelectedSearchPressesAuthorLink,
  playBookImageItemShowsDetailMenuWhenSelected,
} from "./bookImageItemStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)
const bookDetailMenuMock = jest.fn(() => <div data-testid="book-image-detail-menu" />)

const BookImageBox = ({
  children,
  testID,
  style,
}: {
  children?: ReactNode
  testID?: string
  style?: unknown
}) => (
  <div data-testid={testID} style={style as React.CSSProperties | undefined}>
    {children}
  </div>
)

const BookImageHStack = ({ children, style }: { children?: ReactNode; style?: unknown }) => (
  <div style={style as React.CSSProperties | undefined}>{children}</div>
)

const BookImageImage = ({
  source,
  style,
}: {
  source?: { uri?: string } | number
  style?: unknown
}) => (
  <img
    alt=""
    src={typeof source === "object" && source && "uri" in source ? source.uri : undefined}
    style={style as React.CSSProperties | undefined}
  />
)

const BookImageText = ({
  children,
  tx,
  testID,
  style,
}: {
  children?: ReactNode
  tx?: string
  testID?: string
  style?: unknown
}) => (
  <span data-testid={testID} style={style as React.CSSProperties | undefined}>
    {tx ?? children}
  </span>
)

const BookImageVStack = ({ children }: { children?: ReactNode }) => <div>{children}</div>

function applyBookImageMocks() {
  mock.module("@/components/BookDetailMenu/BookDetailMenu", () => ({
    BookDetailMenu: bookDetailMenuMock,
  }))
  mock.module("@/components/Box/Box", () => ({
    Box: BookImageBox,
  }))
  mock.module("@/components/HStack/HStack", () => ({
    HStack: BookImageHStack,
  }))
  mock.module("@/components/Image/Image", () => ({
    Image: BookImageImage,
  }))
  mock.module("@/components/LabeledSpinner/LabeledSpinner", () => ({
    LabeledSpinner: () => <div data-testid="book-image-loading" />,
  }))
  mock.module("@/components/MaterialCommunityIcon/MaterialCommunityIcon", () => ({
    MaterialCommunityIcon: () => <span data-testid="book-image-icon" />,
  }))
  mock.module("@/components/Text/Text", () => ({
    Text: BookImageText,
  }))
  mock.module("@/components/VStack/VStack", () => ({
    VStack: BookImageVStack,
  }))
  mock.module("@gluestack-ui/themed", () => ({
    Pressable: ({
      children,
      onPress,
      onLongPress,
      testID,
      style,
    }: {
      children?: ReactNode
      onPress?: () => void
      onLongPress?: () => void
      testID?: string
      style?: unknown
    }) => (
      <div
        data-testid={testID}
        role="button"
        tabIndex={0}
        style={style as React.CSSProperties | undefined}
        onClick={onPress}
        onContextMenu={(event) => {
          event.preventDefault()
          onLongPress?.()
        }}
      >
        {children}
      </div>
    ),
  }))
}

applyBookImageMocks()

let BookImageItem: typeof import("./BookImageItem").BookImageItem

beforeAll(async () => {
  applyBookImageMocks()
  ;({ BookImageItem } = await import("./BookImageItem.tsx?story-test"))
})

describe("BookImageItem story play", () => {
  const onHoverSearchPress = jest.fn()
  const onPress = jest.fn(async () => {})

  beforeEach(() => {
    applyBookImageMocks()
    jest.clearAllMocks()
  })

  test("single selection shows metadata links and pressing author runs search query", async () => {
    const { container } = render(
      <BookImageItem
        source={{ uri: "https://example.com/cover.jpg" }}
        onPress={onPress}
        selected={true}
        showSelectionDetails={true}
        hoverSearchMetadata={{
          authors: ["Ursula K. Le Guin"],
          series: "Earthsea",
          tags: ["Fantasy"],
          formats: ["epub"],
        }}
        onHoverSearchPress={onHoverSearchPress}
      />,
    )

    await playBookImageItemSelectedSearchPressesAuthorLink({ canvasElement: container })

    expect(onHoverSearchPress).toHaveBeenCalledWith("authors:=Ursula K. Le Guin")
    expect(onPress).not.toHaveBeenCalled()
  })

  test("single selection shows the detail menu and selected outline", async () => {
    const { container } = render(
      <BookImageItem
        source={{ uri: "https://example.com/cover.jpg" }}
        selected={true}
        showSelectionDetails={true}
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

    await playBookImageItemShowsDetailMenuWhenSelected({ canvasElement: container })

    const overlay = container.querySelector(
      '[data-testid="book-image-detail-menu-overlay"]',
    ) as HTMLElement | null

    expect(overlay).toBeTruthy()
    expect(overlay?.style.left).toBe("6px")
    expect(overlay?.style.right).toBe("6px")
    expect(container.querySelector('[data-testid="book-image-selected-outline"]')).toBeTruthy()
    expect(bookDetailMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        wrap: true,
        containerProps: expect.objectContaining({
          width: "100%",
        }),
      }),
      undefined,
    )
  })
})
