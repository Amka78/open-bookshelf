import { RootStoreModel } from "@/models"
import { ViewerScreen } from "@/screens/ViewerScreen/ViewerScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { HTML_VIEWER_FORMATS, TEXT_FORMATS } from "../../components/BookViewer/bookViewerStoryData"

// ============================================================
// Helpers
// ============================================================

/**
 * Generate mock XHTML spine paths for HTML-based formats.
 * ViewerScreen detects these via isCalibreSerializedHtmlPath
 * and renders TextBookViewer (the real HTML rendering pipeline).
 */
function createHtmlSpinePaths(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `spine-${String(i).padStart(3, "0")}.xhtml`)
}

/**
 * Build a RootStore for HTML-based formats.
 * book.path contains .xhtml spine paths → usesTextBookViewer = true
 * → ViewerScreen renders TextBookViewer.
 *
 * spineItemLengths provides per-spine content length estimates
 * needed by the pagination engine. In the real app these are
 * populated from the Calibre manifest after conversion.
 */
function createHtmlRootStore(format: string, spineCount: number) {
  const spinePaths = createHtmlSpinePaths(spineCount)
  const spineItemLengths = Array.from({ length: spineCount }, () => 50000)

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
              path: spinePaths,
              spineItemLengths,
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
          cachedPath: [],
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
  spineCount: number
}

function HtmlViewerStoryWrapper({ format, spineCount }: WrapperProps) {
  const rootStore = createHtmlRootStore(format, spineCount)

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
  title: "Screens/ViewerScreen/HtmlBased",
  component: HtmlViewerStoryWrapper,
  args: { format: "AZW3", spineCount: 4 },
  argTypes: {
    format: { control: "select", options: [...HTML_VIEWER_FORMATS, ...TEXT_FORMATS] },
    spineCount: { control: { type: "number", min: 1, max: 20 } },
  },
  parameters: {
    notes:
      "HTML-based formats: book.path contains .xhtml spine entries → " +
      "ViewerScreen renders TextBookViewer. Each spine loads its HTML " +
      "from the Calibre API (simulated here; renders loading state). " +
      "Full inline HTML content rendering is demonstrated by " +
      "TextBookSpine.stories.tsx which passes sourceHtml directly.",
  },
} as Meta<typeof HtmlViewerStoryWrapper>

type Story = StoryObj<typeof HtmlViewerStoryWrapper>

// ============================================================
// Stories — one per HTML-based format
// ============================================================

export const AZW3: Story = {
  args: { format: "AZW3", spineCount: 4 },
}

export const KF8: Story = {
  args: { format: "KF8", spineCount: 4 },
}

export const MOBI: Story = {
  args: { format: "MOBI", spineCount: 4 },
}

export const FB2: Story = {
  args: { format: "FB2", spineCount: 4 },
}

export const RTF: Story = {
  args: { format: "RTF", spineCount: 4 },
}

export const DOCX: Story = {
  args: { format: "DOCX", spineCount: 4 },
}

export const TXT: Story = {
  args: { format: "TXT", spineCount: 4 },
}

export const HTML: Story = {
  args: { format: "HTML", spineCount: 4 },
}

export const HTMLZ: Story = {
  args: { format: "HTMLZ", spineCount: 4 },
}

export const HtmlInteractive: Story = {
  args: { format: "AZW3", spineCount: 4 },
  argTypes: {
    format: { control: "select", options: [...HTML_VIEWER_FORMATS, ...TEXT_FORMATS] },
    spineCount: { control: { type: "number", min: 1, max: 20 } },
  },
}
