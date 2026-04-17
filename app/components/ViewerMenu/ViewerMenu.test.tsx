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

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useConvergenceMock = jest.fn()

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: useConvergenceMock,
}))

mock.module("/home/amka78/private/open-bookshelf/app/hooks/useConvergence.ts", () => ({
  useConvergence: useConvergenceMock,
}))

mock.module("@/theme", () => ({
  usePalette: () => ({
    textSecondary: "#666",
  }),
}))

mock.module("@/i18n", () => ({
  translate: (key: string) => key,
}))

mock.module("@/components", () => ({
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  IconButton: ({
    name,
    labelTx,
    testID,
  }: {
    name?: string
    labelTx?: string
    testID?: string
  }) => (
    <button data-icon-name={name} data-label-tx={labelTx ?? ""} data-testid={testID} type="button">
      {labelTx ?? name}
    </button>
  ),
  MaterialCommunityIcon: ({ name, testID }: { name?: string; testID?: string }) => (
    <div data-icon-name={name} data-testid={testID} />
  ),
  Text: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@gluestack-ui/themed", () => ({
  Menu: ({
    children,
    trigger,
  }: {
    children?: ReactNode
    trigger: (props: Record<string, unknown>) => ReactNode
  }) => (
    <div>
      {trigger({})}
      <div>{children}</div>
    </div>
  ),
  MenuItem: ({
    children,
    onPress: _onPress,
  }: {
    children?: ReactNode
    onPress?: () => void
  }) => <div>{children}</div>,
  MenuItemLabel: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Pressable: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID}>{children}</div>
  ),
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let ViewerMenu: typeof import("./ViewerMenu").ViewerMenu

beforeAll(async () => {
  ;({ ViewerMenu } = await import("./ViewerMenu"))
})

describe("ViewerMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useConvergenceMock.mockReturnValue({
      orientation: "horizontal",
      isLarge: true,
    })
  })

  test("does not render the current reading style label in the overflow trigger", () => {
    const { container } = render(
      <ViewerMenu
        pageDirection="left"
        readingStyle="singlePage"
        autoPageTurning={false}
        onSelectReadingStyle={() => {}}
        onSelectPageDirection={() => {}}
      />,
    )

    const triggerButton = container.querySelector('[data-icon-name="dots-vertical"]')
    expect(triggerButton?.getAttribute("data-label-tx")).toBe("")
  })

  test("shows a checkmark next to the selected reading style", () => {
    const { container, getByTestId, queryByTestId } = render(
      <ViewerMenu
        pageDirection="left"
        readingStyle="facingPage"
        autoPageTurning={false}
        onSelectReadingStyle={() => {}}
        onSelectPageDirection={() => {}}
      />,
    )

    expect(getByTestId("viewer-reading-style-check-facingPage")).not.toBeNull()
    expect(queryByTestId("viewer-reading-style-check-singlePage")).toBeNull()
    expect(queryByTestId("viewer-reading-style-check-verticalScroll")).toBeNull()

    const selectedLabel = getByTestId("viewer-reading-style-check-facingPage").parentElement
    expect(selectedLabel?.firstElementChild).toBe(
      getByTestId("viewer-reading-style-check-facingPage"),
    )
    expect(
      container.querySelector('[data-testid="viewer-reading-style-check-facingPage"]'),
    ).not.toBeNull()
  })
})
