import React from "react"
import { View } from "react-native"
import { Button } from "@/components"
import { NativeBaseProvider } from "native-base"

const ButtonMeta = {
  title: "Button",
  component: Button,
  argTypes: {
    onPress: { action: "pressed the button" },
  },
  args: {
    tx: "connectScreen.connect",
  },
  decorators: [
    (Story) => (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        <NativeBaseProvider>
          <Story />
        </NativeBaseProvider>
      </View>
    ),
  ],
}

export default ButtonMeta

export const Basic = {}

export const AnotherExample = {
  args: {
    text: "Another example",
  },
}
