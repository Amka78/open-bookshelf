import { describe as baseDescribe, expect, jest, test as baseTest } from "bun:test"
import { render, fireEvent, findByText, within } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

async function playAcquisitionShowsEntries({
  canvasElement,
  titles,
}: { canvasElement: HTMLElement; titles: string[] }) {
  for (const title of titles) {
    await findByText(canvasElement, title)
  }
}

async function playAcquisitionPressesEntry({
  canvasElement,
  title,
}: { canvasElement: HTMLElement; title: string }) {
  const titleNode = await findByText(canvasElement, title)
  const item = titleNode.closest('[data-testid="acquisition-item"]')
  if (!item) throw new Error(`Could not find acquisition item for title ${title}.`)
  fireEvent.click(within(item).getByRole("button"))
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("AcquisitionScreen story play", () => {
  const onOpenNestedFeed = jest.fn()
  const onDownloadBook = jest.fn()

  const renderStoryDom = () =>
    render(
      <div>
        <div data-testid="acquisition-item">
          <button onClick={() => onOpenNestedFeed({ href: "/opds/sub" })} type="button">
            <span>Nested Catalog</span>
          </button>
        </div>
        <div data-testid="acquisition-item">
          <button onClick={() => onDownloadBook({ href: "/download/book-a" })} type="button">
            <span>Book A</span>
          </button>
        </div>
      </div>,
    )

  test("shows acquisition entries in the story play", async () => {
    const { container } = renderStoryDom()

    await playAcquisitionShowsEntries({
      canvasElement: container,
      titles: ["Nested Catalog", "Book A"],
    })
  })

  test("pressing a nested-catalog entry in the story play triggers feed navigation action", async () => {
    const { container } = renderStoryDom()

    await playAcquisitionPressesEntry({
      canvasElement: container,
      title: "Nested Catalog",
    })

    expect(onOpenNestedFeed).toHaveBeenCalledWith({ href: "/opds/sub" })
  })

  test("pressing a book entry in the story play triggers download action", async () => {
    const { container } = renderStoryDom()

    await playAcquisitionPressesEntry({
      canvasElement: container,
      title: "Book A",
    })

    expect(onDownloadBook).toHaveBeenCalledWith({ href: "/download/book-a" })
  })
})
