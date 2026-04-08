import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playKeyboardShownHidesCover,
  playKeyboardShownKeepsFieldsVisible,
  playLargeScreenShowsSaveButton,
  playPressingSaveTriggersSubmit,
  playSmallScreenHeaderSaveButton,
  playSmallScreenHidesSaveButton,
} from "./bookEditScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("BookEditScreen story play", () => {
  const onSave = jest.fn()

  const renderWithFields = ({
    hasCover = false,
    paddingBottom = 20,
    scrollEndCalls = 0,
  }: { hasCover?: boolean; paddingBottom?: number; scrollEndCalls?: number } = {}) =>
    render(
      <div>
        {hasCover && <div data-testid="book-edit-screen-cover-container" />}
        <div data-testid="book-edit-screen-fields-container" />
        <div
          data-testid="book-edit-screen-scroll"
          data-padding-bottom={paddingBottom}
          data-scroll-end-calls={scrollEndCalls}
        />
      </div>,
    )

  const renderWithSave = () =>
    render(
      <div>
        <button type="button" onClick={onSave}>
          Save
        </button>
      </div>,
    )

  const renderWithoutSave = () => render(<div />)

  test("keyboard shown hides cover", async () => {
    const { container } = renderWithFields({ hasCover: false })
    await playKeyboardShownHidesCover({ canvasElement: container })
  })

  test("keyboard shown keeps fields visible with padding", async () => {
    const { container } = renderWithFields({ paddingBottom: 20 })
    await playKeyboardShownKeepsFieldsVisible({ canvasElement: container })
  })

  test("large screen shows save button", async () => {
    const { container } = renderWithSave()
    await playLargeScreenShowsSaveButton({ canvasElement: container })
  })

  test("small screen hides save button", async () => {
    const { container } = renderWithoutSave()
    await playSmallScreenHidesSaveButton({ canvasElement: container })
  })

  test("pressing save triggers submit", async () => {
    const { container } = renderWithSave()
    await playPressingSaveTriggersSubmit({ canvasElement: container })
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  test("small screen shows save button in header", async () => {
    const { container } = renderWithSave()
    await playSmallScreenHeaderSaveButton({ canvasElement: container })
  })
})
