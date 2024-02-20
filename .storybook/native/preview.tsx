import { View, Appearance } from "react-native"
import { withBackgrounds } from "@storybook/addon-ondevice-backgrounds"
import type { Preview } from "@storybook/react"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"

const preview: Preview = {
  decorators: [(Story) => <Story />, withBackgrounds],
  parameters: {
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    my_param: "anything",
    backgrounds: {
      default: Appearance.getColorScheme() === "dark" ? "dark" : "plain",
      values: [
        {
          name: "plain",
          value: "white",
        },
        {
          name: "dark",
          value: "#333",
        },
        {
          name: "app",
          value: "#eeeeee",
        },
      ],
    },
  },
}

export default preview
