import { describe as baseDescribe, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playViewerMenuShowsActionsTrigger } from "./viewerMenuStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ViewerMenu story play", () => {
  test("shows actions trigger", async () => {
    const { container } = render(
      <button data-testid="viewer-display-settings-trigger" type="button" />,
    )
    await playViewerMenuShowsActionsTrigger({ canvasElement: container })
  })
})
