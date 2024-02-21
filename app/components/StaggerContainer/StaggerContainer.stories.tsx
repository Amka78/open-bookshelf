import { Meta, StoryObj } from "@storybook/react"
import { AddFileButton, AuthButton, StaggerContainer, LibraryViewButton, SortMenu } from "@/components"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "StaggerContainer",
  component: StaggerContainer,
  args: {
    menus: <>
    <AuthButton mode={"login"} />
    <AddFileButton />
    <LibraryViewButton mode="gridView" />
    <SortMenu />
    </>,
    menusHeight: 230,
    position: "relative",
  },
  decorators: [
    (Story) => (
      <ComponentHolder justifyContent={"flex-end"}>
          <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `standard string representation.`
  }
} as Meta<typeof StaggerContainer>

type Story = StoryObj<typeof StaggerContainer>

export const Basic: Story = {}
