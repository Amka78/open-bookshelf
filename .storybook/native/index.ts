import { Platform } from "react-native"

// web モードでは Storybook を初期化しない（setImmediate が存在しないため）
// getStorybookUI() はモジュールトップレベルで呼ぶと setImmediate を要求するため、
// ネイティブモードでのみ遅延実行する
let StorybookUIRoot: (() => React.ReactElement) | null = null

if (Platform.OS !== "web") {
  const { view } = require("./storybook.requires")
  const AsyncStorage = require("@react-native-async-storage/async-storage").default

  StorybookUIRoot = view.getStorybookUI({
    shouldPersistSelection: true,
    storage: {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
    },
    enableWebsockets: true,
  })
}

export default StorybookUIRoot
