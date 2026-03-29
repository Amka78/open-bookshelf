import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { useStores } from "@/models"
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { act, renderHook } from "@testing-library/react"

async function playODSRootInitializationCompletes() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

function playODSRootReadsEntryTitles({ entries }: { entries: Array<{ title: string }> }) {
  return entries.map((entry) => entry.title)
}
mock.module("@/components", () => ({
  Box: "div",
  Image: "img",
  Text: "span",
}))

let useODSRoot: typeof import("./useOPDSRoot").useODSRoot

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

  beforeAll(() => {
    jest.useRealTimers()
  })

  beforeAll(async () => {
    ;({ useODSRoot } = await import("./useOPDSRoot"))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      opdsRootStore: mockOPDSRootStore,
      settingStore: mockSettingStore,
    })
    const maybeMockedUsePalette = usePalette as unknown as {
      mockReturnValue?: (value: { textPrimary: string }) => void
    }
    maybeMockedUsePalette.mockReturnValue?.({
      textPrimary: "#000000",
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      setOptions: mockSetOptions,
    })
  })

  test("initializes with entries from store", () => {
    const { result } = renderHook(() => useODSRoot())
    const titles = playODSRootReadsEntryTitles({ entries: result.current.entries })

    expect(result.current.entries).toHaveLength(2)
    expect(titles).toEqual(["Book 1", "Book 2"])
  })

  test("calls opdsRootStore.root.load with initialPath", async () => {
    renderHook(() => useODSRoot())

    await playODSRootInitializationCompletes()

    expect(mockLoad).toHaveBeenCalledWith("/opds")
  })

  test("sets navigation header options after loading", async () => {
    renderHook(() => useODSRoot())

    await playODSRootInitializationCompletes()

    expect(mockSetOptions).toHaveBeenCalled()
  })

  test("returns opdsRootStore from hook", () => {
    const { result } = renderHook(() => useODSRoot())

    expect(result.current.opdsRootStore).toBe(mockOPDSRootStore)
  })

  test("returns navigation from hook", () => {
    const { result } = renderHook(() => useODSRoot())

    expect(result.current.navigation).toBeDefined()
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

    const { result } = renderHook(() => useODSRoot())

    expect(result.current.entries).toEqual([])
  })

  test("setupHeaderTitle includes icon and title", () => {
    const { result } = renderHook(() => useODSRoot())

    expect(result.current).toBeDefined()
    expect(mockOPDSRootStore.root.icon).toBe("/icon.png")
    expect(mockOPDSRootStore.root.title).toBe("OPDS Feed")
  })
})
