import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import type React from "react"
import { useEffect } from "react"
import { useColorScheme } from "react-native"
import { getPalette } from "@/theme"

import Config from "../config"
import { useStores } from "../models"
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
import { api } from "../services/api"
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

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
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
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={/* colorScheme === "dark" ? DarkTheme : */ appTheme}
      {...props}
    >
      <ModalProvider stack={stack}>
        <AppStack />
      </ModalProvider>
    </NavigationContainer>
  )
})
