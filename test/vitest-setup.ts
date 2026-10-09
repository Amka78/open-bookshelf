import { afterEach, vi } from "vitest"
// Vitest 用 test setup（test/setup.ts の bun:test 版から機械変換）
import mockFile from "./mockFile"

// Save real react-hook-form before any test-file-level mocks can override it.
// IMPORTANT: use Object.assign to snapshot values into a plain object — the `import * as`
// namespace is a live binding that Bun mutates in-place when vi.doMock() replaces the
// module, so the stored value would otherwise reflect the mock instead of the originals.
import * as _realReactHookForm from "react-hook-form"
;(global as { __realReactHookForm?: object }).__realReactHookForm = Object.assign(
  {},
  _realReactHookForm,
)
// Save real mobx so test files that partially mock it can restore it in afterAll.
import * as _realMobxNs from "mobx"
;(global as { __realMobx?: object }).__realMobx = Object.assign({}, _realMobxNs)
// Save real mobx-state-tree so test files that partially mock it can restore it in afterAll.
import * as _realMSTNs from "mobx-state-tree"
;(global as { __realMST?: object }).__realMST = Object.assign({}, _realMSTNs)

vi.doMock("@/models", () => ({
  useStores: vi.fn(),
}))

vi.doMock("@/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.doMock("@react-navigation/native", () => ({
  useNavigation: vi.fn(),
  useRoute: vi.fn(),
  useIsFocused: vi.fn(() => true),
  useFocusEffect: vi.fn(),
  DefaultTheme: {},
  NavigationContainer: ({ children }: { children: unknown }) => children,
  createNavigationContainerRef: vi.fn(() => ({
    isReady: vi.fn(() => true),
    getRootState: vi.fn(() => ({ routes: [], index: 0 })),
    canGoBack: vi.fn(() => false),
    goBack: vi.fn(),
    navigate: vi.fn(),
    resetRoot: vi.fn(),
    dispatch: vi.fn(),
  })),
}))

vi.doMock("@/theme", () => ({
  usePalette: vi.fn(),
}))

vi.doMock("react-native-modalfy", () => ({
  useModal: vi.fn(),
  modalfy: vi.fn(),
  ModalProvider: "ModalProvider",
  createModalStack: vi.fn(),
}))

vi.doMock("expo-screen-orientation", () => ({
  Orientation: {
    UNKNOWN: 0,
    PORTRAIT_UP: 1,
    PORTRAIT_DOWN: 2,
    LANDSCAPE_LEFT: 3,
    LANDSCAPE_RIGHT: 4,
  },
  addOrientationChangeListener: vi.fn(),
  getOrientationAsync: vi.fn(),
  removeOrientationChangeListener: vi.fn(),
}))

vi.doMock("expo-sharing", () => ({
  shareAsync: vi.fn(),
}))

