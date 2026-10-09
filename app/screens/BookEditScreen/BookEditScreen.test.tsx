import { vi, afterAll, describe as baseDescribe, test as baseTest, beforeEach, expect } from "vitest"
import { render } from "@testing-library/react"
import { type ReactNode, forwardRef, useImperativeHandle, useRef } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playFocusTriggersAutoScroll,
  playKeyboardShownHidesCover,
  playKeyboardShownKeepsFieldsVisible,
  playLargeScreenShowsSaveButton,
  playPressingSaveTriggersSubmit,
  playSmallScreenHidesSaveButton,
} from "./bookEditScreenStoryPlay"

const useKeyboardVisibilityMock = vi.fn()
const useConvergenceMock = vi.fn()
const useStoresMock = vi.fn()
const useNavigationMock = vi.fn()
const useRouteMock = vi.fn()
const scrollToEndMock = vi.fn()
const scrollToMock = vi.fn()
const mockUpdate = vi.fn()
const mockSetOptions = vi.fn()
const mockGoBack = vi.fn()
const mockBumpBookThumbnailRevision = vi.fn()
const measureLayoutMock = vi.fn()
const findNodeHandleMock = vi.fn()
const currentlyFocusedInputMock = vi.fn()
let platformOS: "android" | "web" = "web"

vi.doMock("react-native", () => ({
  ...(global as { __reactNativeMock?: Record<string, unknown> }).__reactNativeMock,
  Platform: {
    get OS() {
      return platformOS
    },
    select: (obj: Record<string, unknown>) => obj[platformOS] ?? obj.default,
  },
  KeyboardAvoidingView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  TextInput: Object.assign((props: Record<string, unknown>) => <input {...(props as object)} />, {
    State: { currentlyFocusedInput: currentlyFocusedInputMock },
  }),
  UIManager: { measureLayout: measureLayoutMock },
  findNodeHandle: findNodeHandleMock,
}))

vi.doMock("@/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: () => useKeyboardVisibilityMock(),
}))

vi.doMock("@/hooks/useConvergence", () => ({
  useConvergence: () => useConvergenceMock(),
}))

vi.doMock("@/models", () => ({
  useStores: useStoresMock,
}))

vi.doMock("mobx-state-tree", () => ({
  getSnapshot: (value: unknown) => value,
}))

afterAll(() => {
  vi.doMock(
    "mobx-state-tree",
    () => (global as { __realMST?: Record<string, unknown> }).__realMST ?? {},
  )
})

vi.doMock("@react-navigation/native", () => ({
  ...(global as { __navMock?: Record<string, unknown> }).__navMock,
  useRoute: useRouteMock,
  useNavigation: useNavigationMock,
}))

