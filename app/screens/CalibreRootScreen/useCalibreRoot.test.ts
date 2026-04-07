import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { act, renderHook } from "@testing-library/react"
import { useCalibreRoot } from "./useCalibreRoot"

type HookResultRef = {
  current: {
    onLibraryPress: (id: string) => void
    library: Array<{ id: string }>
  }
}

async function playCalibreRootPressesLibrary({
  result,
  libraryId,
}: { result: HookResultRef; libraryId: string }) {
  await act(async () => {
    result.current.onLibraryPress(libraryId)
  })
}

async function playCalibreRootPressesLibrariesInOrder({
  result,
  libraryIds,
}: { result: HookResultRef; libraryIds: string[] }) {
  for (const id of libraryIds) {
    await playCalibreRootPressesLibrary({ result, libraryId: id })
  }
}

function playCalibreRootReadsLibraryIds({ result }: { result: HookResultRef }) {
  return result.current.library.map((library) => library.id)
}

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

  test.each(["library1", "library2"])("onLibraryPress handles %s", async (libraryId) => {
    const { result } = renderUseCalibreRoot()

    await playCalibreRootPressesLibrary({ result, libraryId })

    expect(mockSetLibrary).toHaveBeenCalledWith(libraryId)
    expect(mockNavigate).toHaveBeenCalledWith("Library")
  })

  test("onLibraryPress calls setLibrary before navigating", async () => {
    const { result } = renderUseCalibreRoot()
    const callOrder: string[] = []

    mockSetLibrary.mockImplementation(() => {
      callOrder.push("setLibrary")
    })
    mockNavigate.mockImplementation(() => {
      callOrder.push("navigate")
    })

    await playCalibreRootPressesLibrary({ result, libraryId: "library1" })

    expect(callOrder).toEqual(["setLibrary", "navigate"])
  })

  test("onLibraryPress can be called multiple times", async () => {
    const { result } = renderUseCalibreRoot()

    await playCalibreRootPressesLibrariesInOrder({
      result,
      libraryIds: ["library1", "library2"],
    })

    expect(mockSetLibrary).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledTimes(2)
  })

  test.each([[["library1", "library2"]]])("library list mapping %#", (expectedIds: string[]) => {
    const { result } = renderUseCalibreRoot()
    const currentIds = playCalibreRootReadsLibraryIds({ result })

    expect(result.current.library).toHaveLength(expectedIds.length)
    expect(currentIds).toEqual(expectedIds)
  })

  test("getLibraryMap is called from calibreRootStore", () => {
    renderUseCalibreRoot()

    expect(useStores).toHaveBeenCalled()
    const stores = (useStores as jest.Mock).mock.results[0].value
    expect(stores.calibreRootStore).toBeDefined()
  })
})
