const path = require("path")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
module.exports = {
  typescript: { reactDocgen: "none" },
  stories: ["../stories/**/*.stories.?(ts|tsx|js|jsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-react-native-web",
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
    name: path.resolve(require.resolve("@storybook/react-webpack5/preset"), "..") as any,
    options: { fastRefresh: true },
  },
}