vi.doMock("@/components/RootContainer/RootContainer", () => ({
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

vi.doMock("@/components/VStack/VStack", () => ({
  VStack: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID}>{children}</div>
  ),
}))

vi.doMock("@/components/ScrollView/ScrollView", () => ({
  ScrollView: forwardRef(function MockScrollView(
    {
      children,
      testID,
      contentContainerStyle,
    }: {
      children?: ReactNode
      testID?: string
      contentContainerStyle?: { paddingBottom?: number }
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement | null>(null)

    useImperativeHandle(ref, () => ({
      scrollTo: (options?: { y?: number; animated?: boolean }) => {
        scrollToMock(options)
        const current = rootRef.current
        if (!current) return

        current.setAttribute("data-scroll-y", String(options?.y ?? 0))
      },
      scrollToEnd: () => {
        scrollToEndMock()
        const current = rootRef.current
        if (!current) return

        const previous = Number(current.getAttribute("data-scroll-end-calls") ?? "0")
        current.setAttribute("data-scroll-end-calls", String(previous + 1))
      },
    }))

    return (
      <div
        ref={rootRef}
        data-testid={testID}
        data-padding-bottom={contentContainerStyle?.paddingBottom ?? 0}
        data-scroll-end-calls="0"
      >
        {children}
      </div>
    )
  }),
}))

vi.doMock("@/components/Forms/FormImageUploader", () => ({
  FormImageUploader: () => <div data-testid="book-edit-image-uploader" />,
}))

vi.doMock("@/components/BookEditFieldList/BookEditFieldList", () => ({
  BookEditFieldList: ({
    onTextInputFocus,
  }: {
    onTextInputFocus?: (getContainerHandle?: () => number | null) => void
  }) => (
    <div data-testid="book-edit-field-list">
      <input data-testid="book-edit-focus-probe" onFocus={() => onTextInputFocus?.(() => 321)} />
    </div>
  ),
}))

vi.doMock("@/components/Button/Button", () => ({
  Button: ({
    children,
    tx,
    onPress,
  }: { children?: ReactNode; tx?: string; onPress?: () => void }) => (
    <button onClick={onPress} type="button">
      {tx === "bookEditScreen.save" ? "Save" : children}
    </button>
  ),
}))

vi.doMock("@/theme", () => ({
  usePalette: vi.fn(() => ({ textPrimary: "#111318" })),
}))

let BookEditScreen: typeof import("./BookEditScreen").BookEditScreen

beforeEach(async () => {
  vi.clearAllMocks()
  scrollToEndMock.mockReset()
  scrollToMock.mockReset()
  measureLayoutMock.mockReset()
  findNodeHandleMock.mockReset().mockReturnValue(999)
  currentlyFocusedInputMock.mockReset().mockReturnValue(null)
  platformOS = "web"

  useRouteMock.mockReturnValue({
    params: {
      imageUrl: "https://example.com/cover.jpg",
    },
  })

  useNavigationMock.mockReturnValue({ goBack: mockGoBack, setOptions: mockSetOptions })
  useConvergenceMock.mockReturnValue({ isLarge: false })
  useStoresMock.mockReturnValue({
    calibreRootStore: {
      bumpBookThumbnailRevision: mockBumpBookThumbnailRevision,
      selectedLibrary: {
        id: "lib1",
        selectedBook: {
          id: 1,
          metaData: {
            title: "Edited Book",
            authors: ["Author 1"],
            languages: ["English"],
            langNames: {
              en: "English",
            },
          },
          update: mockUpdate,
        },
        fieldMetadataList: new Map(),
        tagBrowser: [],
      },
    },
  })
  ;({ BookEditScreen } = await import("./BookEditScreen"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("BookEditScreen keyboard handling", () => {
  test("hides cover image area while keyboard is visible", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 280,
    })

    const { container } = render(<BookEditScreen />)

    await playKeyboardShownHidesCover({
      canvasElement: container,
    })
  })

  test("keeps input fields visible with keyboard bottom spacing", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 280,
    })

    const { container } = render(<BookEditScreen />)

    await playKeyboardShownKeepsFieldsVisible({
      canvasElement: container,
    })
  })

  test("auto scrolls when a text input receives focus", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 280,
    })

    const { container } = render(<BookEditScreen />)

    await playFocusTriggersAutoScroll({
      canvasElement: container,
    })

    expect(scrollToEndMock).toHaveBeenCalled()
  })

  test("keeps suggestion space above a focused field while the keyboard is visible on native", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 280,
    })
    platformOS = "android"
    measureLayoutMock.mockImplementation(
      (
        _containerHandle: number,
        _scrollNode: number,
        _onFail: () => void,
        onSuccess: (_x: number, y: number) => void,
      ) => {
        onSuccess(0, 300)
      },
    )

    const { container } = render(<BookEditScreen />)
    const input = container.querySelector(
      `[data-testid="book-edit-focus-probe"]`,
    ) as HTMLInputElement | null

    if (!input) {
      throw new Error("Focus probe input was not found.")
    }

    input.focus()
    await new Promise((resolve) => setTimeout(resolve, 120))

    expect(scrollToMock).toHaveBeenCalledWith({
      y: 80,
      animated: true,
    })
  })

  test("shows the save button on large screens", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    })
    useConvergenceMock.mockReturnValue({ isLarge: true })

    const { container } = render(<BookEditScreen />)

    await playLargeScreenShowsSaveButton({
      canvasElement: container,
    })
  })

  test("hides the save button on small screens", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    })
    useConvergenceMock.mockReturnValue({ isLarge: false })

    const { container } = render(<BookEditScreen />)

    await playSmallScreenHidesSaveButton({
      canvasElement: container,
    })
  })

  test("pressing the save button on large screens triggers submit", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    })
    useConvergenceMock.mockReturnValue({ isLarge: true })

    const { container } = render(<BookEditScreen />)

    await playPressingSaveTriggersSubmit({
      canvasElement: container,
    })

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })

  test("sets save button in header on small screens", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    })
    useConvergenceMock.mockReturnValue({ isLarge: false })

    render(<BookEditScreen />)

    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1]
    expect(lastCall).toBeDefined()
    expect(lastCall[0].headerRight).toBeDefined()
  })

  test("pressing the header save button on small screens triggers submit", async () => {
    useKeyboardVisibilityMock.mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    })
    useConvergenceMock.mockReturnValue({ isLarge: false })

    render(<BookEditScreen />)

    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1]
    const HeaderRight = lastCall[0].headerRight as () => JSX.Element
    expect(HeaderRight).toBeDefined()

    const { container } = render(<HeaderRight />)
    await playPressingSaveTriggersSubmit({ canvasElement: container })

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })
})
