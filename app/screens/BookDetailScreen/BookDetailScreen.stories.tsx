import { BookDetailModal } from "@/components/Modals/BookDetailModal"
import { useConvergence } from "@/hooks/useConvergence"
import type { ApppNavigationProp } from "@/navigators/types"
import { BookDetailScreen } from "@/screens/BookDetailScreen/BookDetailScreen"
import { useNavigation } from "@react-navigation/native"
import type { Meta, StoryObj } from "@storybook/react"
import { type ReactElement, useLayoutEffect, useMemo } from "react"

import { defaultBookImageUrl } from "../../../.storybook/stories/defaultBookImageUrl"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { createBookScreenRootStore } from "../../../.storybook/stories/screens/bookScreenStoryData"

const defaultImageUrl = defaultBookImageUrl

const BookDetailModalStoryComponent = BookDetailModal as unknown as (props: {
  modal: unknown
}) => ReactElement

function createBookDetailModalProps(imageUrl: string) {
  return {
    params: {
      imageUrl,
      onLinkPress: () => {},
    },
    closeAllModals: () => {},
    closeModal: () => {},
    openModal: () => {},
  }
}

function ResponsiveBookDetailStory({ imageUrl }: { imageUrl: string }) {
  const { isLarge } = useConvergence()
  const navigation = useNavigation<ApppNavigationProp>()
  const modalProp = useMemo(() => createBookDetailModalProps(imageUrl), [imageUrl])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !isLarge,
    })
  }, [isLarge, navigation])

  return isLarge ? <BookDetailModalStoryComponent modal={modalProp} /> : <BookDetailScreen />
}

export default {
  component: BookDetailScreen,
  title: "Screens/BookDetailScreen",
  argTypes: {
    onConvertBook: { action: null },
    onDeleteBook: { action: null },
    onDownloadBook: { action: null },
    onOpenBook: { action: null },
  },
  decorators: [
    (_Story, context) => {
      const imageUrl = (context.args as { imageUrl?: string }).imageUrl ?? defaultImageUrl

      return (
        <ScreenContainer
          rootStore={createBookScreenRootStore()}
          stackScreen={{
            name: "BookDetail",
            initialParams: {
              imageUrl,
              onLinkPress: () => {},
            },
            options: {
              headerShown: true,
            },
            story: () => <ResponsiveBookDetailStory imageUrl={imageUrl} />,
          }}
        />
      )
    },
  ],
} as Meta<typeof BookDetailScreen>
type Story = StoryObj<typeof BookDetailScreen>

export const SmallMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
}

export const LargeMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
}
