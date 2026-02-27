import { useStores } from "@/models"
import { useNavigation, useRoute } from "@react-navigation/native"
import { renderHook } from "@testing-library/react"
import { useModal } from "react-native-modalfy"
import { useConvergence } from "@/hooks/useConvergence"
import { useDeleteBook } from "../../hooks/useDeleteBook"
import { useDownloadBook } from "../../hooks/useDownloadBook"
import { useOpenViewer } from "../../hooks/useOpenViewer"
import { useBookDetail } from "./useBookDetail"

// Mock all dependencies
jest.mock("@/models")
jest.mock("@react-navigation/native")
jest.mock("react-native-modalfy")
jest.mock("@/hooks/useConvergence")
jest.mock("../../hooks/useDeleteBook")
jest.mock("../../hooks/useDownloadBook")
jest.mock("../../hooks/useOpenViewer")

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
    ;(useConvergence as jest.Mock).mockReturnValue({
      isLarge: false,
    })
    ;(useOpenViewer as jest.Mock).mockReturnValue({
      execute: mockExecute,
    })
    ;(useDeleteBook as jest.Mock).mockReturnValue({
      execute: mockExecute,
    })
    ;(useDownloadBook as jest.Mock).mockReturnValue({
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
    test("小画面(isLarge=false)では BookConvert スクリーンに遷移すること", () => {
      ;(useConvergence as jest.Mock).mockReturnValue({ isLarge: false })

      const { result } = renderHook(() => useBookDetail())

      result.current.handleConvertBook()

      expect(mockNavigate).toHaveBeenCalledWith("BookConvert", {
        imageUrl: "https://example.com/image.jpg",
      })
      expect(mockOpenModal).not.toHaveBeenCalled()
    })

    test("大画面(isLarge=true)では BookConvertModal が開かれること", () => {
      ;(useConvergence as jest.Mock).mockReturnValue({ isLarge: true })

      const { result } = renderHook(() => useBookDetail())

      result.current.handleConvertBook()

      expect(mockOpenModal).toHaveBeenCalledWith("BookConvertModal", {
        imageUrl: "https://example.com/image.jpg",
      })
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
