import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Platform, useColorScheme } from "react-native"
import { getPalette } from "@/theme"

import Config from "../config"
import { useStores } from "../models"
import { ReadingHistoryModel } from "../models/calibre"
import { api } from "../services/api"
import type { Link } from "../models/opds"
import {
  AcquisitionScreen,
  CalibreRootScreen,
  ConnectScreen,
  LibraryScreen,
  OPDSRootScreen,
  ViewerScreen,
  BookDetailScreen,
  BookEditScreen,
} from "../screens"
import { PDFViewerScreen } from "../screens/PDFViewerScreen/PDFViewerScreen"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { ModalProvider, createModalStack } from "react-native-modalfy"
import { modalConfig } from "@/components/Modals/ModalConfig"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Welcome: undefined
  Connect: undefined
  OPDSRoot: undefined
  CalibreRoot: undefined
  Library: undefined
  Acquisition: {
    link: Link
  }
  Viewer: undefined
  PDFViewer: undefined
  BookDetail: {
    imageUrl: string
    onLinkPress: (query) => void
  }
  BookEdit: {
    imageUrl: string
  }
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()
export type ApppNavigationProp = NativeStackNavigationProp<AppStackParamList>
const AppStack = observer(function AppStack() {
  const { authenticationStore, settingStore } = useStores()
  const colorScheme = useColorScheme()
  const palette = getPalette(colorScheme === "dark" ? "dark" : "light")
  useEffect(() => {
    if (settingStore.api.baseUrl) {
      api.setUrl(settingStore.api.baseUrl)
    }

    if (authenticationStore.isAuthenticated) {
      api.setAuthorization(authenticationStore.token)
    }
  }, [])

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: palette.surfaceStrong },
        headerTintColor: palette.textPrimary,
        headerTitleStyle: { color: palette.textPrimary },
        headerShadowVisible: false,
      }}
      initialRouteName={"Connect"}
    >
      <Stack.Screen name="Connect" component={ConnectScreen} />
      <Stack.Screen name="OPDSRoot" component={OPDSRootScreen} />
      <Stack.Screen name="Acquisition" component={AcquisitionScreen} />
      <Stack.Screen name="CalibreRoot" component={CalibreRootScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen
        name="Viewer"
        component={ViewerScreen}
        options={{ statusBarHidden: true, headerShown: false }}
      />
      <Stack.Screen
        name="PDFViewer"
        component={PDFViewerScreen}
        options={{ statusBarHidden: true, headerShown: false }}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="BookEdit" component={BookEditScreen} />
    </Stack.Navigator>
  )
})

type NavigationProps = Partial<React.ComponentProps<typeof NavigationContainer>>

type ViewerRoute = "Viewer" | "PDFViewer"

type ViewerTabInfo = {
  route: ViewerRoute
  bookId?: number
  libraryId?: string
  format?: string
}

const getViewerTabInfo = (): ViewerTabInfo | null => {
  if (Platform.OS !== "web" || typeof globalThis === "undefined") {
    return null
  }

  const location = (globalThis as { location?: Location }).location
  if (!location?.search) {
    return null
  }

  const params = new URLSearchParams(location.search)
  const rawRoute = params.get("viewerTab")
  const rawBookId = params.get("viewerBookId")
  const bookId = rawBookId ? Number(rawBookId) : undefined
  const libraryId = params.get("viewerLibraryId") ?? undefined
  const format = params.get("viewerFormat") ?? undefined

  if (!rawBookId && !libraryId && !format && !rawRoute) {
    return null
  }

  const route = rawRoute === "Viewer" || rawRoute === "PDFViewer"
    ? rawRoute
    : format === "PDF"
      ? "PDFViewer"
      : "Viewer"

  return {
    route,
    bookId: Number.isNaN(bookId) ? undefined : bookId,
    libraryId,
    format,
  }
}

