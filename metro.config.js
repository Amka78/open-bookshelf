// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")
const { createProxyMiddleware } = require("http-proxy-middleware")
const path = require("path")

const axiosBrowserEntry = path.resolve(__dirname, "node_modules/axios/dist/browser/axios.cjs")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
})

const { server } = config

config.server = {
  ...server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // '/calibre-api' で始まるリクエストをプロキシする
      if (req.url.startsWith("/test-url")) {
        const proxy = createProxyMiddleware({
          target: "http://192.168.1.11:8081",
          changeOrigin: true,
          pathRewrite: { "^/test-url": "" },
        })
        return proxy(req, res, next)
      }
      return middleware(req, res, next)
    }
  },
}

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

module.exports = config
