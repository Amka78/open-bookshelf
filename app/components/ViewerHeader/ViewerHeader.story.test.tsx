import { describe as baseDescribe, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playViewerHeaderShowsTitleAndActions } from "./viewerHeaderStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ViewerHeader story play", () => {
  test("shows title and actions trigger", async () => {
    const { container } = render(
      <div>
        <div data-testid="viewer-header-title">HeaderTitle</div>
        <button data-testid="viewer-display-settings-trigger" type="button" />
      </div>,
    )

    await playViewerHeaderShowsTitleAndActions({ canvasElement: container })
  })
})
