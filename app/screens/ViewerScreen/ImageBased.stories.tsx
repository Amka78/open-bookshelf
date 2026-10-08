import { RootStoreModel } from "@/models"
import { ViewerScreen } from "@/screens/ViewerScreen/ViewerScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { useWindowDimensions } from "react-native"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import {
  IMAGE_BASED_FORMATS,
  createMockImagePage,
} from "../../components/BookViewer/bookViewerStoryData"
import { playBasicViewerRenders } from "../../components/BookViewer/bookViewerStoryPlay"

// ============================================================
// Helpers
// ============================================================

function createImageSvg(width: number, height: number, pageIdx: number, total: number) {
  return createMockImagePage(pageIdx, total)
    .replace("width='800'", `width='${width}'`)
    .replace("height='1100'", `height='${height}'`)
}

function createImagePaths(width: number, height: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => createImageSvg(width, height, i, count))
}

function createImageRootStore(format: string, paths: string[]) {
  return RootStoreModel.create({
    authenticationStore: {
      token: "dXNlcjpwYXNz",
      userId: "user",
      password: "pass",
    },
    calibreRootStore: {
      defaultLibraryId: "library-1",
      numPerPage: 20,
      libraryMap: {
        "library-1": {
          id: "library-1",
          books: {
            "1": {
              id: 1,
              metaData: {
                sharpFixed: null,
                authorSort: null,
                authors: ["Sample Author"],
                formats: [format],
                lastModified: null,
                seriesIndex: null,
                size: 123456,
                sort: null,
                tags: [],
                timestamp: null,
                title: `${format} Book`,
                uuid: `sample-uuid-${format}`,
                selectedFormat: format,
                rating: null,
                languages: ["en"],
                langNames: { en: "English" },
                formatSizes: { [format]: 123456 },
                cover: undefined,
              },
              path: paths,
              hash: 1,
              pageProgressionDirection: "ltr",
            },
          },
          searchSetting: {
            offset: 0,
            query: "",
            sort: "title",
            sortOrder: "asc",
            totalNum: 1,
            vl: null,
          },
          sortField: [
            { id: "title", name: "Title" },
            { id: "authors", name: "Author" },
          ],
          tagBrowser: [],
          clientSetting: [],
          bookDisplayFields: [],
          fieldMetadataList: {},
          selectedBook: 1,
          virtualLibraries: [],
        },
      },
      selectedLibrary: "library-1",
      readingHistories: [
        {
          libraryId: "library-1",
          bookId: 1,
          format,
          currentPage: 0,
          cachedPath: paths,
        },
      ],
    },
  })
}

// ============================================================
// Wrapper
// ============================================================

type WrapperProps = {
  format: string
  pageCount: number
}

function ImageViewerStoryWrapper({ format, pageCount }: WrapperProps) {
  const { width, height } = useWindowDimensions()
  const paths = createImagePaths(
    Math.max(1, Math.round(width)),
    Math.max(1, Math.round(height)),
    pageCount,
  )
  const rootStore = createImageRootStore(format, paths)

  return (
    <ScreenContainer
      rootStore={rootStore}
      stackScreen={{
        name: "Viewer",
        story: () => <ViewerScreen />,
      }}
    />
  )
}

// ============================================================
// Metadata
// ============================================================

export default {
  title: "Screens/ViewerScreen/ImageBased",
  component: ImageViewerStoryWrapper,
  args: { format: "EPUB", pageCount: 8 },
  argTypes: {
    format: { control: "select", options: IMAGE_BASED_FORMATS.filter((f) => f !== "PDF") },
    pageCount: { control: { type: "number", min: 2, max: 20 } },
  },
  parameters: {
    notes:
      "Image-based formats: the book is converted to JPEG images by Calibre. " +
      "ViewerScreen renders BookViewer + BookPage with SVG mock pages. " +
      "SVG content shows 'Page N / M' for visual verification.",
  },
} as Meta<typeof ImageViewerStoryWrapper>

type Story = StoryObj<typeof ImageViewerStoryWrapper>

// ============================================================
// Stories — one per image-based format
// ============================================================

export const EPUB: Story = {
  args: { format: "EPUB", pageCount: 8 },
  play: async ({ canvasElement }) => {
    await playBasicViewerRenders({ canvasElement, bookTitle: "EPUB Book", pageCount: 8 })
  },
}

export const CBZ: Story = {
  args: { format: "CBZ", pageCount: 8 },
  play: async ({ canvasElement }) => {
    await playBasicViewerRenders({ canvasElement, bookTitle: "CBZ Book", pageCount: 8 })
  },
}

export const CBR: Story = {
  args: { format: "CBR", pageCount: 8 },
  play: async ({ canvasElement }) => {
    await playBasicViewerRenders({ canvasElement, bookTitle: "CBR Book", pageCount: 8 })
  },
}

export const CB7: Story = {
  args: { format: "CB7", pageCount: 8 },
  play: async ({ canvasElement }) => {
    await playBasicViewerRenders({ canvasElement, bookTitle: "CB7 Book", pageCount: 8 })
  },
}

export const CBC: Story = {
  args: { format: "CBC", pageCount: 8 },
  play: async ({ canvasElement }) => {
    await playBasicViewerRenders({ canvasElement, bookTitle: "CBC Book", pageCount: 8 })
  },
}

export const ImageInteractive: Story = {
  args: { format: "EPUB", pageCount: 6 },
  argTypes: {
    format: { control: "select", options: IMAGE_BASED_FORMATS.filter((f) => f !== "PDF") },
    pageCount: { control: { type: "number", min: 2, max: 20 } },
  },
  play: async ({ canvasElement, args }) => {
    await playBasicViewerRenders({
      canvasElement,
      bookTitle: `${args.format} Book`,
      pageCount: args.pageCount,
    })
  },
}
