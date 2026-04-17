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
import { playBookDetailMenuEditDoesNotBubble } from "./bookDetailMenuStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

mock.module("/home/amka78/private/open-bookshelf/app/components/HStack/HStack.tsx", () => ({
  HStack: ({
    children,
    bgColor: _bgColor,
    flexWrap: _flexWrap,
    maxWidth: _maxWidth,
    justifyContent: _justifyContent,
    ...props
  }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module(
  "/home/amka78/private/open-bookshelf/app/components/TooltipIconButton/TooltipIconButton.tsx",
  () => ({
    TooltipIconButton: ({
      onPress,
      testID,
    }: {
      onPress?: (event?: { stopPropagation?: () => void; preventDefault?: () => void }) => void
      testID?: string
    }) => (
      <button data-testid={testID} type="button" onClick={(event) => onPress?.(event)}>
        icon
      </button>
    ),
  }),
)

let BookDetailMenu: typeof import("./BookDetailMenu").BookDetailMenu

beforeAll(async () => {
  ;({ BookDetailMenu } = await import("./BookDetailMenu"))
})

describe("BookDetailMenu story play", () => {
  const onOpenBook = jest.fn(async () => {})
  const onEditBook = jest.fn()
  const onParentClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("edit button triggers only edit and does not bubble to the parent", async () => {
    const { container } = render(
      <div onClick={onParentClick}>
        <BookDetailMenu
          onOpenBook={onOpenBook}
          onDownloadBook={() => {}}
          onOpenBookDetail={() => {}}
          onConvertBook={() => {}}
          onEditBook={onEditBook}
          onDeleteBook={() => {}}
        />
      </div>,
    )

    await playBookDetailMenuEditDoesNotBubble({ canvasElement: container })

    expect(onEditBook).toHaveBeenCalled()
    expect(onParentClick).not.toHaveBeenCalled()
  })
})
