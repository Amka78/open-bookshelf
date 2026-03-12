import { RootStoreModel } from "@/models"
import { ViewerScreen } from "@/screens/ViewerScreen/ViewerScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

const sampleImage =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1200'><rect width='100%25' height='100%25' fill='%23f0f0f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23555'>Sample Page</text></svg>"

const cachedPath = [sampleImage, sampleImage, sampleImage, sampleImage, sampleImage, sampleImage]

function createViewerRootStore() {
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
                formats: ["EPUB"],
                lastModified: null,
                seriesIndex: null,
                size: 123456,
                sort: null,
                tags: [],
                timestamp: null,
                title: "Sample Book",
                uuid: "sample-uuid",
                selectedFormat: "EPUB",
                rating: null,
                languages: ["en"],
                langNames: {
                  en: "English",
                },
                formatSizes: {
                  EPUB: 123456,
                },
                cover: undefined,
              },
              path: cachedPath,
              hash: 1,
              pageProgressionDirection: "ltr",
            },
          },
          searchSetting: null,
          sortField: [],
          tagBrowser: [],
          clientSetting: [],
          bookDisplayFields: [],
          fieldMetadataList: {},
          selectedBook: 1,
        },
      },
      selectedLibrary: "library-1",
      readingHistories: [
        {
          libraryId: "library-1",
          bookId: 1,
          format: "EPUB",
          currentPage: 0,
          cachedPath,
        },
      ],
    },
  })
}

export default {
  component: ViewerScreen,
  title: "Screens/ViewerScreen",
  decorators: [
    (Story) => (
      <ScreenContainer
        rootStore={createViewerRootStore()}
        stackScreen={{
          name: "Viewer",
          story: () => <Story />,
        }}
      />
    ),
  ],
} as Meta<typeof ViewerScreen>

type Story = StoryObj<typeof ViewerScreen>
export const Basic: Story = {}
