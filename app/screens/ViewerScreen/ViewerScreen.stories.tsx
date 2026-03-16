import { RootStoreModel } from "@/models"
import { ViewerScreen } from "@/screens/ViewerScreen/ViewerScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, type ReactNode } from "react"
import { useWindowDimensions } from "react-native"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

function createSampleImage(width: number, height: number) {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='100%25' height='100%25' fill='%23f0f0f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23555'>Sample Page</text></svg>`
}

function createCachedPath(width: number, height: number) {
  const sampleImage = createSampleImage(width, height)
  return [sampleImage, sampleImage, sampleImage, sampleImage, sampleImage, sampleImage]
}

function createViewerRootStore(cachedPath: string[]) {
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

function ViewerStoryContainer({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions()
  const safeWidth = Math.max(1, Math.round(width))
  const safeHeight = Math.max(1, Math.round(height))

  const rootStore = useMemo(() => {
    return createViewerRootStore(createCachedPath(safeWidth, safeHeight))
  }, [safeWidth, safeHeight])

  return (
    <ScreenContainer
      rootStore={rootStore}
      stackScreen={{
        name: "Viewer",
        story: () => <>{children}</>,
      }}
    />
  )
}

export default {
  component: ViewerScreen,
  title: "Screens/ViewerScreen",
  decorators: [(Story) => <ViewerStoryContainer>{<Story />}</ViewerStoryContainer>],
} as Meta<typeof ViewerScreen>

type Story = StoryObj<typeof ViewerScreen>
export const Basic: Story = {}
