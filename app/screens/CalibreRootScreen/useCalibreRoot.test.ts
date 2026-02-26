import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { renderHook } from "@testing-library/react"
import { values } from "mobx"
import { useCalibreRoot } from "./useCalibreRoot"

jest.mock("@/models", () => ({
  useStores: jest.fn(),
}))
jest.mock("@react-navigation/native")
jest.mock("mobx")

describe("useCalibreRoot", () => {
  const mockSetLibrary = jest.fn()
  const mockNavigate = jest.fn()
  const mockLibraryMap = new Map([
    [
      "library1",
      {
        id: "library1",
        books: new Map(),
        selectedBook: null,
      },
    ],
    [
      "library2",
      {
        id: "library2",
        books: new Map(),
        selectedBook: null,
      },
    ],
  ])

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        libraryMap: mockLibraryMap,
        setLibrary: mockSetLibrary,
      },
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    })
    ;(values as jest.Mock).mockReturnValue(mockLibraryMap.values())
  })

  test("returns library array from store", () => {
    const { result } = renderHook(() => useCalibreRoot())

    expect(result.current.library).toBeDefined()
    expect(Array.isArray(result.current.library)).toBe(true)
  })

  test("returns onLibraryPress function", () => {
    const { result } = renderHook(() => useCalibreRoot())

    expect(result.current.onLibraryPress).toBeDefined()
    expect(typeof result.current.onLibraryPress).toBe("function")
  })

  test("onLibraryPress calls setLibrary with correct id", () => {
    const { result } = renderHook(() => useCalibreRoot())

    result.current.onLibraryPress("library1")

    expect(mockSetLibrary).toHaveBeenCalledWith("library1")
  })

  test("onLibraryPress navigates to Library screen", () => {
    const { result } = renderHook(() => useCalibreRoot())

    result.current.onLibraryPress("library1")

    expect(mockNavigate).toHaveBeenCalledWith("Library")
  })

  test("onLibraryPress calls setLibrary before navigating", () => {
    const { result } = renderHook(() => useCalibreRoot())
    const callOrder: string[] = []

    mockSetLibrary.mockImplementation(() => {
      callOrder.push("setLibrary")
    })
    mockNavigate.mockImplementation(() => {
      callOrder.push("navigate")
    })

    result.current.onLibraryPress("library1")

    expect(callOrder).toEqual(["setLibrary", "navigate"])
  })

  test("handles different library ids", () => {
    const { result } = renderHook(() => useCalibreRoot())

    result.current.onLibraryPress("library2")

    expect(mockSetLibrary).toHaveBeenCalledWith("library2")
    expect(mockNavigate).toHaveBeenCalledWith("Library")
  })

  test("onLibraryPress can be called multiple times", () => {
    const { result } = renderHook(() => useCalibreRoot())

    result.current.onLibraryPress("library1")
    result.current.onLibraryPress("library2")

    expect(mockSetLibrary).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledTimes(2)
  })

  test("library contains expected library entries", () => {
    ;(values as jest.Mock).mockReturnValue([
      { id: "lib1", books: new Map() },
      { id: "lib2", books: new Map() },
    ])

    const { result } = renderHook(() => useCalibreRoot())

    expect(result.current.library).toHaveLength(2)
    expect(result.current.library[0].id).toBe("lib1")
    expect(result.current.library[1].id).toBe("lib2")
  })

  test("library returns empty array when libraryMap is empty", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        libraryMap: new Map(),
        setLibrary: mockSetLibrary,
      },
    })
    ;(values as jest.Mock).mockReturnValue([])

    const { result } = renderHook(() => useCalibreRoot())

    expect(result.current.library).toEqual([])
  })

  test("getLibraryMap is called from calibreRootStore", () => {
    renderHook(() => useCalibreRoot())

    expect(useStores).toHaveBeenCalled()
    const stores = (useStores as jest.Mock).mock.results[0].value
    expect(stores.calibreRootStore).toBeDefined()
  })
})
