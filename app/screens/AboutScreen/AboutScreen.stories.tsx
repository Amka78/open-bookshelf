import type { Meta, StoryObj } from "@storybook/react"
import { expect } from "@storybook/test"
import { findByTestId } from "@testing-library/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { AboutScreen } from "./AboutScreen"

export default {
  title: "AboutScreen",
  component: AboutScreen,
  parameters: {
    notes:
      "Mobile presentation of the app information. Desktop and tablet show the same content in AboutModal.",
  },
  decorators: [
    (Story) => (
      <ScreenContainer stackScreen={{ name: "About" }}>
        <Story />
      </ScreenContainer>
    ),
  ],
} as Meta<typeof AboutScreen>

type StoryProps = StoryObj<typeof AboutScreen>

export const Basic: StoryProps = {
  play: async ({ canvasElement }) => {
    const version = await findByTestId(canvasElement, "about-version")
    expect(version.textContent).toBeTruthy()
    expect(await findByTestId(canvasElement, "about-contact-link")).toBeTruthy()
    expect(await findByTestId(canvasElement, "about-license-link")).toBeTruthy()
    expect(await findByTestId(canvasElement, "about-repository-link")).toBeTruthy()
  },
}
