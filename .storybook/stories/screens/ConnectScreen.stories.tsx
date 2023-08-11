import { ConnectScreen } from "@/screens/ConnectScreen/templates/ConnectScreen"
import { ComponentMeta } from "@storybook/react-native"
import { NativeBaseProvider } from "native-base"
import React from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

export default {
  component: ConnectScreen,
  decorators: [
    (Story) => (
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        style={{ backgroundColor: "black", flex: 1 }}
      >
        <NativeBaseProvider>
          <Story />
        </NativeBaseProvider>
      </SafeAreaProvider>
    ),
  ],
} as ComponentMeta<typeof ConnectScreen>

export const Basic = {
  args: {},
}
