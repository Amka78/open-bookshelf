import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playConnectButtonIsDisabled,
  playConnectButtonTriggersSubmit,
  playConnectShowsButton,
  playConnectShowsDefaultUrl,
  playConnectShowsHeading,
} from "./connectScreenStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("ConnectScreen story play", () => {
  const onConnect = jest.fn()

  const renderStoryDom = ({
    baseUrl = "http://localhost:8080",
    buttonDisabled = false,
  }: {
    baseUrl?: string
    buttonDisabled?: boolean
  } = {}) =>
    render(
      <div>
        <h1 data-testid="connect-heading">Welcome!!</h1>
        <input aria-label="isOPDS" type="checkbox" />
        <input defaultValue={baseUrl} placeholder="(http or https)://{Address}:{Port}" />
        <button
          data-testid="connect-button"
          disabled={buttonDisabled}
          onClick={onConnect}
          type="button"
        >
          Connect
        </button>
      </div>,
    )

  test("shows the heading and connect button in the story play", async () => {
    const { container } = renderStoryDom()

    await playConnectShowsHeading({ canvasElement: container })
    await playConnectShowsButton({ canvasElement: container })
  })

  test("shows the saved base URL in the story play", async () => {
    const { container } = renderStoryDom({ baseUrl: "http://192.168.1.10:8080" })

    await playConnectShowsDefaultUrl({
      canvasElement: container,
      placeholder: "(http or https)://{Address}:{Port}",
      expectedValue: "http://192.168.1.10:8080",
    })
  })

  test("shows a disabled connect button in the story play when connection input is invalid", async () => {
    const { container } = renderStoryDom({ buttonDisabled: true })

    await playConnectButtonIsDisabled({
      canvasElement: container,
    })
  })

  test("pressing the connect button in the story play triggers the connect action", async () => {
    const { container } = renderStoryDom()

    expect(onConnect).not.toHaveBeenCalled()

    await playConnectButtonTriggersSubmit({
      canvasElement: container,
    })

    expect(onConnect).toHaveBeenCalledTimes(1)
  })
})
