import { beforeEach, describe as baseDescribe, expect, jest, mock, test as baseTest } from "bun:test"
import { render } from "@testing-library/react"
import { type ReactNode, forwardRef, useImperativeHandle, useRef } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playFocusTriggersAutoScroll,
  playKeyboardShownHidesCover,
  playKeyboardShownKeepsFieldsVisible,
} from "./bookEditScreenPlay"

const useKeyboardVisibilityMock = jest.fn()
const useConvergenceMock = jest.fn()
const useBookEditMock = jest.fn()
const scrollToEndMock = jest.fn()

mock.module("@/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: () => useKeyboardVisibilityMock(),
}))

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: () => useConvergenceMock(),
}))

mock.module("./useBookEdit", () => ({
  useBookEdit: () => useBookEditMock(),
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
  Button: ({ children }: { children?: ReactNode }) => <button type="button">{children}</button>,
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

  useConvergenceMock.mockReturnValue({ isLarge: false })
  useBookEditMock.mockReturnValue({
    form: { control: {} },
    selectedBook: {},
    selectedLibrary: { fieldMetadataList: new Map(), tagBrowser: [] },
    onSubmit: jest.fn(),
    onUploadFormat: jest.fn(),
    onDeleteFormat: jest.fn(),
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
})
