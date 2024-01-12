import { modalConfig } from "@/components/Modals/ModalConfig"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { createModalStack, ModalProvider } from "react-native-modalfy"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { config } from "@gluestack-ui/config"

export type ScreenContainerProps = {
  children: React.ReactNode
}
export function ScreenContainer(props: ScreenContainerProps) {
  const stack = createModalStack(modalConfig, {})
  return (
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      style={{ backgroundColor: "black", flex: 1, height: "100%" }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider config={config}>
          <ModalProvider stack={stack}>{props.children}</ModalProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
