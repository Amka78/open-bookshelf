import { AboutContent } from "@/components/About/AboutContent"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, within } from "@storybook/test"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "AboutContent",
  component: AboutContent,
  args: {
    version: "0.1.2",
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: "App information shared by the desktop/tablet modal and the mobile screen.",
  },
} as Meta<typeof AboutContent>

type StoryProps = StoryObj<typeof AboutContent>

export const Basic: StoryProps = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect((await canvas.findByTestId("about-version")).textContent).toContain("0.1.2")
    expect(await canvas.findByTestId("about-contact-link")).toBeTruthy()
    expect(await canvas.findByTestId("about-license-link")).toBeTruthy()
    expect((await canvas.findByTestId("about-repository-link")).textContent).toContain(
      "github.com/Amka78/open-bookshelf",
    )
  },
}

export const UnknownVersion: StoryProps = {
  args: {
    version: undefined,
  },
}
