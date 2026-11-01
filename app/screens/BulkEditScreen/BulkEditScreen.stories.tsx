import type { Meta, StoryObj } from "@storybook/react"
import { expect } from "@storybook/test"
import { findByTestId } from "@testing-library/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { BulkEditScreen } from "./BulkEditScreen"

export default {
  title: "BulkEditScreen",
  component: BulkEditScreen,
  parameters: {
    notes:
      "Mobile presentation of the bulk edit form. Desktop and tablet show the same content in BulkEditModal.",
  },
  decorators: [
    (Story) => (
      <ScreenContainer
        stackScreen={{
          name: "BulkEdit",
          initialParams: {
            bookIds: [1],
            libraryId: "library-1",
          },
          options: {
            headerShown: true,
          },
        }}
      >
        <Story />
      </ScreenContainer>
    ),
  ],
} as Meta<typeof BulkEditScreen>

type StoryProps = StoryObj<typeof BulkEditScreen>

export const Basic: StoryProps = {
  play: async ({ canvasElement }) => {
    expect(await findByTestId(canvasElement, "bulk-edit-content")).toBeTruthy()
    expect((await findByTestId(canvasElement, "bulk-edit-book-count")).textContent).toBeTruthy()
    expect(await findByTestId(canvasElement, "bulk-edit-save")).toBeTruthy()
  },
}
