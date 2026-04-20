import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playBookDetailConvertNavigation,
  playBookDetailDeleteAction,
  playBookDetailDownloadAction,
  playBookDetailEditNavigation,
  playBookDetailOcrNavigation,
  playBookDetailOpenAction,
} from "./bookDetailScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("BookDetailScreen story play", () => {
  const mockNavigate = jest.fn()
  const mockOpenBookAction = jest.fn()
  const mockDownloadBookAction = jest.fn()
  const mockConvertNavigationAction = jest.fn()
  const mockEditNavigationAction = jest.fn()
  const mockOcrNavigationAction = jest.fn()
  const mockDeleteBookAction = jest.fn()

  const renderStoryDom = () =>
    render(
      <div>
        <button data-testid="book-detail-open-button" onClick={mockOpenBookAction} type="button">
          Open
        </button>
        <button
          data-testid="book-detail-download-button"
          onClick={mockDownloadBookAction}
          type="button"
        >
          Download
        </button>
        <button
          data-testid="book-detail-convert-button"
          onClick={() => mockConvertNavigationAction({ imageUrl: "https://example.com/image.jpg" })}
          type="button"
        >
          Convert
        </button>
        <button
          data-testid="book-detail-edit-button"
          onClick={() => mockEditNavigationAction({ imageUrl: "https://example.com/image.jpg" })}
          type="button"
        >
          Edit
        </button>
        <button
          data-testid="book-detail-ocr-button"
          onClick={() => mockOcrNavigationAction({ imageUrl: "https://example.com/image.jpg" })}
          type="button"
        >
          OCR
        </button>
        <button
          data-testid="book-detail-delete-button"
          onClick={mockDeleteBookAction}
          type="button"
        >
          Delete
        </button>
      </div>,
    )

  test("pressing open in the story play triggers open action", async () => {
    const { container } = renderStoryDom()

    expect(mockOpenBookAction).not.toHaveBeenCalled()

    await playBookDetailOpenAction({
      canvasElement: container,
    })

    expect(mockOpenBookAction).toHaveBeenCalledTimes(1)
  })

  test("pressing download in the story play triggers download action", async () => {
    const { container } = renderStoryDom()

    expect(mockDownloadBookAction).not.toHaveBeenCalled()

    await playBookDetailDownloadAction({
      canvasElement: container,
    })

    expect(mockDownloadBookAction).toHaveBeenCalledTimes(1)
  })

  test("pressing convert in the story play triggers convert navigation action", async () => {
    const { container } = renderStoryDom()

    expect(mockConvertNavigationAction).not.toHaveBeenCalled()

    await playBookDetailConvertNavigation({
      canvasElement: container,
    })

    expect(mockConvertNavigationAction).toHaveBeenCalledTimes(1)
    expect(mockConvertNavigationAction).toHaveBeenCalledWith({
      imageUrl: "https://example.com/image.jpg",
    })
  })

  test("pressing edit in the story play triggers edit navigation action", async () => {
    const { container } = renderStoryDom()

    expect(mockEditNavigationAction).not.toHaveBeenCalled()

    await playBookDetailEditNavigation({
      canvasElement: container,
    })

    expect(mockEditNavigationAction).toHaveBeenCalledTimes(1)
    expect(mockEditNavigationAction).toHaveBeenCalledWith({
      imageUrl: "https://example.com/image.jpg",
    })
  })

  test("pressing delete in the story play triggers delete action", async () => {
    const { container } = renderStoryDom()

    expect(mockDeleteBookAction).not.toHaveBeenCalled()

    await playBookDetailDeleteAction({
      canvasElement: container,
    })

    expect(mockDeleteBookAction).toHaveBeenCalledTimes(1)
  })

  test("pressing OCR in the story play triggers OCR navigation action", async () => {
    const { container } = renderStoryDom()

    expect(mockOcrNavigationAction).not.toHaveBeenCalled()

    await playBookDetailOcrNavigation({
      canvasElement: container,
    })

    expect(mockOcrNavigationAction).toHaveBeenCalledTimes(1)
    expect(mockOcrNavigationAction).toHaveBeenCalledWith({
      imageUrl: "https://example.com/image.jpg",
    })
  })
})
