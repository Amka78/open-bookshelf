import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { useStores } from "@/models"
import { useNavigation, useRoute } from "@react-navigation/native"
import { renderHook } from "@testing-library/react"
import { useModal } from "react-native-modalfy"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const mockUseConvergence = jest.fn()
const mockUseDeleteBook = jest.fn()
const mockUseDownloadBook = jest.fn()
const mockUseOpenViewer = jest.fn()

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: mockUseConvergence,
}))

mock.module("../../hooks/useDeleteBook", () => ({
  useDeleteBook: mockUseDeleteBook,
}))

mock.module("../../hooks/useDownloadBook", () => ({
  useDownloadBook: mockUseDownloadBook,
}))

mock.module("../../hooks/useOpenViewer", () => ({
  useOpenViewer: mockUseOpenViewer,
}))

let useBookDetail: typeof import("./useBookDetail").useBookDetail

beforeAll(async () => {
  ;({ useBookDetail } = await import("./useBookDetail"))
})

describe("useBookDetail", () => {
  const mockNavigate = jest.fn()
  const mockGoBack = jest.fn()
  const mockSetOptions = jest.fn()
  const mockOnLinkPress = jest.fn()
  const mockExecute = jest.fn()
  const mockOpenModal = jest.fn()
  const mockModal = { openModal: mockOpenModal } as Record<string, unknown>

  const mockSelectedBook = {
    id: 1,
    metaData: {
      title: "Test Book",
      setProp: jest.fn(),
    },
  }

  const mockFieldMetadataList = {}
  const mockBookDisplayFields = ["title", "authors"]

  const mockSelectedLibrary = {
    selectedBook: mockSelectedBook,
    fieldMetadataList: mockFieldMetadataList,
    bookDisplayFields: mockBookDisplayFields,
  }

  const mockCalibreRootStore = {
    selectedLibrary: mockSelectedLibrary,
  }

  const mockRoute = {
    params: {
      imageUrl: "https://example.com/image.jpg",
      onLinkPress: mockOnLinkPress,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: mockCalibreRootStore,
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
      setOptions: mockSetOptions,
    })
    ;(useRoute as jest.Mock).mockReturnValue(mockRoute)
    ;(useModal as jest.Mock).mockReturnValue(mockModal)
    mockUseConvergence.mockReturnValue({
      isLarge: false,
    })
    mockUseOpenViewer.mockReturnValue({
      execute: mockExecute,
    })
    mockUseDeleteBook.mockReturnValue({
      execute: mockExecute,
    })
    mockUseDownloadBook.mockReturnValue({
      execute: mockExecute,
    })
  })

  test("should return hook successfully", () => {
    const { result } = renderHook(() => useBookDetail())

    expect(result.current).toBeDefined()
  })

  test("should have book detail methods", () => {
    const { result } = renderHook(() => useBookDetail())

    expect(result.current.handleOpenBook).toBeDefined()
    expect(result.current.handleDownloadBook).toBeDefined()
    expect(result.current.handleDeleteBook).toBeDefined()
    expect(result.current.handleEditBook).toBeDefined()
    expect(result.current.handleConvertBook).toBeDefined()
  })

  test("should set header title on mount", () => {
    renderHook(() => useBookDetail())

    expect(mockSetOptions).toHaveBeenCalled()
  })

  test("handleEditBook should navigate", () => {
    const { result } = renderHook(() => useBookDetail())

    result.current.handleEditBook()

    expect(mockNavigate).toHaveBeenCalled()
  })

  describe("handleConvertBook", () => {
    test("On small screens (isLarge=false), navigate to the BookConvert screen", () => {
      mockUseConvergence.mockReturnValue({ isLarge: false })

      const { result } = renderHook(() => useBookDetail())

      result.current.handleConvertBook()

      expect(mockNavigate).toHaveBeenCalledWith("BookConvert", {
        imageUrl: "https://example.com/image.jpg",
      })
      expect(mockOpenModal).not.toHaveBeenCalled()
    })

    test("On large screens (isLarge=true), open the BookConvertModal", () => {
      mockUseConvergence.mockReturnValue({ isLarge: true })

      const { result } = renderHook(() => useBookDetail())

      result.current.handleConvertBook()

      expect(mockOpenModal).toHaveBeenCalledWith("BookConvertModal", {
        imageUrl: "https://example.com/image.jpg",
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
