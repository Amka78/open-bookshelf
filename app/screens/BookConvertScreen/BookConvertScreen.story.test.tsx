import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playBookConvertSelectsOutputFormat,
  playBookConvertShowsAccordionSections,
  playBookConvertShowsErrorState,
  playBookConvertShowsFormatSelection,
  playBookConvertShowsSpinnerWhileConverting,
  playBookConvertShowsSuccessState,
} from "./bookConvertScreenPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("BookConvertScreen story play", () => {
  const onSelectEpub = jest.fn()

  const renderStoryDom = ({
    showSpinner = false,
    showSuccess = false,
    showError = false,
  }: {
    showSpinner?: boolean
    showSuccess?: boolean
    showError?: boolean
  } = {}) =>
    render(
      <div>
        <button data-testid="format-button-EPUB" onClick={onSelectEpub} type="button">
          EPUB
        </button>
        <button data-testid="format-button-PDF" type="button">
          PDF
        </button>
        <div data-testid="convert-accordion">Accordion</div>
        {showSpinner ? <div>Converting...</div> : null}
        {showSuccess ? <div data-testid="convert-success">Conversion complete!</div> : null}
        {showError ? (
          <div data-testid="convert-error">Conversion traceback: invalid format</div>
        ) : null}
      </div>,
    )

  test("shows output format choices in the conversion story play", async () => {
    const { container } = renderStoryDom()

    await playBookConvertShowsFormatSelection({
      canvasElement: container,
      format: "EPUB",
    })
    await playBookConvertShowsFormatSelection({
      canvasElement: container,
      format: "PDF",
    })
  })

  test("pressing an output format in the story play triggers the format selection action", async () => {
    const { container } = renderStoryDom()

    expect(onSelectEpub).not.toHaveBeenCalled()

    await playBookConvertSelectsOutputFormat({
      canvasElement: container,
      format: "EPUB",
    })

    expect(onSelectEpub).toHaveBeenCalledTimes(1)
  })

  test("shows the conversion accordion in the story play", async () => {
    const { container } = renderStoryDom()

    await playBookConvertShowsAccordionSections({
      canvasElement: container,
    })
  })

  test("shows the converting state in the story play", async () => {
    const { container } = renderStoryDom({ showSpinner: true })

    await playBookConvertShowsSpinnerWhileConverting({
      canvasElement: container,
    })
  })

  test("shows the success state in the story play", async () => {
    const { container } = renderStoryDom({ showSuccess: true })

    await playBookConvertShowsSuccessState({
      canvasElement: container,
    })
  })

  test("shows the error state in the story play", async () => {
    const { container } = renderStoryDom({ showError: true })

    await playBookConvertShowsErrorState({
      canvasElement: container,
    })
  })
})
