import { modalConfig } from "@/components/Modals/ModalConfig"
import { RootStoreModel, RootStoreProvider } from "@/models"
import type { RootStore } from "@/models/RootStore"
import type { AppStackParamList } from "@/navigators"
import { getPalette } from "@/theme"
import { config } from "@gluestack-ui/config"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { NavigationContainer } from "@react-navigation/native"
import {
  type NativeStackNavigationOptions,
  createNativeStackNavigator,
} from "@react-navigation/native-stack"
import { type ReactNode, useMemo } from "react"
import { useColorScheme, useWindowDimensions } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ModalProvider, createModalStack } from "react-native-modalfy"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"

type ScreenStoryRenderer = () => ReactNode

export type ScreenContainerStackScreenProps<RouteName extends keyof AppStackParamList = "Connect"> =
  {
    name: RouteName
    initialParams?: AppStackParamList[RouteName]
    options?: NativeStackNavigationOptions
    story?: ScreenStoryRenderer
  }

export type ScreenContainerProps<RouteName extends keyof AppStackParamList = "Connect"> = {
  children?: ReactNode
  rootStore?: RootStore
  stackScreen?: ScreenContainerStackScreenProps<RouteName>
}

const Stack = createNativeStackNavigator<AppStackParamList>()

function createDefaultRootStore() {
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
}

export function ScreenContainer<RouteName extends keyof AppStackParamList = "Connect">(
  props: ScreenContainerProps<RouteName>,
) {
  const colorScheme = useColorScheme()
  const { height } = useWindowDimensions()
  const palette = getPalette(colorScheme === "dark" ? "dark" : "light")
  const modalStack = useMemo(() => createModalStack(modalConfig, {}), [])
  const rootStore = useMemo(() => props.rootStore ?? createDefaultRootStore(), [props.rootStore])
  const story = props.stackScreen?.story ?? (() => props.children ?? null)
  const screenName = props.stackScreen?.name ?? ("Connect" as RouteName)

  return (
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      style={{ backgroundColor: palette.bg0, flex: 1, minHeight: height }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider config={config}>
          <ModalProvider stack={modalStack}>
            <RootStoreProvider value={rootStore}>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name={screenName}
                    initialParams={props.stackScreen?.initialParams}
                    options={props.stackScreen?.options}
                  >
                    {() => <>{story()}</>}
                  </Stack.Screen>
                </Stack.Navigator>
              </NavigationContainer>
            </RootStoreProvider>
          </ModalProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
