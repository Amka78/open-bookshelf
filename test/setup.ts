import { afterEach, jest, mock } from "bun:test"
// Test setup for Bun test runner
import { JSDOM } from "jsdom"
import mockFile from "./mockFile"

// Save real react-hook-form before any test-file-level mocks can override it
// (Bun runs all test files in the same process; file-level jest.mock() is global)
import * as _realReactHookForm from "react-hook-form"
;(global as any).__realReactHookForm = _realReactHookForm

const dom = new JSDOM("<!doctype html><html><body></body></html>")
global.window = dom.window as unknown as Window & typeof globalThis
global.document = dom.window.document
global.navigator = {
  userAgent: "bun",
} as Navigator

mock.module("@/models", () => ({
  useStores: jest.fn(),
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
  useIsFocused: jest.fn(() => true),
  useFocusEffect: jest.fn(),
  DefaultTheme: {},
  NavigationContainer: ({ children }: { children: unknown }) => children,
  createNavigationContainerRef: jest.fn(() => ({
    isReady: jest.fn(() => true),
    getRootState: jest.fn(() => ({ routes: [], index: 0 })),
    canGoBack: jest.fn(() => false),
    goBack: jest.fn(),
    navigate: jest.fn(),
    resetRoot: jest.fn(),
    dispatch: jest.fn(),
  })),
}))

mock.module("@/theme", () => ({
  usePalette: jest.fn(),
}))

mock.module("react-native-modalfy", () => ({
  useModal: jest.fn(),
  modalfy: jest.fn(),
  ModalProvider: "ModalProvider",
  createModalStack: jest.fn(),
}))

mock.module("expo-screen-orientation", () => ({
  Orientation: {
    UNKNOWN: 0,
    PORTRAIT_UP: 1,
    PORTRAIT_DOWN: 2,
    LANDSCAPE_LEFT: 3,
    LANDSCAPE_RIGHT: 4,
  },
  addOrientationChangeListener: jest.fn(),
  getOrientationAsync: jest.fn(),
  removeOrientationChangeListener: jest.fn(),
}))

mock.module("expo-sharing", () => ({
  shareAsync: jest.fn(),
}))

// Set global variables
const testGlobal = globalThis as typeof globalThis & { __DEV__: boolean; __TEST__: boolean }
testGlobal.__DEV__ = true
testGlobal.__TEST__ = true
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Set process environment variables
process.env.EXPO_OS = "web"
process.env.NODE_ENV = "test"

afterEach(() => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

// Mock Expo globals
if (!globalThis.expo) {
  globalThis.expo = {
    EventEmitter: class MockEventEmitter {
      addListener = jest.fn()
      removeListener = jest.fn()
      removeAllListeners = jest.fn()
    },
    modules: {
      FileSystem: {
        getInfoAsync: jest.fn(),
        readAsStringAsync: jest.fn(),
        writeAsStringAsync: jest.fn(),
        deleteAsync: jest.fn(),
        moveAsync: jest.fn(),
        copyAsync: jest.fn(),
        makeDirectoryAsync: jest.fn(),
        readDirectoryAsync: jest.fn(),
        downloadAsync: jest.fn(),
        uploadAsync: jest.fn(),
        createDownloadResumable: jest.fn(),
        documentDirectory: "/mock/documents/",
        cacheDirectory: "/mock/cache/",
      },
    },
  } as any
}

// Mock react-native at preload time
mock.module("react-native", () => ({
  View: "div",
  Text: "span",
  ScrollView: "div",
  TextInput: "input",
  Pressable: "button",
  Modal: "div",
  ActivityIndicator: "div",
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
  Image: {
    resolveAssetSource: jest.fn((_source) => mockFile),
    getSize: jest.fn(
      (
        uri: string, // eslint-disable-line @typescript-eslint/no-unused-vars
        success: (width: number, height: number) => void,
        failure?: (_error: Error) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
      ) => success(100, 100),
    ),
  },
  Platform: {
    OS: "web",
    select: (obj: Record<string, unknown>) => obj.default || obj.web,
  },
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Easing: {
    linear: (t: number) => t,
    ease: (t: number) => t,
    quad: (t: number) => t * t,
    cubic: (t: number) => t * t * t,
    poly: (n: number) => (t: number) => Math.pow(t, n),
    sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
    circle: (t: number) => 1 - Math.sqrt(1 - t * t),
    exp: (t: number) => Math.pow(2, 10 * (t - 1)),
    elastic:
      (bounciness = 1) =>
      (t: number) =>
        t,
    back:
      (s = 1.70158) =>
      (t: number) =>
        t * t * ((s + 1) * t - s),
    bounce: (t: number) => t,
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
    in: (easing: (t: number) => number) => easing,
    out: (easing: (t: number) => number) => (t: number) => 1 - easing(1 - t),
    inOut: (easing: (t: number) => number) => (t: number) =>
      t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2,
  },
  Animated: {
    Value: jest.fn().mockImplementation((value) => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
    })),
    createAnimatedComponent: jest.fn((component) => component),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    decay: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(),
    parallel: jest.fn(),
    stagger: jest.fn(),
    loop: jest.fn(),
    View: "Animated.View",
    Text: "Animated.Text",
  },
  Touchable: {
    Mixin: {
      touchableHandlePress: jest.fn(),
      touchableHandleActivePressIn: jest.fn(),
      touchableHandleActivePressOut: jest.fn(),
      touchableHandleLongPress: jest.fn(),
      touchableGetPressRectOffset: jest.fn(() => ({ top: 0, left: 0, right: 0, bottom: 0 })),
    },
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },
  StatusBar: {
    currentHeight: 24,
    setBarStyle: jest.fn(),
    setHidden: jest.fn(),
    setBackgroundColor: jest.fn(),
    setTranslucent: jest.fn(),
  },
  NativeModules: {},
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  findNodeHandle: jest.fn(() => null),
  TurboModuleRegistry: {
    get: jest.fn(() => null),
    getEnforcing: jest.fn(() => ({})),
  },
  AppRegistry: {
    registerComponent: jest.fn(),
  },
  processColor: jest.fn((color: string) => color),
  I18nManager: {
    isRTL: false,
    doLeftAndRightSwapInRTL: true,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    swapLeftAndRightInRTL: jest.fn(),
  },
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
}))

