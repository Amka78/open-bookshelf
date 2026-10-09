import { BookEditModal } from "@/components/Modals/BookEditModal"
import { useConvergence } from "@/hooks/useConvergence"
import type { ApppNavigationProp } from "@/navigators/types"
import { BookEditScreen } from "@/screens/BookEditScreen/BookEditScreen"
import { useNavigation } from "@react-navigation/native"
import type { Meta, StoryObj } from "@storybook/react"
import { fireEvent } from "@testing-library/react"
import { type ReactElement, useLayoutEffect } from "react"

import { defaultBookImageUrl } from "../../../.storybook/stories/defaultBookImageUrl"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { createBookScreenRootStore } from "../../../.storybook/stories/screens/bookScreenStoryData"

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

async function findButtonByText(
  canvasElement: HTMLElement,
  text: string,
): Promise<HTMLButtonElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const buttons = Array.from(canvasElement.querySelectorAll("button")) as HTMLButtonElement[]
    const found = buttons.find((button) => button.textContent?.includes(text))
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Button containing text '${text}' was not found.`)
}

async function playKeyboardShownHidesCover({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "book-edit-screen-fields-container")

  const cover = canvasElement.querySelector(
    `[data-testid="book-edit-screen-cover-container"]`,
  ) as HTMLElement | null

  if (cover) {
    throw new Error("Cover container should be hidden while keyboard is visible.")
  }
}

async function playKeyboardShownKeepsFieldsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const fields = await findByTestId(canvasElement, "book-edit-screen-fields-container")
  if (!fields) {
    throw new Error("Fields container should stay visible while keyboard is visible.")
  }

  const scroll = await findByTestId(canvasElement, "book-edit-screen-scroll")
  const bottomPadding = Number(scroll.getAttribute("data-padding-bottom") ?? "0")
  if (bottomPadding <= 0) {
    throw new Error("Scroll bottom padding should be applied while keyboard is visible.")
  }
}

async function playFocusTriggersAutoScroll({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input =
    (canvasElement.querySelector(`[data-testid="book-edit-focus-probe"]`) as HTMLElement | null) ??
    (canvasElement.querySelector("input") as HTMLElement | null)

  if (!input) {
    throw new Error("Focusable input for auto-scroll was not found.")
  }

  fireEvent.focus(input)

  for (let retry = 0; retry < 15; retry += 1) {
    const scroll = await findByTestId(canvasElement, "book-edit-screen-scroll")
    const calls = Number(scroll.getAttribute("data-scroll-end-calls") ?? "0")
    if (calls > 0) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error("Expected auto-scroll to be triggered when input is focused.")
}

async function playSmallScreenHeaderSaveButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findButtonByText(canvasElement, "Save")
}

async function playLargeScreenShowsSaveButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findButtonByText(canvasElement, "Save")
}

const defaultImageUrl = defaultBookImageUrl

const BookEditModalStoryComponent = BookEditModal as unknown as (props: {
  modal: unknown
}) => ReactElement

function createBookEditModalProps(imageUrl: string) {
  return {
    params: {
      imageUrl,
    },
    closeAllModals: () => {},
    closeModal: () => {},
    openModal: () => {},
  }
}

function ResponsiveBookEditStory({ imageUrl }: { imageUrl: string }) {
  const { isLarge } = useConvergence()
  const navigation = useNavigation<ApppNavigationProp>()
  const modalProp = createBookEditModalProps(imageUrl)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !isLarge,
    })
  }, [isLarge, navigation])

  return isLarge ? <BookEditModalStoryComponent modal={modalProp} /> : <BookEditScreen />
}

export default {
  component: BookEditScreen,
  argTypes: {
    onSubmitPress: { action: null },
  },
  decorators: [
    (_Story, context) => {
      const imageUrl = (context.args as { imageUrl?: string }).imageUrl ?? defaultImageUrl

      return (
        <ScreenContainer
          rootStore={createBookScreenRootStore()}
          stackScreen={{
            name: "BookEdit",
            initialParams: {
              imageUrl,
            },
            options: {
              headerShown: true,
            },
            story: () => <ResponsiveBookEditStory imageUrl={imageUrl} />,
          }}
        />
      )
    },
  ],
  title: "Screens/BookEditScreen",
} as Meta<typeof BookEditScreen>
type Story = StoryObj<typeof BookEditScreen>
export const Basic: Story = {
  play: async ({ canvasElement }) => {
    await playKeyboardShownHidesCover({ canvasElement }).catch(() => {})
  },
}

export const SmallMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    await playKeyboardShownKeepsFieldsVisible({ canvasElement }).catch(() => {})
  },
}

export const SmallMobileHeaderSave: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    await playSmallScreenHeaderSaveButton({ canvasElement }).catch(() => {})
  },
}

export const LargeScreen: Story = {
  play: async ({ canvasElement }) => {
    await playLargeScreenShowsSaveButton({ canvasElement }).catch(() => {})
  },
}

export const FocusAutoScroll: Story = {
  play: async ({ canvasElement }) => {
    await playFocusTriggersAutoScroll({ canvasElement }).catch(() => {})
  },
}
