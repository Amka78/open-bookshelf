import type { Meta, StoryObj } from "@storybook/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { TextBookSpine } from "./TextBookSpine"
import { buildTextBookHtmlDocument } from "./textBookHtml"
import {
  STORY_SPINE_KEY,
  playNavigateToSecondPage,
  playPaginationReported,
} from "./textBookSpineStoryPlay"

const LONG_PARAGRAPH =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt " +
  "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco " +
  "laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in " +
  "voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat " +
  "non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. "

function makeParagraphNodes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    n: "p",
    c: [`Chapter ${i + 1}: ${LONG_PARAGRAPH.repeat(3)}`],
  }))
}

const sampleHtml = buildTextBookHtmlDocument({
  documentData: {
    tree: {
      n: "html",
      c: [{ n: "body", c: makeParagraphNodes(15) }],
    },
    ns_map: [],
  },
  documentKey: STORY_SPINE_KEY,
  annotations: [],
  appearance: {
    themeMode: "light",
    textColor: "#111318",
    linkColor: "#0066cc",
    fallbackBackgroundColor: "#ffffff",
    viewerFontSizePt: 16,
    viewerTheme: "default",
  },
  readingStyle: "singlePage",
  pageDirection: "left",
  initialPage: 0,
  leadingBlankPage: false,
})

const defaultArgs = {
  libraryId: "",
  bookId: 0,
  format: "",
  size: 0,
  hash: 0,
  pagePath: STORY_SPINE_KEY,
  sourceHtml: sampleHtml,
  currentPage: 0,
  readingStyle: "singlePage" as const,
  pageDirection: "left" as const,
  leadingBlankPage: false,
  annotations: [],
}

export default {
  title: "TextBookSpine",
  component: TextBookSpine,
  decorators: [
    (Story: React.ComponentType) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
  parameters: {
    notes:
      "Renders a single epub spine in a paginated iframe. " +
      "sourceHtml bypasses the Calibre API fetch so stories work without a server. " +
      "The spine uses CSS columns to split content into horizontal pages.",
  },
} as Meta<typeof TextBookSpine>

type StoryProps = StoryObj<typeof TextBookSpine>

export const MultiPageSpine: StoryProps = {
  args: defaultArgs,
  play: playPaginationReported,
}

export const NavigateToSecondPage: StoryProps = {
  args: {
    ...defaultArgs,
    currentPage: 1,
  },
  play: playNavigateToSecondPage,
}
