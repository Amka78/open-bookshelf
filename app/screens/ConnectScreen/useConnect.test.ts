import { afterAll, afterEach, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"

const useFormMock = jest.fn()

mock.module("react-hook-form", () => ({
  useForm: () => useFormMock(),
}))

const mockedUseStores = useStores as unknown as jest.Mock
const mockedUseNavigation = useNavigation as unknown as jest.Mock

const { useConnect } = await import("./useConnect.ts")

describe("useConnect", () => {
  const navigate = jest.fn()
  const initialize = jest.fn()
  const setConnectionSetting = jest.fn()
  const mockForm = {
    control: {},
    handleSubmit: jest.fn((handler) => handler),
    formState: {
      isValid: true,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseNavigation.mockReturnValue({ navigate })
    mockedUseStores.mockReturnValue({
      settingStore: {
        api: {
          baseUrl: "http://localhost:8080",
        },
        setConnectionSetting,
      },
      calibreRootStore: {
        initialize,
      },
    })
    useFormMock.mockReturnValue(mockForm)
  })

  afterEach(() => {
    mockedUseStores.mockReset()
    mockedUseNavigation.mockReset()
    useFormMock.mockReset()
  })

  test("returns the saved base URL from settings", () => {
    const result = useConnect()

    expect(result.baseUrl).toBe("http://localhost:8080")
  })

  test("returns an empty base URL when settings do not contain one", () => {
    mockedUseStores.mockReturnValue({
      settingStore: {
        api: {
          baseUrl: "",
        },
        setConnectionSetting,
      },
      calibreRootStore: {
        initialize,
      },
    })

    const result = useConnect()

    expect(result.baseUrl).toBe("")
  })

  test("returns the react-hook-form object", () => {
    const result = useConnect()

    expect(result.form).toEqual(mockForm)
  })

  test("stores the connection setting and navigates to OPDSRoot for OPDS connections", async () => {
    const result = useConnect()

    await result.onConnectPress({ url: "https://catalog.example", isOPDS: true })

    expect(setConnectionSetting).toHaveBeenCalledWith("https://catalog.example", true)
    expect(navigate).toHaveBeenCalledWith("OPDSRoot")
    expect(initialize).not.toHaveBeenCalled()
  })

  test("stores the connection setting and navigates to CalibreRoot when Calibre initialization succeeds", async () => {
    initialize.mockResolvedValue(true)
    const result = useConnect()

    await result.onConnectPress({ url: "https://calibre.example", isOPDS: false })

    expect(setConnectionSetting).toHaveBeenCalledWith("https://calibre.example", false)
    expect(initialize).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith("CalibreRoot")
  })

  test("stores the connection setting and stays on the screen when Calibre initialization fails", async () => {
    initialize.mockResolvedValue(false)
    const result = useConnect()

    await result.onConnectPress({ url: "https://calibre.example", isOPDS: false })

    expect(setConnectionSetting).toHaveBeenCalledWith("https://calibre.example", false)
    expect(initialize).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
  })

  test("initializes Calibre and navigates to CalibreRoot on login", async () => {
    initialize.mockResolvedValue(true)
    const result = useConnect()

    await result.onLoginPress({ userId: "user", password: "pass" })

    expect(initialize).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith("CalibreRoot")
  })
})

afterAll(() => {
  // Restore real react-hook-form so subsequent test files aren't contaminated
  const realRHF = (global as { __realReactHookForm?: Record<string, unknown> }).__realReactHookForm
  if (realRHF) {
    mock.module("react-hook-form", () => realRHF)
  }
})
