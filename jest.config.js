const { defaults: tsjPreset } = require("ts-jest/presets")

/** @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
  ...tsjPreset,
  preset: "jest-expo",
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(react-clone-referenced-element|@react-native-community|react-navigation|@react-navigation/.*|@unimodules/.*|native-base|react-native-code-push|pdfjs-dist)",
    "jest-runner",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "/detox", "@react-native"],
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "^wanakana$": "<rootDir>/test/mocks/wanakana.ts",
    "^reactotron-react-native$": "<rootDir>/test/mocks/reactotron-react-native.ts",
  },
  transform: {
    "^.+\\.test.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/test/test-tsconfig.json",
      },
    ],
  },
}
