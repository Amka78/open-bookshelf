import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { AutoPageTurningIconButton } from "./AutoPageTurningIconButton"
import { VStack, HStack } from "@/components"

const meta: Meta<typeof AutoPageTurningIconButton> = {
  component: AutoPageTurningIconButton,
  title: "Components/AutoPageTurningIconButton",
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  args: {
    isActive: false,
    onPress: () => console.log("pressed"),
  },
}

export const Active: Story = {
  args: {
    isActive: true,
    onPress: () => console.log("pressed"),
  },
}

export const Interactive: Story = {
  render: () => {
    const [isActive, setIsActive] = useState(false)
    return (
      <AutoPageTurningIconButton
        isActive={isActive}
        onPress={() => setIsActive((prev) => !prev)}
      />
    )
  },
}

export const DifferentSizes: Story = {
  render: () => {
    return (
      <VStack gap={16}>
        <HStack gap={16} alignItems="center">
          <HStack>
            <AutoPageTurningIconButton isActive={true} iconSize="md" />
          </HStack>
        </HStack>
        <HStack gap={16} alignItems="center">
          <HStack>
            <AutoPageTurningIconButton isActive={true} iconSize="md-" />
          </HStack>
        </HStack>
        <HStack gap={16} alignItems="center">
          <HStack>
            <AutoPageTurningIconButton isActive={true} iconSize="sm" />
          </HStack>
        </HStack>
        <HStack gap={16} alignItems="center">
          <HStack>
            <AutoPageTurningIconButton isActive={true} iconSize="sm-" />
          </HStack>
        </HStack>
      </VStack>
    )
  },
}
