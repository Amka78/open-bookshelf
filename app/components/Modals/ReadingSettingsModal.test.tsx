import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("/home/amka78/private/open-bookshelf/app/models/index.ts", () => ({
  useStores: useStoresMock,
}))

mock.module("@/components/Button/Button", () => ({
  Button: ({
    children,
    tx,
    onPress,
    isDisabled,
  }: {
    children?: ReactNode
    tx?: string
    onPress?: () => void
    isDisabled?: boolean
  }) => (
    <button data-testid={tx} disabled={isDisabled} type="button" onClick={onPress}>
      {children ?? tx}
    </button>
  ),
}))

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ children, tx }: { children?: ReactNode; tx?: string }) => <div>{children ?? tx}</div>,
}))

mock.module("@/components/IconButton/IconButton", () => ({
  IconButton: ({ onPress, testID }: { onPress?: () => void; testID?: string }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      icon
    </button>
  ),
}))

mock.module("@/components/Input/Input", () => ({
  Input: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("@/components/Text/Text", () => ({
  Text: ({ children, tx }: { children?: ReactNode; tx?: string }) => <div>{children ?? tx}</div>,
}))

mock.module("@/theme", () => ({
  usePalette: () => ({
    textPrimary: "#111",
    textSecondary: "#666",
    borderSubtle: "#ddd",
    surfaceStrong: "#eee",
  }),
}))

mock.module("@gluestack-ui/themed", () => ({
  HStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Pressable: ({
    children,
    onPress,
    testID,
  }: {
    children?: ReactNode
    onPress?: () => void
    testID?: string
  }) => (
    <button data-testid={testID} type="button" onClick={onPress}>
      {children}
    </button>
  ),
  InputField: ({
    value,
    onChangeText,
    testID,
  }: {
    value?: string
    onChangeText?: (value: string) => void
    testID?: string
  }) => (
    <input
      data-testid={testID}
      value={value}
      onChange={(event) => onChangeText?.((event.target as HTMLInputElement).value)}
    />
  ),
}))

mock.module("./Body", () => ({
  Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      close
    </button>
  ),
}))

mock.module("./Header", () => ({
  Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./ModalFooter", () => ({
  Footer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./Root", () => ({
  Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let ReadingSettingsModal: typeof import("./ReadingSettingsModal").ReadingSettingsModal

beforeAll(async () => {
  ;({ ReadingSettingsModal } = await import("./ReadingSettingsModal"))
})

describe("ReadingSettingsModal", () => {
  const setViewerFontSizePt = jest.fn()
  const setViewerTheme = jest.fn()
  const closeModal = jest.fn()
  const onAutoPageTurnIntervalChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useStoresMock.mockReturnValue({
      settingStore: {
        viewerFontSizePt: 16,
        viewerTheme: "default",
        setViewerFontSizePt,
        setViewerTheme,
      },
    })
  })

  test("saves the automatic page turning interval from reading settings", () => {
    const { getByTestId } = render(
      <ReadingSettingsModal
        modal={
          {
            closeModal,
            params: {
              autoPageTurnIntervalMs: 3000,
              onAutoPageTurnIntervalChange,
            },
          } as never
        }
      />,
    )

    fireEvent.change(getByTestId("reading-settings-auto-page-interval"), {
      target: { value: "4200" },
    })
    fireEvent.click(getByTestId("common.ok"))

    expect(onAutoPageTurnIntervalChange).toHaveBeenCalledWith(4200)
    expect(closeModal).toHaveBeenCalledTimes(1)
  })
})
