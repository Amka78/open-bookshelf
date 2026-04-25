let idSuffix = ""
let appNameSuffix = ""
switch (process.env.APP_VARIANT) {
  case "development":
    idSuffix = ".dev"
    appNameSuffix = "Dev"
    break
  case "storybookDev":
    idSuffix = ".sbdev"
    appNameSuffix = "SbDev"
    break
  case "preview":
    idSuffix = ".preview"
    appNameSuffix = "Preview"
    break
  case "previewDev":
    idSuffix = ".sbpreview"
    appNameSuffix = "SbPreview"
    break
  default:
    break
}

const isPreviewVariant = process.env.APP_VARIANT === "preview"

export default {
  name: "OpenBookShelf",
  displayName: "OpenBookShelf",
  expo: {
    name: `OpenBookShelf${appNameSuffix}`,
    slug: "OpenBookShelf",
    version: "0.0.1",
    orientation: "default",
    icon: "./assets/images/app-icon.png",
    experiments: {
      tsconfigPaths: true,
    },
    splash: {
      image: "./assets/images/splash-logo-all.png",
      resizeMode: "contain",
      backgroundColor: "#191015",
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/53ae3c74-456c-46e1-bc15-f0604a49ea8f",
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    jsEngine: "hermes",
    assetBundlePatterns: ["**/*"],
    android: {
      package: `com.openbookshelf${idSuffix}`,
    },
    ios: {
      icon: "./assets/images/app-icon.png",
      supportsTablet: true,
      bundleIdentifier: `com.openbookshelf${idSuffix}`,
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/app-icon-web.png",
      output: "single",
      publicPath: process.env.GITHUB_PAGES === "true" ? "/open-bookshelf/" : "/",
    },
    plugins: [
      "@config-plugins/react-native-blob-util",
      "@config-plugins/react-native-pdf",
      "@react-native-community/datetimepicker",
      [
        "expo-font",
        {
          fonts: [
            "./node_modules/@expo-google-fonts/noto-serif-jp/NotoSerifJP_400Regular.ttf",
            "./node_modules/@expo-google-fonts/noto-serif-jp/NotoSerifJP_700Bold.ttf",
            "./node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_400Regular.ttf",
            "./node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_700Bold.ttf",
          ],
        },
      ],
      "expo-localization",
      "./withAndroidMainActivityAttributes.js",
      [
        "expo-screen-orientation",
        {
          initialOrientation: "DEFAULT",
        },
      ],
      [
        "expo-updates",
        {
          username: "account-username",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            newArchEnabled: true,
            usesCleartextTraffic: true,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            enableBundleCompression: true,
            ...(isPreviewVariant
              ? {
                  buildArchs: ["arm64-v8a"],
                }
              : {}),
          },
          ios: {
            newArchEnabled: true,
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.The app accesses your photos to let you share them with your friends.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "53ae3c74-456c-46e1-bc15-f0604a49ea8f",
      },
    },
  },
}
