import { BookDetailModal } from "@/components/Modals/BookDetailModal"
import { useConvergence } from "@/hooks/useConvergence"
import type { ApppNavigationProp } from "@/navigators/types"
import { BookDetailScreen } from "@/screens/BookDetailScreen/BookDetailScreen"
import { useNavigation } from "@react-navigation/native"
import { action } from "@storybook/addon-actions"
import type { Meta, StoryObj } from "@storybook/react"
import { type ReactElement, useLayoutEffect, useMemo } from "react"
import {
  playBookDetailConvertNavigation,
  playBookDetailDeleteAction,
  playBookDetailDownloadAction,
  playBookDetailEditNavigation,
  playBookDetailOpenAction,
} from "./bookDetailScreenStoryPlay"

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
  args: {
    onOpenBookAction: action("action:bookDetail.open"),
    onDownloadBookAction: action("action:bookDetail.download"),
    onNavigateToBookConvert: action("navigate:BookConvert"),
    onNavigateToBookEdit: action("navigate:BookEdit"),
    onDeleteBookAction: action("action:bookDetail.delete"),
  },
  argTypes: {
    onOpenBookAction: { action: "action:bookDetail.open" },
    onDownloadBookAction: { action: "action:bookDetail.download" },
    onNavigateToBookConvert: { action: "navigate:BookConvert" },
    onNavigateToBookEdit: { action: "navigate:BookEdit" },
    onDeleteBookAction: { action: "action:bookDetail.delete" },
  },
  decorators: [
    (_Story, context) => {
      const args = context.args as {
        imageUrl?: string
        onOpenBookAction?: () => void | Promise<void>
        onDownloadBookAction?: () => void | Promise<void>
        onNavigateToBookConvert?: (params: { imageUrl: string }) => void
        onNavigateToBookEdit?: (params: { imageUrl: string }) => void
        onDeleteBookAction?: () => void | Promise<void>
      }
      const imageUrl = args.imageUrl ?? defaultImageUrl
      const onOpenBookAction = args.onOpenBookAction ?? action("action:bookDetail.open")
      const onDownloadBookAction = args.onDownloadBookAction ?? action("action:bookDetail.download")
      const onNavigateToBookConvert = args.onNavigateToBookConvert ?? action("navigate:BookConvert")
      const onNavigateToBookEdit = args.onNavigateToBookEdit ?? action("navigate:BookEdit")
      const onDeleteBookAction = args.onDeleteBookAction ?? action("action:bookDetail.delete")

      return (
        <ScreenContainer
          rootStore={createBookScreenRootStore()}
          stackScreen={{
            name: "BookDetail",
            initialParams: {
              imageUrl,
              onLinkPress: () => {},
              onOpenBookAction,
              onDownloadBookAction,
              onNavigateToBookConvert,
              onNavigateToBookEdit,
              onDeleteBookAction,
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

export const ConvertNavigatesOnSmallScreen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: playBookDetailConvertNavigation,
}

export const OpenRunsActionOnSmallScreen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: playBookDetailOpenAction,
}

export const DownloadRunsActionOnSmallScreen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: playBookDetailDownloadAction,
}

export const EditRunsActionOnSmallScreen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: playBookDetailEditNavigation,
}

export const DeleteRunsActionOnSmallScreen: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: playBookDetailDeleteAction,
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
