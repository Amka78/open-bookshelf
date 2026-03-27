import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { renderHook } from "@testing-library/react"
import { values } from "mobx"
import { useCalibreRoot } from "./useCalibreRoot"

jest.mock("mobx", () => ({
  values: jest.fn(),
}))

describe("useCalibreRoot", () => {
  type TestLibrary = { id: string; books: Map<string, unknown> }

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

  const renderUseCalibreRoot = () => renderHook(() => useCalibreRoot())

  test("returns library array from store", () => {
    const { result } = renderUseCalibreRoot()

    expect(result.current.library).toBeDefined()
    expect(Array.isArray(result.current.library)).toBe(true)
  })

  test("returns onLibraryPress function", () => {
    const { result } = renderUseCalibreRoot()

    expect(result.current.onLibraryPress).toBeDefined()
    expect(typeof result.current.onLibraryPress).toBe("function")
  })

  test.each(["library1", "library2"])("onLibraryPress handles %s", (libraryId) => {
    const { result } = renderUseCalibreRoot()

    result.current.onLibraryPress(libraryId)

    expect(mockSetLibrary).toHaveBeenCalledWith(libraryId)
    expect(mockNavigate).toHaveBeenCalledWith("Library")
  })

  test("onLibraryPress calls setLibrary before navigating", () => {
    const { result } = renderUseCalibreRoot()
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

  test("onLibraryPress can be called multiple times", () => {
    const { result } = renderUseCalibreRoot()

    result.current.onLibraryPress("library1")
    result.current.onLibraryPress("library2")

    expect(mockSetLibrary).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledTimes(2)
  })

  test.each([[["library1", "library2"]]])("library list mapping %#", (expectedIds: string[]) => {

    const { result } = renderUseCalibreRoot()

    expect(result.current.library).toHaveLength(expectedIds.length)
    expect(result.current.library.map((library) => library.id)).toEqual(expectedIds)
  })

  test("getLibraryMap is called from calibreRootStore", () => {
    renderUseCalibreRoot()

    expect(useStores).toHaveBeenCalled()
    const stores = (useStores as jest.Mock).mock.results[0].value
    expect(stores.calibreRootStore).toBeDefined()
  })
})
