import {
  afterEach,
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { act, renderHook, waitFor } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useRouteMock = jest.fn()
const useConvergenceMock = jest.fn()
const recognizeCoverMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  ...(global as { __navMock?: Record<string, unknown> }).__navMock,
  useNavigation: useNavigationMock,
  useRoute: useRouteMock,
}))

mock.module("@/hooks/useConvergence", () => ({
  useConvergence: useConvergenceMock,
}))

mock.module("@/services/ocr", () => ({
  recognizeCover: recognizeCoverMock,
}))

mock.module("mobx-state-tree", () => ({
  getSnapshot: (value: unknown) => value,
}))

let useBookOcrReview: typeof import("./useBookOcrReview").useBookOcrReview

beforeAll(async () => {
  ;({ useBookOcrReview } = await import("./useBookOcrReview"))
})

describe("useBookOcrReview", () => {
  const mockGoBack = jest.fn()
  const mockSetOptions = jest.fn()
  const mockUpdate = jest.fn().mockResolvedValue(true)

  const selectedBook = {
    id: 1,
    metaData: {
      title: "Original Title",
      authors: [],
      formats: ["EPUB"],
      languages: ["en"],
      langNames: {
        en: "English",
        ja: "Japanese",
      },
      identifiers: {},
    },
    update: mockUpdate,
  }

  const selectedLibrary = {
    id: "lib1",
    selectedBook,
    fieldMetadataList: new Map([
      ["title", { name: "Title" }],
      ["authors", { name: "Authors" }],
      ["identifiers", { name: "Identifiers" }],
      ["languages", { name: "Languages" }],
      ["series", { name: "Series" }],
    ]),
    tagBrowser: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()

    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary,
      },
    })
    useNavigationMock.mockReturnValue({
      goBack: mockGoBack,
      setOptions: mockSetOptions,
    })
    useRouteMock.mockReturnValue({
      params: {
        imageUrl: "https://example.com/ocr-image.jpg",
      },
    })
    useConvergenceMock.mockReturnValue({
      isLarge: false,
    })
    recognizeCoverMock.mockResolvedValue({
      text: "OCR Title\nby Jane Doe\nISBN 9781234567890",
      fieldEntries: [
        { field: "title", value: "OCR Title", sourceText: "OCR Title" },
        { field: "authors", value: ["Jane Doe"], sourceText: "by Jane Doe" },
        { field: "languages", value: ["ja"], sourceText: "Japanese" },
        { field: "identifiers", value: { isbn: "9781234567890" }, sourceText: "9781234567890" },
      ],
      mappedMetadata: {
        title: "OCR Title",
        authors: ["Jane Doe"],
        languages: ["ja"],
        identifiers: {
          isbn: "9781234567890",
        },
      },
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("prefills the metadata form with OCR-detected values", async () => {
    const { result } = renderHook(() => useBookOcrReview())

    await waitFor(() => {
      expect(result.current.ocrState.status).toBe("success")
    })

    expect(recognizeCoverMock).toHaveBeenCalledWith({
      imageUrl: "https://example.com/ocr-image.jpg",
      languages: ["en"],
    })
    expect(result.current.form.getValues("title")).toBe("OCR Title")
    expect(result.current.form.getValues("authors")).toEqual(["Jane Doe"])
    expect(result.current.form.getValues("languages")).toEqual(["Japanese"])
    expect(result.current.form.getValues("identifiers")).toEqual({ isbn: "9781234567890" })
  })

  test("applyFieldEntry reapplies an OCR candidate to the form", async () => {
    const { result } = renderHook(() => useBookOcrReview())

    await waitFor(() => {
      expect(result.current.ocrState.status).toBe("success")
    })

    act(() => {
      result.current.form.setValue("title", "Manual Title")
      result.current.applyFieldEntry(result.current.fieldSummaries[0])
    })

    expect(result.current.form.getValues("title")).toBe("OCR Title")
  })

  test("submitting saves the edited metadata and returns to the previous screen", async () => {
    const { result } = renderHook(() => useBookOcrReview())

    await waitFor(() => {
      expect(result.current.ocrState.status).toBe("success")
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      "lib1",
      expect.objectContaining({
        title: "OCR Title",
        authors: ["Jane Doe"],
        languages: ["ja"],
        identifiers: { isbn: "9781234567890" },
      }),
      expect.any(Array),
    )
    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })
})
