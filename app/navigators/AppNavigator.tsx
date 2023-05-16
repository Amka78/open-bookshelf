import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useColorScheme } from "react-native"

import Config from "../config"
import { useStores } from "../models"
import { Link } from "../models/opds"
import {
  AcquisitionScreen,
  CalibreRootScreen,
  ConnectScreen,
  OPDSRootScreen,
  LibraryScreen,
} from "../screens"
import { api } from "../services/api"
import { DemoTabParamList } from "./DemoNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { convertAbsoluteToRem } from "native-base/lib/typescript/theme/tools"

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
  Demo: NavigatorScreenParams<DemoTabParamList>
  OPDSRoot: undefined
  CalibreRoot: undefined
  Library: undefined
  Acquisition: {
    link: Link
  }
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = StackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()
export type ApppNavigationProp = NativeStackNavigationProp<AppStackParamList>
const AppStack = observer(function AppStack() {
  const { settingStore } = useStores()
  useEffect(() => {
    console.log("called useEffect")
    if (settingStore.api.baseUrl) {
      api.setUrl(settingStore.api.baseUrl)
    }
  }, [])

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName={"Connect"}>
      <Stack.Screen name="OPDSRoot" component={OPDSRootScreen} />
      <Stack.Screen name="Connect" component={ConnectScreen} />
      <Stack.Screen name="Acquisition" component={AcquisitionScreen} />
      <Stack.Screen name="CalibreRoot" component={CalibreRootScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
    </Stack.Navigator>
  )
})

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
})
