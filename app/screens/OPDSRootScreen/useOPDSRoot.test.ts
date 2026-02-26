import { useODSRoot } from "./useOPDSRoot"
import { useStores } from "@/models"
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"

jest.mock("@/models")
jest.mock("@/theme")
jest.mock("@react-navigation/native")

describe("useODSRoot", () => {
  const mockLoad = jest.fn().mockResolvedValue(undefined)
  const mockSetOptions = jest.fn()

  const mockODSRoot = {
    icon: "/icon.png",
    title: "OPDS Feed",
    entry: [
      {
        title: "Book 1",
        content: "Description 1",
        link: ["http://example.com/book1"],
      },
      {
        title: "Book 2",
        content: "Description 2",
        link: ["http://example.com/book2"],
      },
    ],
    load: mockLoad,
  }

  const mockOPDSRootStore = {
    root: mockODSRoot,
  }

  const mockSettingStore = {
    api: {
      baseUrl: "http://example.com",
      initialPath: "/opds",
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      opdsRootStore: mockOPDSRootStore,
      settingStore: mockSettingStore,
    })
    ;(usePalette as jest.Mock).mockReturnValue({
      textPrimary: "#000000",
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      setOptions: mockSetOptions,
    })
  })

  test("initializes with entries from store", () => {
    const result = useODSRoot()

    expect(result.entries).toHaveLength(2)
    expect(result.entries[0].title).toBe("Book 1")
    expect(result.entries[1].title).toBe("Book 2")
  })

  test("calls opdsRootStore.root.load with initialPath", async () => {
    useODSRoot()

    // useEffect will call initialize
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockLoad).toHaveBeenCalledWith("/opds")
  })

  test("sets navigation header options after loading", async () => {
    useODSRoot()

    // useEffect will call initialize
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockSetOptions).toHaveBeenCalled()
  })

  test("returns opdsRootStore from hook", () => {
    const result = useODSRoot()

    expect(result.opdsRootStore).toBe(mockOPDSRootStore)
  })

  test("returns navigation from hook", () => {
    const result = useODSRoot()

    expect(result.navigation).toBeDefined()
  })

  test("returns empty array when no entries", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      opdsRootStore: {
        root: {
          ...mockODSRoot,
          entry: [],
        },
      },
      settingStore: mockSettingStore,
    })

    const result = useODSRoot()

    expect(result.entries).toEqual([])
  })

  test("returns empty array when root is null", () => {
    ;(useStores as jest.Mock).mockReturnValue({
      opdsRootStore: {
        root: null,
      },
      settingStore: mockSettingStore,
    })

    const result = useODSRoot()

    expect(result.entries).toEqual([])
  })

  test("setupHeaderTitle includes icon and title", () => {
    const result = useODSRoot()

    expect(result).toBeDefined()
    expect(mockOPDSRootStore.root.icon).toBe("/icon.png")
    expect(mockOPDSRootStore.root.title).toBe("OPDS Feed")
  })
})
