const plugins = [
  [
    "@babel/plugin-proposal-decorators",
    {
      legacy: true,
    },
  ],
  ["babel-plugin-react-compiler"],
  "react-native-reanimated/plugin", // NOTE: this must be last in the plugins
  //["babel-plugin-react-docgen-typescript", { exclude: "node_modules" }],
]

module.exports = (api) => {
  const isWeb = api.env("web")
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {},
    },
    plugins: [...(isWeb ? ["react-refresh/babel"] : []), ...plugins],
  }
}
