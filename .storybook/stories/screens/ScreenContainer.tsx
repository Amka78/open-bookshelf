import { modalConfig } from "@/components/Modals/ModalConfig"
import { NativeBaseProvider } from "native-base"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { createModalStack, ModalProvider } from "react-native-modalfy"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

export type ScreenContainerProps = {
  children: React.ReactNode
}
export function ScreenContainer(props: ScreenContainerProps) {
  const stack = createModalStack(modalConfig, {})
  return (
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      style={{ backgroundColor: "black", flex: 1 }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NativeBaseProvider>
          <ModalProvider stack={stack}>{props.children}</ModalProvider>
        </NativeBaseProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
