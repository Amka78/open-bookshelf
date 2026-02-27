import type { StorybookConfig } from "@storybook/react-webpack5"
const path = require("path")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

const config: StorybookConfig = {
  typescript: { reactDocgen: "none" },
  stories: [
    "../../app/components/**/*.stories.?(ts|tsx|js|jsx)",
    "../../app/screens/**/*.stories.?(ts|tsx|js|jsx)",
    "../stories/**/*.stories.?(ts|tsx|js|jsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-react-native-web",
    "storybook-dark-mode",
  ],
  webpackFinal(config) {
    config.resolve.modules = [...(config.resolve.modules || []), path.resolve(__dirname, "../src")]

    config.resolve.plugins = [...(config.resolve.plugins || []), new TsconfigPathsPlugin()]

    config.module.rules.push({
      test: /\.[jt]sx?$/,
      include: [
        path.resolve(__dirname, "../../node_modules/@gluestack-ui"),
        path.resolve(__dirname, "../../node_modules/@gluestack-style"),
      ],
      use: {
        loader: require.resolve("babel-loader"),
        options: {
          presets: [require.resolve("babel-preset-expo")],
        },
      },
    })

    return config
  },
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: true,
  },
}

export default config
