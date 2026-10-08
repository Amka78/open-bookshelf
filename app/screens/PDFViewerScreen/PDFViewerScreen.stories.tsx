import { RootStoreModel } from "@/models"
import { PDFViewerScreen } from "@/screens/PDFViewerScreen/PDFViewerScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { createMockImagePage } from "../../components/BookViewer/bookViewerStoryData"

// ============================================================
// Mock store
// ============================================================

/**
 * Build a RootStore snapshot for a PDF-formatted book.
 * The cachedPath contains a single SVG data URI (PDF renders as
 * one "page" that the real PDF pipeline would split internally).
 */
function createPDFViewerRootStore() {
  const mockSvg = createMockImagePage(0, 1)

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
                formats: ["PDF"],
                lastModified: null,
                seriesIndex: null,
                size: 123456,
                sort: null,
                tags: [],
                timestamp: null,
                title: "PDF Document",
                uuid: "sample-uuid-pdf",
                selectedFormat: "PDF",
                rating: null,
                languages: ["en"],
                langNames: { en: "English" },
                formatSizes: { PDF: 123456 },
                cover: undefined,
              },
              path: [mockSvg],
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
          format: "PDF",
          currentPage: 0,
          cachedPath: [mockSvg],
        },
      ],
    },
  })
}

// ============================================================
// Story wrapper
// ============================================================

function PDFViewerStoryWrapper() {
  const rootStore = createPDFViewerRootStore()

  return (
    <ScreenContainer
      rootStore={rootStore}
      stackScreen={{
        name: "PDFViewer",
        story: () => <PDFViewerScreen />,
      }}
    />
  )
}

// ============================================================
// Storybook metadata
// ============================================================

export default {
  title: "Screens/PDFViewerScreen",
  component: PDFViewerStoryWrapper,
  parameters: {
    notes:
      "Renders the PDFViewerScreen with a mock PDF book in the store. " +
      "On web the component uses react-pdf internally; in this story the PDF " +
      "file URL points at the API endpoint (no real PDF is served), so the " +
      "viewer shows its initial state. This is useful for visual regression " +
      "testing of the PDF viewer chrome.",
  },
} as Meta<typeof PDFViewerStoryWrapper>

type Story = StoryObj<typeof PDFViewerStoryWrapper>

export const Basic: Story = {}
