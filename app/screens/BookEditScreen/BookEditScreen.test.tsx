import {
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { render } from "@testing-library/react"
import { type ReactNode, forwardRef, useImperativeHandle, useRef } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playFocusTriggersAutoScroll,
  playLargeScreenShowsSaveButton,
  playKeyboardShownHidesCover,
  playKeyboardShownKeepsFieldsVisible,
  playPressingSaveTriggersSubmit,
  playSmallScreenHidesSaveButton,
} from "./bookEditScreenStoryPlay"

const useKeyboardVisibilityMock = jest.fn()
const useConvergenceMock = jest.fn()
const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const scrollToEndMock = jest.fn()
const mockUpdate = jest.fn()
const mockSetOptions = jest.fn()
const mockGoBack = jest.fn()

mock.module("react-native", () => ({
  Platform: { OS: "web", select: (obj: Record<string, unknown>) => obj.web ?? obj.default },
  KeyboardAvoidingView: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  TextInput: Object.assign(
    (props: Record<string, unknown>) => <input {...(props as object)} />,
    { State: { currentlyFocusedInput: null } },
  ),
  UIManager: { measureLayout: jest.fn() },
  findNodeHandle: jest.fn().mockReturnValue(null),
}))

mock.module("@/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: () => useKeyboardVisibilityMock(),
}))

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: () => useConvergenceMock(),
}))

mock.module("@/models", () => ({
  useStores: () => useStoresMock(),
}))

mock.module("mobx-state-tree", () => ({
  getSnapshot: (value: unknown) => value,
}))

mock.module("@react-navigation/native", () => ({
  useRoute: jest.fn(),
  useNavigation: () => useNavigationMock(),
}))

mock.module("@/components/RootContainer/RootContainer", () => ({
  RootContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components/VStack/VStack", () => ({
  VStack: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID}>{children}</div>
  ),
}))

mock.module("@/components/ScrollView/ScrollView", () => ({
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

mock.module("@/components/Forms/FormImageUploader", () => ({
  FormImageUploader: () => <div data-testid="book-edit-image-uploader" />,
}))

mock.module("@/components/BookEditFieldList/BookEditFieldList", () => ({
  BookEditFieldList: ({ onTextInputFocus }: { onTextInputFocus?: () => void }) => (
    <div data-testid="book-edit-field-list">
      <input data-testid="book-edit-focus-probe" onFocus={onTextInputFocus} />
    </div>
  ),
}))

mock.module("@/components/Button/Button", () => ({
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

let BookEditScreen: typeof import("./BookEditScreen").BookEditScreen

beforeEach(async () => {
  jest.clearAllMocks()
  scrollToEndMock.mockReset()

  const nav = await import("@react-navigation/native")
  ;(nav.useRoute as unknown as jest.Mock).mockReturnValue({
    params: {
      imageUrl: "https://example.com/cover.jpg",
    },
  })

  useNavigationMock.mockReturnValue({ goBack: mockGoBack, setOptions: mockSetOptions })
  useConvergenceMock.mockReturnValue({ isLarge: false })
  useStoresMock.mockReturnValue({
    calibreRootStore: {
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
