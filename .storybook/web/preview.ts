import type { Preview } from "@storybook/react"
import { themes } from "@storybook/theming"

const preview: Preview = {
  background: {
    disabled: true,
  },
  parameters: {
    darkMode: {
      // Override the default dark theme
      dark: { ...themes.dark, appBg: "black", appPreviewBg: "black" },
      // Override the default light theme
      light: { ...themes.normal, appBg: "white", appPreviewBg: "white" },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
