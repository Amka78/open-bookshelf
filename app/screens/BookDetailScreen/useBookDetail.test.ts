import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  afterEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { useStores } from "@/models"
import { useNavigation, useRoute } from "@react-navigation/native"
import { act, renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const mockUseConvergence = jest.fn()
const mockUseDeleteBook = jest.fn()
const mockUseDownloadBook = jest.fn()
const mockUseOpenViewer = jest.fn()
const mockUseElectrobunModal = jest.fn()

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

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: mockUseElectrobunModal,
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
  const mockOpenViewerExecute = jest.fn()
  const mockDeleteBookExecute = jest.fn()
  const mockDownloadBookExecute = jest.fn()
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

  afterEach(() => {
    jest.restoreAllMocks()
  })

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
    mockUseElectrobunModal.mockReturnValue(mockModal)
    mockUseConvergence.mockReturnValue({
      isLarge: false,
    })
    mockUseOpenViewer.mockReturnValue({
      execute: mockOpenViewerExecute,
    })
    mockUseDeleteBook.mockReturnValue({
      execute: mockDeleteBookExecute,
    })
    mockUseDownloadBook.mockReturnValue({
      execute: mockDownloadBookExecute,
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

  test("navigates to the edit screen when no custom edit action is provided", () => {
    const { result } = renderHook(() => useBookDetail())

    result.current.handleEditBook()

    expect(mockNavigate).toHaveBeenCalledWith("BookEdit", {
      imageUrl: "https://example.com/image.jpg",
    })
  })

  test("executes the default open viewer action when no custom open action is provided", async () => {
    const { result } = renderHook(() => useBookDetail())

    await act(async () => {
      await result.current.handleOpenBook()
    })

    expect(mockOpenViewerExecute).toHaveBeenCalledWith(mockModal)
  })

  test("executes the custom open action instead of the default viewer action when provided", async () => {
    const customOpenAction = jest.fn().mockResolvedValue(undefined)
    ;(useRoute as jest.Mock).mockReturnValue({
      params: {
        ...mockRoute.params,
        onOpenBookAction: customOpenAction,
      },
    })

    const { result } = renderHook(() => useBookDetail())

    await act(async () => {
      await result.current.handleOpenBook()
    })

    expect(customOpenAction).toHaveBeenCalledTimes(1)
    expect(mockOpenViewerExecute).not.toHaveBeenCalled()
  })

  test("executes the default download action when no custom download action is provided", async () => {
    const { result } = renderHook(() => useBookDetail())

    await act(async () => {
      await result.current.handleDownloadBook()
    })

    expect(mockDownloadBookExecute).toHaveBeenCalledWith(mockModal)
  })

  test("executes the custom download action instead of the default download flow when provided", async () => {
    const customDownloadAction = jest.fn().mockResolvedValue(undefined)
    ;(useRoute as jest.Mock).mockReturnValue({
      params: {
        ...mockRoute.params,
        onDownloadBookAction: customDownloadAction,
      },
    })

    const { result } = renderHook(() => useBookDetail())

    await act(async () => {
      await result.current.handleDownloadBook()
    })

    expect(customDownloadAction).toHaveBeenCalledTimes(1)
    expect(mockDownloadBookExecute).not.toHaveBeenCalled()
  })

  test("executes the default delete action when no custom delete action is provided", async () => {
    const { result } = renderHook(() => useBookDetail())

    await act(async () => {
      await result.current.handleDeleteBook()
    })

    expect(mockDeleteBookExecute).toHaveBeenCalledWith(mockModal)
  })

  test("executes the custom delete action instead of the default delete flow when provided", async () => {
    const customDeleteAction = jest.fn().mockResolvedValue(undefined)
    ;(useRoute as jest.Mock).mockReturnValue({
      params: {
        ...mockRoute.params,
        onDeleteBookAction: customDeleteAction,
      },
    })

    const { result } = renderHook(() => useBookDetail())

    await act(async () => {
      await result.current.handleDeleteBook()
    })

    expect(customDeleteAction).toHaveBeenCalledTimes(1)
    expect(mockDeleteBookExecute).not.toHaveBeenCalled()
  })

  test("uses the custom edit navigation callback instead of screen navigation when provided", () => {
    const customEditNavigation = jest.fn()
    ;(useRoute as jest.Mock).mockReturnValue({
      params: {
        ...mockRoute.params,
        onNavigateToBookEdit: customEditNavigation,
      },
    })

    const { result } = renderHook(() => useBookDetail())

    result.current.handleEditBook()

    expect(customEditNavigation).toHaveBeenCalledWith({
      imageUrl: "https://example.com/image.jpg",
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test("calls the field link callback and returns to the previous screen when a field is pressed", () => {
    const { result } = renderHook(() => useBookDetail())

    result.current.handleFieldPress("authors:asimov")

    expect(mockOnLinkPress).toHaveBeenCalledWith("authors:asimov")
    expect(mockGoBack).toHaveBeenCalledTimes(1)
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

    test("On small screens, use the custom convert navigation callback when provided", () => {
      const customConvertNavigation = jest.fn()
      mockUseConvergence.mockReturnValue({ isLarge: false })
      ;(useRoute as jest.Mock).mockReturnValue({
        params: {
          ...mockRoute.params,
          onNavigateToBookConvert: customConvertNavigation,
        },
      })

      const { result } = renderHook(() => useBookDetail())

      result.current.handleConvertBook()

      expect(customConvertNavigation).toHaveBeenCalledWith({
        imageUrl: "https://example.com/image.jpg",
      })
      expect(mockNavigate).not.toHaveBeenCalled()
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
