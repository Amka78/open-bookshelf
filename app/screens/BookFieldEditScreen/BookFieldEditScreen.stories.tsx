import type { Meta, StoryObj } from "@storybook/react"
import { fireEvent } from "@testing-library/react"
import { BookFieldEditScreen } from "./BookFieldEditScreen"

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

async function playTextInputShowsSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "book-field-edit-input")
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: "Ace" } })

  await findByTestId(canvasElement, "book-field-edit-suggestions")
}

function FieldEditStory({ initialParams }: { initialParams: unknown }) {
  return (
    <ScreenContainer
      stackScreen={{
        name: "BookFieldEdit",
        initialParams,
        options: {
          headerShown: true,
        },
        story: () => <BookFieldEditScreen />,
      }}
    />
  )
}

const textParams = {
  title: "Publisher",
  formPath: "publisher",
  datatype: "text" as const,
  initialValue: null,
  suggestions: ["Ace Books", "Tor Books", "Penguin Random House"],
  onSave: () => {},
}

export default {
  component: BookFieldEditScreen,
  decorators: [
    (Story, context) => {
      const args = context.args as { datatype?: string }
      if (args.datatype === "comments") {
        return (
          <FieldEditStory
            initialParams={{
              title: "Comments",
              formPath: "comments",
              datatype: "comments" as const,
              initialValue: "既存コメント",
              onSave: () => {},
            }}
          />
        )
      }
      return <FieldEditStory initialParams={textParams} />
    },
  ],
  title: "Screens/BookFieldEditScreen",
} as Meta<typeof BookFieldEditScreen>

type Story = StoryObj<typeof BookFieldEditScreen>

export const TextField: Story = {
  play: async ({ canvasElement }) => {
    await playTextInputShowsSuggestions({ canvasElement })
  },
}

export const CommentsField: Story = {
  args: {
    datatype: "comments",
  },
  play: async ({ canvasElement }) => {
    await findByTestId(canvasElement, "book-field-edit-input")
  },
}
