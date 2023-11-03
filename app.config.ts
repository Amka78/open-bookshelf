let idSuffix = ""
let appNameSuffix = ""
let sbEnabled = true
switch (process.env.APP_VARIANT) {
  case "development":
    idSuffix = "_dev"
    appNameSuffix = "Dev"
    sbEnabled = false
    break
  case "storybookDev":
    idSuffix = "_sb_dev"
    appNameSuffix = "SbDev"
    break
  case "preview":
    idSuffix = "_preview"
    sbEnabled = false
    break
  case "previewDev":
    idSuffix = "_sb-preview"
  default:
    break
}

export default {
  name: "OpenBookShelf",
  displayName: "OpenBookShelf",
  expo: {
    name: "OpenBookShelf" + appNameSuffix,
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
      //"icon": "./assets/images/app-icon-android-legacy.png",
      package: "com.openbookshelf" + idSuffix,
      /*"adaptiveIcon": {
        "foregroundImage": "./assets/images/app-icon-android-adaptive-foreground.png",
        "backgroundImage": "./assets/images/app-icon-android-adaptive-background.png"
      },*/
      /*"splash": {
        "image": "./assets/images/splash-logo-android-universal.png",
        "resizeMode": "contain",
        "backgroundColor": "#191015"
      }*/
    },
    ios: {
      //"icon": "./assets/images/app-icon-ios.png",
      supportsTablet: true,
      bundleIdentifier: "com.openbookshelf" + idSuffix,
      /*"splash": {
        "image": "./assets/images/splash-logo-ios-mobile.png",
        "tabletImage": "./assets/images/splash-logo-ios-tablet.png",
        "resizeMode": "contain",
        "backgroundColor": "#191015"
      },*/
    },
    web: {
      bundler: "metro",
      //"favicon": "./assets/images/app-icon-web-favicon.png",
      /*"splash": {
        "image": "./assets/images/splash-logo-web.png",
        "resizeMode": "contain",
        "backgroundColor": "#191015"
      }*/
    },
    plugins: [
      "@config-plugins/react-native-blob-util",
      "@config-plugins/react-native-pdf",
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
    ],
    extra: {
      eas: {
        projectId: "53ae3c74-456c-46e1-bc15-f0604a49ea8f",
      },
      storybookEnabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED
    },
  },
}
