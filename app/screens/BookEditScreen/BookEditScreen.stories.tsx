import { BookEditModal } from "@/components/Modals/BookEditModal"
import { useConvergence } from "@/hooks/useConvergence"
import type { ApppNavigationProp } from "@/navigators/types"
import { BookEditScreen } from "@/screens/BookEditScreen/BookEditScreen"
import { useNavigation } from "@react-navigation/native"
import type { Meta, StoryObj } from "@storybook/react"
import { type ReactElement, useLayoutEffect, useMemo } from "react"

import { defaultBookImageUrl } from "../../../.storybook/stories/defaultBookImageUrl"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { createBookScreenRootStore } from "../../../.storybook/stories/screens/bookScreenStoryData"

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
  const modalProp = useMemo(() => createBookEditModalProps(imageUrl), [imageUrl])

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
export const Basic: Story = {}

export const SmallMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
}
