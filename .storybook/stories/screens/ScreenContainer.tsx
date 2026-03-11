import { modalConfig } from "@/components/Modals/ModalConfig"
import { RootStoreModel, RootStoreProvider } from "@/models"
import { getPalette } from "@/theme"
import { config } from "@gluestack-ui/config"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { NavigationContext } from "@react-navigation/native"
import { useColorScheme, useWindowDimensions } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ModalProvider, createModalStack } from "react-native-modalfy"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"

export type ScreenContainerProps = {
  children: React.ReactNode
}
const rootStore = RootStoreModel.create({
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
            path: [],
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
    readingHistories: [],
  },
})
// NavigationContainer を使わず useNavigation / useIsFocused を満たすモック
const mockNavigation = {
  navigate: () => {},
  goBack: () => {},
  setOptions: () => {},
  setParams: () => {},
  dispatch: () => {},
  reset: () => {},
  isFocused: () => true,
  canGoBack: () => false,
  getId: () => undefined,
  getParent: () => undefined,
  getState: () => ({
    key: "stack",
    index: 0,
    routes: [],
    stale: false as const,
    type: "stack" as const,
  }),
  addListener: () => () => {},
  removeListener: () => {},
} as unknown as React.ContextType<typeof NavigationContext>
export function ScreenContainer(props: ScreenContainerProps) {
  const colorScheme = useColorScheme()
  const { height } = useWindowDimensions()
  const palette = getPalette(colorScheme === "dark" ? "dark" : "light")
  const stack = createModalStack(modalConfig, {})
  return (
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      style={{ backgroundColor: palette.bg0, flex: 1, minHeight: height }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider config={config}>
          <ModalProvider stack={stack}>
            <NavigationContext.Provider value={mockNavigation}>
              <RootStoreProvider value={rootStore}>{props.children}</RootStoreProvider>
            </NavigationContext.Provider>
          </ModalProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
