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
import {
  playFocusTriggersAutoScroll,
  playKeyboardShownHidesCover,
  playKeyboardShownKeepsFieldsVisible,
  playLargeScreenShowsSaveButton,
  playSmallScreenHeaderSaveButton,
} from "./bookEditScreenStoryPlay"

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
