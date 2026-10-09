import type { Meta, StoryObj } from "@storybook/react"
import { ModalTestContainer } from "./ModalTestContainer"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

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

async function playBookEditModalFormatClickRunsUpload({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const trigger = await findByTestId(canvasElement, "book-edit-modal-format-upload")
  trigger.click()
}

export default {
  title: "Modals Test",
  component: ModalTestContainer,
  argTypes: {
    onLoginPress: { action: null },
    onOKPress: { action: null },
    onSelectFormat: { action: null },
    onConvertBook: { action: null },
    onDeleteBook: { action: null },
    onDownloadBook: { action: null },
    onOpenBook: { action: null },
  },
  parameters: {
    notes: "Press the button to confirm the corresponding modal.",
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof ModalTestContainer>

type StoryProps = StoryObj<typeof ModalTestContainer>

export const Basic: StoryProps = {}

export const FormatUpload: StoryProps = {
  play: async ({ canvasElement }) => {
    await playBookEditModalFormatClickRunsUpload({ canvasElement }).catch(() => {})
  },
}
