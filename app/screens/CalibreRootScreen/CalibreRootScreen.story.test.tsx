import { describe as baseDescribe, expect, jest, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playCalibreRootPressesLibrary,
  playCalibreRootShowsLibraryNames,
} from "./calibreRootScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("CalibreRootScreen story play", () => {
  const onLibraryPress = jest.fn()

  const renderStoryDom = () =>
    render(
      <div>
        <div data-testid="calibre-root-item">
          <button onClick={() => onLibraryPress("library-1")} type="button">
            <span>library-1</span>
          </button>
        </div>
        <div data-testid="calibre-root-item">
          <button onClick={() => onLibraryPress("library-2")} type="button">
            <span>library-2</span>
          </button>
        </div>
        <div data-testid="calibre-root-item">
          <button onClick={() => onLibraryPress("library-3")} type="button">
            <span>library-3</span>
          </button>
        </div>
      </div>,
    )

  test("shows the available libraries in the story play", async () => {
    const { container } = renderStoryDom()

    await playCalibreRootShowsLibraryNames({
      canvasElement: container,
      libraryNames: ["library-1", "library-2", "library-3"],
    })
  })

  test("pressing a library in the story play triggers the library selection action", async () => {
    const { container } = renderStoryDom()

    await playCalibreRootPressesLibrary({
      canvasElement: container,
      libraryName: "library-3",
    })

    expect(onLibraryPress).toHaveBeenCalledWith("library-3")
  })
})