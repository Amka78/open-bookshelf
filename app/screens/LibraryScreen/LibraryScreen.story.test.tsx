import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import React from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playLibraryChangesListStyle,
  playLibraryChangesSort,
  playLibraryOpensBook,
  playLibraryRestoresScrollPosition,
  playLibraryRunsCoverOcr,
  playLibrarySearchesByQuery,
  playLibraryShowsSearchInput,
  playLibraryTogglesSelectAllVisible,
} from "./libraryScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("LibraryScreen story play", () => {
  const onSearch = jest.fn()
  const onChangeListStyle = jest.fn()
  const onSort = jest.fn()
  const onOpenBook = jest.fn()
  const onRunCoverOcr = jest.fn()

  const renderStoryDom = () =>
    render(
      <div>
        <input
          aria-label="library-search"
          onChange={(event) => onSearch((event.target as HTMLInputElement).value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearch((event.target as HTMLInputElement).value)
            }
          }}
          placeholder="Search books"
        />

        <button onClick={onChangeListStyle} type="button">
          Change View
        </button>

        <label htmlFor="library-sort">Sort</label>
        <select
          data-testid="library-sort"
          id="library-sort"
          onChange={(event) => onSort((event.target as HTMLSelectElement).value)}
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="rating">Rating</option>
        </select>

        <button onClick={() => onOpenBook("Book Alpha")} type="button">
          Book Alpha
        </button>
        <button data-testid="library-run-cover-ocr" onClick={onRunCoverOcr} type="button">
          Run Cover OCR
        </button>
      </div>,
    )

  const renderSelectionBarDom = () => {
    function SelectionToggleProbe() {
      const [allVisibleSelected, setAllVisibleSelected] = React.useState(false)

      return (
        <button
          data-testid="selection-action-bar-toggle-visible"
          onClick={() => {
            setAllVisibleSelected((prev) => !prev)
          }}
          type="button"
        >
          {allVisibleSelected ? "Clear visible selection" : "Select all visible"}
        </button>
      )
    }

    return render(<SelectionToggleProbe />)
  }

  const renderScrollRestoreDom = () => {
    function ScrollRestoreProbe() {
      const scrollRef = React.useRef<HTMLDivElement>(null)
      const savedScrollTopRef = React.useRef(0)

      return (
        <div>
          <div data-testid="library-scroll-region" ref={scrollRef} />
          <button
            data-testid="library-save-scroll"
            onClick={() => {
              savedScrollTopRef.current = scrollRef.current?.scrollTop ?? 0
            }}
            type="button"
          >
            Save Scroll
          </button>
          <button
            data-testid="library-restore-scroll"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = savedScrollTopRef.current
              }
            }}
            type="button"
          >
            Restore Scroll
          </button>
        </div>
      )
    }

    return render(<ScrollRestoreProbe />)
  }

  test("shows the search input in the library story play", async () => {
    const { container } = renderStoryDom()

    await playLibraryShowsSearchInput({
      canvasElement: container,
      placeholder: "Search books",
    })
  })

  test("submitting a search query triggers search action in the library story play", async () => {
    const { container } = renderStoryDom()

    await playLibrarySearchesByQuery({
      canvasElement: container,
      placeholder: "Search books",
      query: "Dune",
    })

    expect(onSearch).toHaveBeenCalledWith("Dune")
  })

  test("pressing change view triggers list style action in the library story play", async () => {
    const { container } = renderStoryDom()

    await playLibraryChangesListStyle({
      canvasElement: container,
    })

    expect(onChangeListStyle).toHaveBeenCalledTimes(1)
  })

  test("changing sort option triggers sort action in the library story play", async () => {
    const { container } = renderStoryDom()

    await playLibraryChangesSort({
      canvasElement: container,
      option: "author",
    })

    expect(onSort).toHaveBeenCalledWith("author")
  })

  test("pressing a book item triggers open-book action in the library story play", async () => {
    const { container } = renderStoryDom()

    await playLibraryOpensBook({
      canvasElement: container,
      title: "Book Alpha",
    })

    expect(onOpenBook).toHaveBeenCalledWith("Book Alpha")
  })

  test("pressing the cover OCR action triggers OCR navigation in the library story play", async () => {
    const { container } = renderStoryDom()

    await playLibraryRunsCoverOcr({
      canvasElement: container,
    })

    expect(onRunCoverOcr).toHaveBeenCalledTimes(1)
  })

  test("pressing the selection bar toggle switches from select-all to clear-visible in the library story play", async () => {
    const { container, getByText } = renderSelectionBarDom()

    expect(getByText("Select all visible")).toBeTruthy()

    await playLibraryTogglesSelectAllVisible({
      canvasElement: container,
    })

    expect(getByText("Clear visible selection")).toBeTruthy()
  })

  test("restoring scroll position returns the list to the saved offset in the library story play", async () => {
    const { container, getByTestId } = renderScrollRestoreDom()

    await playLibraryRestoresScrollPosition({
      canvasElement: container,
      scrollTop: 240,
    })

    expect((getByTestId("library-scroll-region") as HTMLDivElement).scrollTop).toBe(240)
  })
})
