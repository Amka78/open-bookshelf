// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")
const fs = require("fs")
const path = require("path")

// USE_EXPO_GO=true のとき、通常の解決パスに対して隣接する .expo.{ext} ファイルを
// 優先的に使用する。expo-dev-client に依存するネイティブモジュールを
// Expo Go 互換の実装に差し替えるために利用する。
const USE_EXPO_GO = process.env.USE_EXPO_GO === "true"

const axiosBrowserEntry = path.resolve(__dirname, "node_modules/axios/dist/browser/axios.cjs")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
})

config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"]
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  axios: axiosBrowserEntry,
}

const defaultResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "axios" ||
    moduleName === "axios/dist/node/axios.cjs" ||
    moduleName === "axios/dist/node/axios"
  ) {
    return {
      type: "sourceFile",
      filePath: axiosBrowserEntry,
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform)
  }

  return context.resolveRequest(context, moduleName, platform)
}

// pdfjs-dist は npm から削除し、CDN 経由でロードするため特別な設定は不要

// USE_EXPO_GO=true のとき .expo.{ext} バリアントを優先して解決する
if (USE_EXPO_GO) {
  const prevResolveRequest = config.resolver.resolveRequest
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // まず通常の解決を試みる
    let resolved
    try {
      resolved = prevResolveRequest
        ? prevResolveRequest(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform)
    } catch (err) {
      throw err
    }

    // sourceFile に解決された場合のみ .expo. バリアントを探す
    if (resolved && resolved.type === "sourceFile") {
      const resolvedPath = resolved.filePath
      const ext = path.extname(resolvedPath)
      const base = resolvedPath.slice(0, -ext.length)
      // 既に .expo. バリアント自身でなければ確認する（無限ループ防止）
      if (!base.endsWith(".expo")) {
        const expoVariant = `${base}.expo${ext}`
        if (fs.existsSync(expoVariant)) {
          return { type: "sourceFile", filePath: expoVariant }
        }
      }
    }

    return resolved
  }
}

module.exports = config
