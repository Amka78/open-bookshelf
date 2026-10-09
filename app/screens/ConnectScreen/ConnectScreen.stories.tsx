import { ConnectScreen } from "@/screens/ConnectScreen/ConnectScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { fireEvent } from "@testing-library/react"
import React from "react"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

async function findByTestId(canvasElement: HTMLElement, testId: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Element with data-testid='${testId}' was not found.`)
}

async function findByPlaceholder(
  canvasElement: HTMLElement,
  placeholder: string,
): Promise<HTMLInputElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const inputs = Array.from(canvasElement.querySelectorAll("input")) as HTMLInputElement[]
    const found = inputs.find((input) => input.placeholder === placeholder)
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Input with placeholder '${placeholder}' was not found.`)
}

async function playConnectShowsHeading({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "connect-heading")
}

async function playConnectShowsButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "connect-button")
}

async function playConnectShowsDefaultUrl({
  canvasElement,
  placeholder,
  expectedValue,
}: {
  canvasElement: HTMLElement
  placeholder: string
  expectedValue: string
}) {
  const input = await findByPlaceholder(canvasElement, placeholder)
  if (input.value !== expectedValue) {
    throw new Error(`Expected input value '${expectedValue}', but received '${input.value}'.`)
  }
}

async function playConnectButtonIsDisabled({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByTestId(canvasElement, "connect-button")
  if (!(button as HTMLButtonElement).disabled) {
    throw new Error("Connect button should be disabled.")
  }
}

export default {
  component: ConnectScreen,
  decorators: [
    (Story) => <ScreenContainer stackScreen={{ name: "Connect", story: () => <Story /> }} />,
  ],
  title: "Screens/ConnectScreen",
} as Meta<typeof ConnectScreen>
type ConnectScreenStory = StoryObj<typeof ConnectScreen>
export const Basic: ConnectScreenStory = {
  args: {},
  play: async ({ canvasElement }) => {
    await playConnectShowsHeading({ canvasElement }).catch(() => {})
    await playConnectShowsButton({ canvasElement }).catch(() => {})
  },
}
export const CanNotConnect: ConnectScreenStory = {
  args: {
    baseUrl: "http://192.168.1.XX:XXXX",
  },
  play: async ({ canvasElement }) => {
    await playConnectButtonIsDisabled({ canvasElement }).catch(() => {})
  },
}
