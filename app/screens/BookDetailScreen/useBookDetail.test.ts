import { renderHook } from "@testing-library/react-hooks"
import { useBookDetail } from "./useBookDetail"
import { useStores } from "@/models"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useModal } from "react-native-modalfy"
import { useDeleteBook } from "../../hooks/useDeleteBook"
import { useDownloadBook } from "../../hooks/useDownloadBook"
import { useOpenViewer } from "../../hooks/useOpenViewer"

// Mock all dependencies
jest.mock("@/models")
jest.mock("@react-navigation/native")
jest.mock("react-native-modalfy")
jest.mock("./useDeleteBook")
jest.mock("./useDownloadBook")
jest.mock("./useOpenViewer")

describe("useBookDetail", () => {
  const mockNavigate = jest.fn()
  const mockGoBack = jest.fn()
  const mockSetOptions = jest.fn()
  const mockOnLinkPress = jest.fn()
  const mockExecute = jest.fn()
  const mockModal = {} as any

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

  test("should return correct initial values", () => {
    const { result } = renderHook(() => useBookDetail())

    expect(result.current.selectedLibrary).toBe(mockSelectedLibrary)
    expect(result.current.selectedBook).toBe(mockSelectedBook)
    expect(result.current.imageUrl).toBe("https://example.com/image.jpg")
  })

  test("should set header title on mount", () => {
    renderHook(() => useBookDetail())

    expect(mockSetOptions).toHaveBeenCalledWith({
      headerTitle: "Test Book",
    })
  })

  test("handleOpenBook should call openViewerHook.execute", async () => {
    const { result } = renderHook(() => useBookDetail())

    await result.current.handleOpenBook()

    expect(mockExecute).toHaveBeenCalledWith(mockModal)
  })

  test("handleDownloadBook should call downloadBookHook.execute", async () => {
    const { result } = renderHook(() => useBookDetail())

    await result.current.handleDownloadBook()

    expect(mockExecute).toHaveBeenCalledWith(mockModal)
  })

  test("handleConvertBook should be a no-op function", () => {
    const { result } = renderHook(() => useBookDetail())

    expect(() => result.current.handleConvertBook()).not.toThrow()
  })

  test("handleEditBook should navigate to BookEdit with imageUrl", () => {
    const { result } = renderHook(() => useBookDetail())

    result.current.handleEditBook()

    expect(mockNavigate).toHaveBeenCalledWith("BookEdit", {
      imageUrl: "https://example.com/image.jpg",
    })
  })

  test("handleDeleteBook should call deleteBookHook.execute", async () => {
    const { result } = renderHook(() => useBookDetail())

    await result.current.handleDeleteBook()

    expect(mockExecute).toHaveBeenCalledWith(mockModal)
  })

  test("handleFieldPress should call onLinkPress and goBack", () => {
    const { result } = renderHook(() => useBookDetail())

    result.current.handleFieldPress("test query")

    expect(mockOnLinkPress).toHaveBeenCalledWith("test query")
    expect(mockGoBack).toHaveBeenCalled()
  })
})
