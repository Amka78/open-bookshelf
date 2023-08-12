import { modalConfig } from "@/components/Modals/ModalConfig"
import { ConnectScreen } from "@/screens/ConnectScreen/templates/ConnectScreen"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
import { NativeBaseProvider } from "native-base"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { createModalStack, ModalProvider } from "react-native-modalfy"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

const stack = createModalStack(modalConfig, {})
export default {
  component: ConnectScreen,
  decorators: [
    (Story) => (
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ backgroundColor: "black", flex: 1 }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NativeBaseProvider>
            <ModalProvider stack={stack}>
              <Story />
            </ModalProvider>
          </NativeBaseProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    ),
  ],
} as ComponentMeta<typeof ConnectScreen>
type ConnectScreenStory = ComponentStoryObj<typeof ConnectScreen>
export const Basic: ConnectScreenStory = {
  args: {
    onConnectPress: () => {
      throw new Error("test")
    },
  },
}
