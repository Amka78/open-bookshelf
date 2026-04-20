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
import { playFiveStarRendersStars, playSelectableRatingPressesHandler } from "./ratingStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)
const onPress = jest.fn()

mock.module("../Box/Box", () => ({
  Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("../HStack/HStack", () => ({
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("../MaterialCommunityIcon/MaterialCommunityIcon", () => ({
  MaterialCommunityIcon: ({ name }: { name?: string }) => (
    <span data-testid={name === "star" ? "rating-star" : "rating-icon"} />
  ),
}))

mock.module("../Text/Text", () => ({
  Text: ({ children, tx }: { children?: ReactNode; tx?: string }) => <span>{tx ?? children}</span>,
}))

mock.module("@gluestack-ui/themed", () => ({
  Pressable: ({
    children,
    onPress,
  }: {
    children?: ReactNode
    onPress?: () => void
  }) => (
    <div onClick={onPress} role="button" tabIndex={0}>
      {children}
    </div>
  ),
  styled: <T,>(component: T) => component,
}))

let Rating: typeof import("./Rating").Rating

beforeAll(async () => {
  ;({ Rating } = await import("./Rating"))
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("Rating story play", () => {
  test("five star story renders five stars", async () => {
    const { container } = render(<Rating rating={10} />)

    await playFiveStarRendersStars({ canvasElement: container })
  })

  test("selectable rating story calls onPress with current rating", async () => {
    const { container } = render(<Rating rating={10} variant="selectable" onPress={onPress} />)

    await playSelectableRatingPressesHandler({
      args: { onPress, rating: 10 },
      canvasElement: container,
    })

    expect(onPress).toHaveBeenCalledWith(10)
  })
})
