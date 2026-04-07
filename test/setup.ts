import { afterEach, jest, mock } from "bun:test"
// Test setup for Bun test runner
import { JSDOM } from "jsdom"
import mockFile from "./mockFile"

// Save real react-hook-form before any test-file-level mocks can override it.
// IMPORTANT: use Object.assign to snapshot values into a plain object — the `import * as`
// namespace is a live binding that Bun mutates in-place when mock.module() replaces the
// module, so the stored value would otherwise reflect the mock instead of the originals.
import * as _realReactHookForm from "react-hook-form"
;(global as any).__realReactHookForm = Object.assign({}, _realReactHookForm)
// Save real mobx so test files that partially mock it can restore it in afterAll.
import * as _realMobxNs from "mobx"
;(global as any).__realMobx = Object.assign({}, _realMobxNs)
// Save real mobx-state-tree so test files that partially mock it can restore it in afterAll.
import * as _realMSTNs from "mobx-state-tree"
;(global as any).__realMST = Object.assign({}, _realMSTNs)

const dom = new JSDOM("<!doctype html><html><body></body></html>")
global.window = dom.window as unknown as Window & typeof globalThis
global.document = dom.window.document
global.navigator = {
  userAgent: "bun",
} as Navigator

mock.module("@/models", () => ({
  useStores: jest.fn(),
}))

mock.module("@/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
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

mock.module("expo-document-picker", () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
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
  // Reset rendered DOM to prevent element accumulation across tests and files.
  // This replaces @testing-library/react's cleanup() which can't be imported here
  // because @testing-library/dom evaluates document.body at module init time (before
  // our JSDOM setup runs), making screen queries permanently broken if imported early.
  if (typeof document !== "undefined" && document.body) {
    document.body.innerHTML = ""
  }
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
const reactNativeMockFactory = () => ({
  View: "div",
  Text: "span",
  ScrollView: "div",
  KeyboardAvoidingView: "div",
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
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 667, scale: 1, fontScale: 1 })),
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
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Share: {
    share: jest.fn(() => Promise.resolve({ action: "sharedAction" })),
  },
  UIManager: {
    measureLayout: jest.fn(),
    setLayoutAnimationEnabledExperimental: jest.fn(),
    getViewManagerConfig: jest.fn(),
  },
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
  Share: {
    share: jest.fn().mockResolvedValue({ action: "sharedAction" }),
  },
})
mock.module("react-native", reactNativeMockFactory)
;(global as { __reactNativeMock?: ReturnType<typeof reactNativeMockFactory> }).__reactNativeMock =
  reactNativeMockFactory()

// Base mock for @/components — covers all exports used across test files.
// Test files that need custom behaviour should spread this via global.__componentsMock.
const componentsMockFactory = () => ({
  Box: "div",
  BookPage: "div",
  BookViewer: "div",
  Button: "button",
  FlatList: ({ data, renderItem }: any) =>
    (data ?? []).map((item: unknown, i: number) => renderItem({ item, index: i })),
  FormCheckbox: "input",
  FormInputField: "input",
  Heading: "h1",
  HStack: "div",
  IconButton: "button",
  Image: "img",
  Input: "div",
  ListItem: ({ LeftComponent, children }: any) => LeftComponent ?? children ?? null,
  MaterialCommunityIcon: "span",
  RootContainer: "div",
  ScrollView: "div",
  Text: "span",
  VStack: "div",
})
mock.module("@/components", componentsMockFactory)
;(global as { __componentsMock?: ReturnType<typeof componentsMockFactory> }).__componentsMock =
  componentsMockFactory()

// Base mock for @react-navigation/native — covers all hooks used across test files.
const navMockFactory = () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(() => ({ params: {} })),
  useIsFocused: jest.fn(() => true),
  useFocusEffect: jest.fn(),
  NavigationContainer: "div",
  createNavigationContainerRef: jest.fn(() => ({ current: null })),
})
mock.module("@react-navigation/native", navMockFactory)
;(global as { __navMock?: ReturnType<typeof navMockFactory> }).__navMock = navMockFactory()

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
  class I18n {
    locale = "en"
    enableFallback = true
    translations: Record<string, unknown> = {}
    t = jest.fn((key: string) => key)
    currentLocale = jest.fn(() => "en")
  }
  return {
    __esModule: true,
    default: mockI18n,
    I18n,
    ...mockI18n,
  }
})

mock.module("reactotron-react-native", () => ({}))

mock.module("@gluestack-ui/themed", () => {
  const noop = () => null
  return {
    Box: "div",
    HStack: "div",
    VStack: "div",
    View: "div",
    Text: "span",
    Heading: "h1",
    ScrollView: "div",
    Pressable: "button",
    Input: "div",
    InputField: "input",
    Button: "button",
    ButtonText: "span",
    ButtonSpinner: "span",
    Center: "div",
    Spinner: "div",
    Switch: "input",
    Slider: "div",
    SliderTrack: "div",
    SliderFilledTrack: "div",
    SliderThumb: "div",
    Menu: "div",
    MenuItem: "div",
    MenuItemLabel: "span",
    Modal: "div",
    ModalContent: "div",
    ModalHeader: "div",
    ModalBody: "div",
    ModalFooter: "div",
    ModalCloseButton: "button",
    Tooltip: "div",
    TooltipContent: "div",
    TooltipText: "span",
    Image: "img",
    GluestackUIProvider: ({ children }: { children: unknown }) => children,
    ChevronDownIcon: "span",
    styled: jest.fn((component: unknown) => component),
    useBreakpointValue: jest.fn(),
  }
})
// Store base gluestack mock for test files that need to extend it without losing exports.
;(global as { __gluestackMock?: Record<string, unknown> }).__gluestackMock = {
  Box: "div",
  HStack: "div",
  VStack: "div",
  View: "div",
  Text: "span",
  Heading: "h1",
  ScrollView: "div",
  Pressable: "button",
  Input: "div",
  InputField: "input",
  Button: "button",
  ButtonText: "span",
  ButtonSpinner: "span",
  Center: "div",
  Spinner: "div",
  Switch: "input",
  Slider: "div",
  SliderTrack: "div",
  SliderFilledTrack: "div",
  SliderThumb: "div",
  Menu: "div",
  MenuItem: "div",
  MenuItemLabel: "span",
  Modal: "div",
  ModalContent: "div",
  ModalHeader: "div",
  ModalBody: "div",
  ModalFooter: "div",
  ModalCloseButton: "button",
  Tooltip: "div",
  TooltipContent: "div",
  TooltipText: "span",
  Image: "img",
  GluestackUIProvider: ({ children }: { children: unknown }) => children,
  ChevronDownIcon: "span",
  styled: jest.fn((component: unknown) => component),
  useBreakpointValue: jest.fn(),
}

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars
