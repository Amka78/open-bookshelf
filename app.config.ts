let idSuffix = ""
let appNameSuffix = ""
switch (process.env.APP_VARIANT) {
  case "development":
    idSuffix = "_dev"
    appNameSuffix = "Dev"
    break
  case "storybookDev":
    idSuffix = "_sb_dev"
    appNameSuffix = "SbDev"
    break
  case "preview":
    idSuffix = "_preview"
    appNameSuffix = "Preview"
    break
  case "previewDev":
    idSuffix = "_sb-preview"
    appNameSuffix = "SbPreview"
    break
  default:
    break
}

export default {
  name: "OpenBookShelf",
  displayName: "OpenBookShelf",
  expo: {
    name: `OpenBookShelf${appNameSuffix}`,
    slug: "OpenBookShelf",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/app-icon-all.png",
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
      supportsTablet: true,
      bundleIdentifier: `com.openbookshelf${idSuffix}`,
    },
    web: {
      bundler: "metro",
    },
    plugins: [
      "@config-plugins/react-native-blob-util",
      "@config-plugins/react-native-pdf",
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
            usesCleartextTraffic: true,
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