const clearViewerTabRoute = () => {
  if (Platform.OS !== "web" || typeof globalThis === "undefined") {
    return
  }

  const location = (globalThis as { location?: Location }).location
  if (!location?.href) {
    return
  }

  const url = new URL(location.href)
  if (
    !url.searchParams.has("viewerTab") &&
    !url.searchParams.has("viewerBookId") &&
    !url.searchParams.has("viewerLibraryId") &&
    !url.searchParams.has("viewerFormat")
  ) {
    return
  }

  url.searchParams.delete("viewerTab")
  url.searchParams.delete("viewerBookId")
  url.searchParams.delete("viewerLibraryId")
  url.searchParams.delete("viewerFormat")
  globalThis.history?.replaceState({}, "", url.toString())
}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const [pendingViewerInfo, setPendingViewerInfo] = useState<ViewerTabInfo | null>(null)
  const handlingViewerInfoRef = useRef(false)
  const colorScheme = useColorScheme()
  const palette = getPalette(colorScheme === "dark" ? "dark" : "light")
  const appTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: palette.bg0,
      card: palette.surfaceStrong,
      text: palette.textPrimary,
      border: palette.borderSubtle,
      primary: palette.textPrimary,
      notification: palette.accent,
    },
  }

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  const stack = createModalStack(modalConfig, {})

  useEffect(() => {
    if (!pendingViewerInfo || handlingViewerInfoRef.current) {
      return
    }

    let cancelled = false
    handlingViewerInfoRef.current = true

    const resolveViewerInfo = async () => {
      try {
        if (settingStore.api.baseUrl) {
          api.setUrl(settingStore.api.baseUrl)
        }

        if (authenticationStore.isAuthenticated && authenticationStore.token) {
          api.setAuthorization(authenticationStore.token)
        }

        if (!calibreRootStore.libraryMap.size) {
          await calibreRootStore.initialize()
        }

        if (
          pendingViewerInfo.libraryId &&
          calibreRootStore.selectedLibrary?.id !== pendingViewerInfo.libraryId
        ) {
          if (calibreRootStore.libraryMap.has(pendingViewerInfo.libraryId)) {
            calibreRootStore.setLibrary(pendingViewerInfo.libraryId)
          }
        }

        const selectedLibrary = calibreRootStore.selectedLibrary
        if (!selectedLibrary) {
          return
        }

        if (pendingViewerInfo.bookId) {
          const bookIdKey = String(pendingViewerInfo.bookId)
          if (!selectedLibrary.books?.has(bookIdKey)) {
            await calibreRootStore.searchLibrary()
          }

          if (!selectedLibrary.books?.has(bookIdKey) && selectedLibrary.searchSetting) {
            selectedLibrary.searchSetting.setProp("query", `id:=${pendingViewerInfo.bookId}`)
            await calibreRootStore.searchLibrary()
          }

          if (selectedLibrary.books?.has(bookIdKey)) {
            selectedLibrary.setBook(pendingViewerInfo.bookId)
          }
        }

        const selectedBook = selectedLibrary.selectedBook
        if (!selectedBook) {
          return
        }

        const format =
          pendingViewerInfo.format ??
          (selectedBook.metaData?.formats?.length ? selectedBook.metaData.formats[0] : undefined)

        if (format && selectedBook.metaData) {
          selectedBook.metaData.setProp("selectedFormat", format)
        }

        if (pendingViewerInfo.route === "PDFViewer" || format === "PDF") {
          if (!cancelled) {
            navigationRef.navigate("PDFViewer" as never)
            clearViewerTabRoute()
            setPendingViewerInfo(null)
          }
          return
        }

        if (format) {
          const history = selectedLibrary.readingHistory.find((value) => {
            return (
              value.libraryId === selectedLibrary.id &&
              value.bookId === selectedBook.id &&
              value.format === format
            )
          })

          if (!history) {
            await selectedBook.convert(format, selectedLibrary.id, async () => {
              const bookImageList = []
              selectedBook.path.map((value) => {
                const imageUrl = encodeURI(
                  `${settingStore.api.baseUrl}/book-file/${selectedBook.id}/${selectedBook.metaData.selectedFormat}/${selectedBook.metaData.size}/${selectedBook.hash}/${value}?library_id=${selectedLibrary.id}`,
                )
                bookImageList.push(imageUrl)
              })
              const historyModel = ReadingHistoryModel.create({
                bookId: selectedBook.id,
                currentPage: 0,
                libraryId: selectedLibrary.id,
                cachedPath: bookImageList,
                format: format,
              })
              selectedLibrary.addReadingHistory(historyModel)
            })
          }
        }

        if (!cancelled) {
          navigationRef.navigate("Viewer" as never)
          clearViewerTabRoute()
          setPendingViewerInfo(null)
        }
      } finally {
        if (!cancelled) {
          handlingViewerInfoRef.current = false
        }
      }
    }

    resolveViewerInfo()

    return () => {
      cancelled = true
    }
  }, [
    authenticationStore.isAuthenticated,
    authenticationStore.token,
    calibreRootStore,
    pendingViewerInfo,
    settingStore.api.baseUrl,
  ])

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={/* colorScheme === "dark" ? DarkTheme : */ appTheme}
      onReady={() => {
        const viewerInfo = getViewerTabInfo()
        if (viewerInfo && navigationRef.isReady()) {
          setPendingViewerInfo(viewerInfo)
        }
      }}
      {...props}
    >
      <ModalProvider stack={stack}>
        <AppStack />
      </ModalProvider>
    </NavigationContainer>
  )
})
