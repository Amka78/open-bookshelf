import { describe as baseDescribe, expect, jest, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playOPDSRootPressesEntry, playOPDSRootShowsEntries } from "./opdsRootScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("OPDSRootScreen story play", () => {
  const onEntryPress = jest.fn()

  const renderStoryDom = () =>
    render(
      <div>
        <div data-testid="opds-root-item">
          <button onClick={() => onEntryPress({ href: "/opds/fiction" })} type="button">
            <span>Fiction</span>
          </button>
        </div>
        <div data-testid="opds-root-item">
          <button onClick={() => onEntryPress({ href: "/opds/science" })} type="button">
            <span>Science</span>
          </button>
        </div>
      </div>,
    )

  test("shows OPDS entries in the story play", async () => {
    const { container } = renderStoryDom()

    await playOPDSRootShowsEntries({
      canvasElement: container,
      entryTitles: ["Fiction", "Science"],
    })
  })

  test("pressing an OPDS entry in the story play triggers entry selection", async () => {
    const { container } = renderStoryDom()

    await playOPDSRootPressesEntry({
      canvasElement: container,
      entryTitle: "Science",
    })

    expect(onEntryPress).toHaveBeenCalledWith({ href: "/opds/science" })
  })
})