const createMockExpoFileSystemModule = () => {
  class MockDirectory {
    uri: string
    exists = true

    constructor(...uris: Array<string | { uri: string }>) {
      this.uri = uris
        .map((value) => (typeof value === "string" ? value : value.uri))
        .join("")
        .replace(/([^/])$/u, "$1/")
    }

    get parentDirectory() {
      const normalized = this.uri.replace(/\/$/u, "")
      const parentUri = normalized.slice(0, normalized.lastIndexOf("/") + 1)
      return new MockDirectory(parentUri)
    }

    create = jest.fn()
    delete = jest.fn()
    createDirectory = jest.fn((name: string) => new MockDirectory(this, `${name}/`))
  }

  class MockFile {
    static downloadFileAsync = jest.fn()

    uri: string
    exists = false

    constructor(...uris: Array<string | { uri: string }>) {
      this.uri = uris.map((value) => (typeof value === "string" ? value : value.uri)).join("")
    }

    get parentDirectory() {
      const parentUri = this.uri.slice(0, this.uri.lastIndexOf("/") + 1)
      return new MockDirectory(parentUri)
    }

    delete = jest.fn()
  }

  return {
    getInfoAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
    moveAsync: jest.fn(),
    copyAsync: jest.fn(),
    makeDirectoryAsync: jest.fn(),
    readDirectoryAsync: jest.fn(),
    downloadAsync: jest.fn(),
    uploadAsync: jest.fn(),
    createDownloadResumable: jest.fn(),
    FileSystemUploadType: {
      BINARY_CONTENT: 0,
      MULTIPART: 1,
    },
    documentDirectory: "/mock/documents/",
    cacheDirectory: "/mock/cache/",
    Paths: {
      document: { uri: "/mock/documents/" },
      cache: { uri: "/mock/cache/" },
    },
    Directory: MockDirectory,
    File: MockFile,
  }
}

// Mock Expo modules
mock.module("expo-file-system", createMockExpoFileSystemModule)
mock.module("expo-file-system/legacy", createMockExpoFileSystemModule)

mock.module("expo-constants", () => ({
  default: {
    expoConfig: {},
    manifest: {},
    platform: {},
  },
}))

mock.module("react-native-webview", () => ({
  WebView: "WebView",
}))

mock.module("react-native/Libraries/Utilities/codegenNativeComponent", () => ({
  __esModule: true,
  default: () => "MockNativeComponent",
}))

mock.module("@react-native-async-storage/async-storage", () => {
  const mockAsyncStorage = {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  }
  return {
    __esModule: true,
    default: mockAsyncStorage,
    ...mockAsyncStorage,
  }
})

mock.module("i18n-js", () => {
  const mockI18n = {
    currentLocale: jest.fn(() => "en"),
    t: jest.fn((key: string, params?: Record<string, string>) => {
      return params ? `${key} ${JSON.stringify(params)}` : key
    }),
    locale: "en",
    translations: {},
  }
  return {
    __esModule: true,
    default: mockI18n,
    ...mockI18n,
  }
})

mock.module("reactotron-react-native", () => ({}))

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars
