import { beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playKeyboardShownPlacesSuggestionsAbove } from "./formSuggestionPopoverPlay"

const useKeyboardVisibilityMock = jest.fn()

mock.module("@/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: () => useKeyboardVisibilityMock(),
}))

let resolveSuggestionPopoverPlacement: typeof import("./formSuggestionPlacement").resolveSuggestionPopoverPlacement

beforeEach(async () => {
  jest.clearAllMocks()
  ;({ resolveSuggestionPopoverPlacement } = await import("./formSuggestionPlacement"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("FormSuggestionPopover keyboard placement", () => {
  test("uses top placement when keyboard is visible", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 300,
    })

    const placement = resolveSuggestionPopoverPlacement(true)

    await playKeyboardShownPlacesSuggestionsAbove({
      placement,
    })

    expect(placement).toBe("top left")
  })
})
