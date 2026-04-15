import { describe as baseDescribe, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playShowsPlaceholder, playTypingUpdatesInput } from "./inputFieldStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("InputField story play", () => {
  test("shows the translated placeholder", async () => {
    const { container } = render(<input placeholder="(http or https)://{Address}:{Port}" />)

    await playShowsPlaceholder({
      canvasElement: container,
      placeholder: "(http or https)://{Address}:{Port}",
    })
  })

  test("typing updates the displayed input value", async () => {
    const { container } = render(<input placeholder="(http or https)://{Address}:{Port}" />)

    await playTypingUpdatesInput({
      canvasElement: container,
      placeholder: "(http or https)://{Address}:{Port}",
      value: "http://localhost:8080",
    })
  })
})
