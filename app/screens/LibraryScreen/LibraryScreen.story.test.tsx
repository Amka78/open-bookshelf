import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playLibraryChangesListStyle,
  playLibraryChangesSort,
  playLibraryOpensBook,
  playLibrarySearchesByQuery,
  playLibraryShowsSearchInput,
} from "./libraryScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("LibraryScreen story play", () => {
  const onSearch = jest.fn()
  const onChangeListStyle = jest.fn()
  const onSort = jest.fn()
  const onOpenBook = jest.fn()

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
      </div>,
    )

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
})
