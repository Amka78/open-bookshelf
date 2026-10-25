import { BookEditModal } from "@/components/Modals/BookEditModal"
import { useConvergence } from "@/hooks/useConvergence"
import type { ApppNavigationProp } from "@/navigators/types"
import { BookEditScreen } from "@/screens/BookEditScreen/BookEditScreen"
import { useNavigation } from "@react-navigation/native"
import type { Meta, StoryObj } from "@storybook/react"
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

async function playFieldsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "book-edit-screen-fields-container")
}

async function playNavRowVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "book-edit-nav-title")
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
    await playFieldsVisible({ canvasElement })
    // カバーはキーボード非依存で常時表示（旧キーボード時非表示ロジックは削除済み）
    await findByTestId(canvasElement, "book-edit-screen-cover-container")
  },
}

export const NavRowsVisible: Story = {
  play: async ({ canvasElement }) => {
    await playNavRowVisible({ canvasElement })
  },
}

export const SmallMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    await playFieldsVisible({ canvasElement })
  },
}

export const SmallMobileHeaderSave: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    await playSmallScreenHeaderSaveButton({ canvasElement })
  },
}

export const LargeScreen: Story = {
  play: async ({ canvasElement }) => {
    await playLargeScreenShowsSaveButton({ canvasElement })
  },
}