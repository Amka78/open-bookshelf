// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { createProxyMiddleware } = require('http-proxy-middleware');
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

/*config.server = {
    enhanceMiddleware: (metroMiddleware, server) => {
        const apiProxy = createProxyMiddleware("/api", {
            target: 'http://192.168.100.50:8080',
            changeOrigin: true,
        });

        return (req, res, next) => {
          const proxy = metroMiddleware(req, res, next)
          return apiProxy(req, res, () => metroMiddleware(req, res, next));
        };
    },
}*/ 

config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"],

module.exports = config