vi.doMock("expo-document-picker", () => ({
  getDocumentAsync: vi.fn().mockResolvedValue({ canceled: true, assets: [] }),
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
  // vi.restoreAllMocks() は呼ばない。Vitest の mockRestore() は vi.fn() の実装も消して
  // undefined を返す関数にするため、テストが module レベルで定義した
  // `vi.fn().mockResolvedValue(...)` が2件目以降で壊れる（bun の jest.restoreAllMocks() は
  // spyOn 由来の spy のみを復元するので同じコードが動いていた）。
  vi.clearAllMocks()
})

// Mock Expo globals
if (!globalThis.expo) {
  globalThis.expo = {
    EventEmitter: class MockEventEmitter {
      addListener = vi.fn()
      removeListener = vi.fn()
      removeAllListeners = vi.fn()
    },
    modules: {
      FileSystem: {
        getInfoAsync: vi.fn(),
        readAsStringAsync: vi.fn(),
        writeAsStringAsync: vi.fn(),
        deleteAsync: vi.fn(),
        moveAsync: vi.fn(),
        copyAsync: vi.fn(),
        makeDirectoryAsync: vi.fn(),
        readDirectoryAsync: vi.fn(),
        downloadAsync: vi.fn(),
        uploadAsync: vi.fn(),
        createDownloadResumable: vi.fn(),
        documentDirectory: "/mock/documents/",
        cacheDirectory: "/mock/cache/",
      },
    },
  } as unknown
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
    dismiss: vi.fn(),
    addListener: vi.fn(() => ({ remove: vi.fn() })),
    removeListener: vi.fn(),
  },
  Image: {
    resolveAssetSource: vi.fn((_source) => mockFile),
    getSize: vi.fn(
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
    get: vi.fn(() => ({ width: 375, height: 667 })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  DeviceEventEmitter: {
    addListener: vi.fn(() => ({ remove: vi.fn() })),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    removeSubscription: vi.fn(),
  },
  useWindowDimensions: vi.fn(() => ({ width: 375, height: 667, scale: 1, fontScale: 1 })),
  useColorScheme: vi.fn(() => "light"),
  Easing: {
    linear: (t: number) => t,
    ease: (t: number) => t,
    quad: (t: number) => t * t,
    cubic: (t: number) => t * t * t,
    poly: (n: number) => (t: number) => t ** n,
    sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
    circle: (t: number) => 1 - Math.sqrt(1 - t * t),
    exp: (t: number) => 2 ** (10 * (t - 1)),
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
    Value: vi.fn().mockImplementation((value) => ({
      setValue: vi.fn(),
      interpolate: vi.fn(),
    })),
    createAnimatedComponent: vi.fn((component) => component),
    timing: vi.fn(() => ({ start: vi.fn() })),
    spring: vi.fn(() => ({ start: vi.fn() })),
    decay: vi.fn(() => ({ start: vi.fn() })),
    sequence: vi.fn(),
    parallel: vi.fn(),
    stagger: vi.fn(),
    loop: vi.fn(),
    View: "Animated.View",
    Text: "Animated.Text",
  },
  Touchable: {
    Mixin: {
      touchableHandlePress: vi.fn(),
      touchableHandleActivePressIn: vi.fn(),
      touchableHandleActivePressOut: vi.fn(),
      touchableHandleLongPress: vi.fn(),
      touchableGetPressRectOffset: vi.fn(() => ({ top: 0, left: 0, right: 0, bottom: 0 })),
    },
  },
  BackHandler: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    removeEventListener: vi.fn(),
    exitApp: vi.fn(),
  },
  StatusBar: {
    currentHeight: 24,
    setBarStyle: vi.fn(),
    setHidden: vi.fn(),
    setBackgroundColor: vi.fn(),
    setTranslucent: vi.fn(),
  },
  NativeModules: {},
  NativeEventEmitter: vi.fn().mockImplementation(() => ({
    addListener: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
  })),
  findNodeHandle: vi.fn(() => null),
  Linking: {
    openURL: vi.fn(),
    canOpenURL: vi.fn(() => Promise.resolve(true)),
    getInitialURL: vi.fn(() => Promise.resolve(null)),
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    removeEventListener: vi.fn(),
  },
  Alert: {
    alert: vi.fn(),
  },
  UIManager: {
    measureLayout: vi.fn(),
    setLayoutAnimationEnabledExperimental: vi.fn(),
    getViewManagerConfig: vi.fn(),
  },
  TurboModuleRegistry: {
    get: vi.fn(() => null),
    getEnforcing: vi.fn(() => ({})),
  },
  AppRegistry: {
    registerComponent: vi.fn(),
  },
  processColor: vi.fn((color: string) => color),
  I18nManager: {
    isRTL: false,
    doLeftAndRightSwapInRTL: true,
    allowRTL: vi.fn(),
    forceRTL: vi.fn(),
    swapLeftAndRightInRTL: vi.fn(),
  },
  PanResponder: {
    create: vi.fn(() => ({
      panHandlers: {},
    })),
  },
  Share: {
    share: vi.fn().mockResolvedValue({ action: "sharedAction" }),
  },
})
vi.doMock("react-native", reactNativeMockFactory)
vi.doMock(
  "/home/amka78/private/open-bookshelf/node_modules/react-native/index.js",
  reactNativeMockFactory,
)
Object.defineProperty(global, "__reactNativeMock", {
  configurable: true,
  get: () => reactNativeMockFactory(),
  set: () => {},
})

// Base mock for @/components — covers all exports used across test files.
// Test files that need custom behaviour should spread this via global.__componentsMock.
const componentsMockFactory = () => ({
  Box: "div",
  BookDetailMenu: "div",
  BookPage: "div",
  BookViewer: "div",
  Button: "button",
  FlatList: ({
    data,
    renderItem,
  }: {
    data?: unknown[]
    renderItem?: (arg: { item: unknown; index: number }) => unknown
  }) => (data ?? []).map((item: unknown, i: number) => renderItem?.({ item, index: i })),
  FormCheckbox: "input",
  FormInputField: "input",
  Heading: "h1",
  HStack: "div",
  IconButton: "button",
  Image: "img",
  Input: "div",
  LabeledSpinner: "div",
  ListItem: ({
    LeftComponent,
    children,
  }: {
    LeftComponent?: unknown
    children?: unknown
  }) => LeftComponent ?? children ?? null,
  MaterialCommunityIcon: "span",
  RootContainer: "div",
  ScrollView: "div",
  Text: "span",
  VStack: "div",
})
vi.doMock("@/components", componentsMockFactory)
vi.doMock("/home/amka78/private/open-bookshelf/app/components/index.ts", componentsMockFactory)
Object.defineProperty(global, "__componentsMock", {
  configurable: true,
  get: () => componentsMockFactory(),
  set: () => {},
})

// Base mock for @react-navigation/native — covers all hooks used across test files.
const navMockFactory = () => ({
  useNavigation: vi.fn(),
  useRoute: vi.fn(() => ({ params: {} })),
  useIsFocused: vi.fn(() => true),
  useFocusEffect: vi.fn(),
  NavigationContainer: "div",
  createNavigationContainerRef: vi.fn(() => ({ current: null })),
})
vi.doMock("@react-navigation/native", navMockFactory)
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

    create = vi.fn()
    delete = vi.fn()
    createDirectory = vi.fn((name: string) => new MockDirectory(this, `${name}/`))
  }

  class MockFile {
    static downloadFileAsync = vi.fn()

    uri: string
    exists = false

    constructor(...uris: Array<string | { uri: string }>) {
      this.uri = uris.map((value) => (typeof value === "string" ? value : value.uri)).join("")
    }

    get parentDirectory() {
      const parentUri = this.uri.slice(0, this.uri.lastIndexOf("/") + 1)
      return new MockDirectory(parentUri)
    }

    delete = vi.fn()
  }

  return {
    getInfoAsync: vi.fn(),
    readAsStringAsync: vi.fn(),
    writeAsStringAsync: vi.fn(),
    deleteAsync: vi.fn(),
    moveAsync: vi.fn(),
    copyAsync: vi.fn(),
    makeDirectoryAsync: vi.fn(),
    readDirectoryAsync: vi.fn(),
    downloadAsync: vi.fn(),
    uploadAsync: vi.fn(),
    createDownloadResumable: vi.fn(),
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
vi.doMock("expo-file-system", createMockExpoFileSystemModule)
vi.doMock("expo-file-system/legacy", createMockExpoFileSystemModule)

vi.doMock("expo-constants", () => ({
  default: {
    expoConfig: {},
    manifest: {},
    platform: {},
  },
}))

vi.doMock("react-native-webview", () => ({
  WebView: "WebView",
}))

vi.doMock("react-native/Libraries/Utilities/codegenNativeComponent", () => ({
  __esModule: true,
  default: () => "MockNativeComponent",
}))

vi.doMock("@react-native-async-storage/async-storage", () => {
  const mockAsyncStorage = {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
    getAllKeys: vi.fn(() => Promise.resolve([])),
    multiGet: vi.fn(() => Promise.resolve([])),
    multiSet: vi.fn(() => Promise.resolve()),
    multiRemove: vi.fn(() => Promise.resolve()),
  }
  return {
    __esModule: true,
    default: mockAsyncStorage,
    ...mockAsyncStorage,
  }
})

vi.doMock("i18n-js", () => {
  const mockI18n = {
    currentLocale: vi.fn(() => "en"),
    t: vi.fn((key: string, params?: Record<string, string>) => {
      return params ? `${key} ${JSON.stringify(params)}` : key
    }),
    locale: "en",
    translations: {},
  }
  class I18n {
    locale = "en"
    enableFallback = true
    translations: Record<string, unknown> = {}
    t = vi.fn((key: string) => key)
    currentLocale = vi.fn(() => "en")
  }
  return {
    __esModule: true,
    default: mockI18n,
    I18n,
    ...mockI18n,
  }
})

vi.doMock("reactotron-react-native", () => ({}))

vi.doMock("@gluestack-ui/themed", () => {
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
    styled: vi.fn((component: unknown) => component),
    useBreakpointValue: vi.fn(),
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
  styled: vi.fn((component: unknown) => component),
  useBreakpointValue: vi.fn(),
}

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars
