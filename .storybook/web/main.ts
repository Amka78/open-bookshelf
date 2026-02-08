const path = require("path")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
module.exports = {
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
    "storybook-dark-mode"
  ],
  core: {
    builder: "webpack5",
  },
  webpackFinal(config) {
    config.resolve.modules = [...(config.resolve.modules || []), path.resolve(__dirname, "../src")]

    config.resolve.plugins = [...(config.resolve.plugins || []), new TsconfigPathsPlugin()]

    return config
  },
  framework: {
    name: "@storybook/react-webpack5",
    options: { fastRefresh: false },
  },
  docs: {
    autodocs: true,
  },
}
