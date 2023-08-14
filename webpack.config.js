const createExpoWebpackConfigAsync = require("@expo/webpack-config")

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)

  // If you want to add a new alias to the config.
  config.resolve.plugins = [...(config.resolve.plugins || []), new TsconfigPathsPlugin()]

  // Maybe you want to turn off compression in dev mode.
  if (config.mode === "development") {
    config.devServer.compress = false
  }

  // Or prevent minimizing the bundle when you build.
  // if (config.mode === "production") {
  //   config.optimization.minimize = false
  // }

  // Finally return the new config for the CLI to use.
  return config
}
