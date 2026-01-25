// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { createProxyMiddleware } = require("http-proxy-middleware");
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

const { server } = config;

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
        });
        return proxy(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

(config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"]),
  (module.exports = config);
