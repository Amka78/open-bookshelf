import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  mock,
  test,
} from "bun:test"
import { api } from "@/services/api"
import { renderHook } from "@testing-library/react"
import * as DocumentPicker from "expo-document-picker"
import * as reactHookForm from "react-hook-form"

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const mockOpenModal = jest.fn()

mock.module("@/services/api", () => ({
  api: {
    uploadBookFormat: jest.fn(),
    deleteBookFormat: jest.fn(),
    setCoverBinary: jest.fn(),
  },
}))

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  ...(global as { __navMock?: Record<string, unknown> }).__navMock,
  useNavigation: useNavigationMock,
}))

mock.module("@/hooks/useElectrobunModal", () => ({
  useElectrobunModal: () => ({
    openModal: mockOpenModal,
  }),
}))

mock.module("mobx-state-tree", () => ({
  getSnapshot: (value: unknown) => value,
}))

// Restore real mobx-state-tree after this file so subsequent test files that import
// @/models/calibre (which uses MST models) don't encounter a broken partial mock.
afterAll(() => {
  mock.module(
    "mobx-state-tree",
    () => (global as { __realMST?: Record<string, unknown> }).__realMST ?? {},
  )
})

afterEach(() => {
  jest.clearAllMocks()
})

let useBookEdit: typeof import("./useBookEdit").useBookEdit

describe("useBookEdit", () => {
  const mockUpdate = jest.fn()
  const mockGoBack = jest.fn()
  const mockHandleSubmit = jest.fn()
  const mockBumpBookThumbnailRevision = jest.fn()

  const mockBook = {
    id: 1,
    metaData: {
      title: "Original Book",
      authors: ["Author 1"],
      languages: ["en", "ja"],
      langNames: {
        en: "English",
        ja: "Japanese",
      },
    },
    update: mockUpdate,
  }

  const mockSelectedLibrary = {
    id: "lib1",
    selectedBook: mockBook,
    fieldMetadataList: [],
    tagBrowser: [],
  }

  const mockForm = {
    control: {} as unknown as ReturnType<(typeof reactHookForm)["useForm"]>["control"],
    handleSubmit: mockHandleSubmit,
    formState: {
      isValid: true,
    },
  }

  beforeAll(async () => {
    ;({ useBookEdit } = await import("./useBookEdit"))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useStoresMock.mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
        bumpBookThumbnailRevision: mockBumpBookThumbnailRevision,
      },
    })
    useNavigationMock.mockReturnValue({
      goBack: mockGoBack,
    })
    jest
      .spyOn(reactHookForm, "useForm")
      .mockReturnValue(mockForm as unknown as ReturnType<(typeof reactHookForm)["useForm"]>)
    mockHandleSubmit.mockImplementation((fn) => {
      return () => {
        fn({
          title: "Test Book",
          authors: ["Author 1"],
          languages: ["English", "Japanese"],
        })
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("returns form object", () => {
    const { result } = renderHook(() => useBookEdit())

    expect(result.current.form).toBeDefined()
    expect(result.current.form).toBe(mockForm)
  })

  test("returns selectedBook from store", () => {
    const { result } = renderHook(() => useBookEdit())

    expect(result.current.selectedBook).toBe(mockBook)
  })

  test("returns selectedLibrary from store", () => {
    const { result } = renderHook(() => useBookEdit())

    expect(result.current.selectedLibrary).toBe(mockSelectedLibrary)
  })

  test("returns onSubmit function", () => {
    const { result } = renderHook(() => useBookEdit())

    expect(result.current.onSubmit).toBeDefined()
    expect(typeof result.current.onSubmit).toBe("function")
  })

  test("onSubmit calls selectedBook.update with correct params", () => {
    const { result } = renderHook(() => useBookEdit())

    result.current.onSubmit()

    expect(mockUpdate).toHaveBeenCalled()
  })

  test("onSubmit calls navigation.goBack after update", () => {
    const { result } = renderHook(() => useBookEdit())

    result.current.onSubmit()

    expect(mockGoBack).toHaveBeenCalled()
  })

  test("onSubmit bumps thumbnail revision after updating the book", () => {
    const { result } = renderHook(() => useBookEdit())

    result.current.onSubmit()

    expect(mockBumpBookThumbnailRevision).toHaveBeenCalledWith("lib1", 1)
  })

  test("onSubmit uses form.handleSubmit", () => {
    renderHook(() => useBookEdit())

    expect(mockHandleSubmit).toHaveBeenCalled()
  })

  test("update is called with library id and form values", () => {
    const { result } = renderHook(() => useBookEdit())

    result.current.onSubmit()

    expect(mockUpdate).toHaveBeenCalledWith(
      "lib1",
      expect.objectContaining({
        title: "Test Book",
        authors: ["Author 1"],
        languages: ["English", "Japanese"],
      }),
      expect.any(Array),
    )
  })

  test("useForm is called with correct type parameters", () => {
    renderHook(() => useBookEdit())

    expect(reactHookForm.useForm).toHaveBeenCalled()
  })

  test("useForm receives display-friendly language names as default values", () => {
    renderHook(() => useBookEdit())

    expect(reactHookForm.useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          languages: ["English", "Japanese"],
        }),
      }),
    )
  })

  test("selectedLibrary has required properties", () => {
    const { result } = renderHook(() => useBookEdit())

    expect(result.current.selectedLibrary.id).toBe("lib1")
    expect(result.current.selectedLibrary.selectedBook).toBe(mockBook)
    expect(result.current.selectedLibrary.fieldMetadataList).toEqual([])
    expect(result.current.selectedLibrary.tagBrowser).toEqual([])
  })

  test("returns all required properties", () => {
    const { result } = renderHook(() => useBookEdit())

    expect(result.current).toHaveProperty("form")
    expect(result.current).toHaveProperty("selectedBook")
    expect(result.current).toHaveProperty("selectedLibrary")
    expect(result.current).toHaveProperty("onSubmit")
  })

  test("onUploadFormat calls uploadBookFormat API in runtime flow", async () => {
    const getDocumentAsyncSpy = jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: "sample.epub",
          uri: "file:///tmp/sample.epub",
          mimeType: "application/epub+zip",
        },
      ],
    } as unknown as DocumentPicker.DocumentPickerResult)

    const uploadSpy = jest.spyOn(api, "uploadBookFormat").mockResolvedValue({ kind: "ok" })

    const { result } = renderHook(() => useBookEdit())
    const uploaded = await result.current.onUploadFormat({ targetFormat: "EPUB" })

    expect(getDocumentAsyncSpy).toHaveBeenCalled()
    expect(uploadSpy).toHaveBeenCalledWith(
      "lib1",
      1,
      "EPUB",
      "sample.epub",
      "file:///tmp/sample.epub",
    )
    expect(uploaded).toEqual({ success: true, format: "EPUB" })
  })

  test("onUploadFormat derives the target format from the selected file extension when none is provided", async () => {
    jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: "sample.azw3",
          uri: "file:///tmp/sample.azw3",
          mimeType: "application/octet-stream",
        },
      ],
    } as unknown as DocumentPicker.DocumentPickerResult)

    const uploadSpy = jest.spyOn(api, "uploadBookFormat").mockResolvedValue({ kind: "ok" })

    const { result } = renderHook(() => useBookEdit())
    const uploaded = await result.current.onUploadFormat({})

    expect(uploadSpy).toHaveBeenCalledWith(
      "lib1",
      1,
      "AZW3",
      "sample.azw3",
      "file:///tmp/sample.azw3",
    )
    expect(uploaded).toEqual({ success: true, format: "AZW3" })
  })

  test("onUploadFormat returns failure when the picker is canceled", async () => {
    jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
      canceled: true,
      assets: [],
    } as unknown as DocumentPicker.DocumentPickerResult)

    const { result } = renderHook(() => useBookEdit())
    const uploaded = await result.current.onUploadFormat({ targetFormat: "EPUB" })

    expect(uploaded).toEqual({ success: false })
  })

  test("onUploadFormat returns failure when the selected asset has no usable file payload", async () => {
    jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: "sample.epub",
          uri: "",
          file: undefined,
        },
      ],
    } as unknown as DocumentPicker.DocumentPickerResult)

    const uploadSpy = jest.spyOn(api, "uploadBookFormat")

    const { result } = renderHook(() => useBookEdit())
    const uploaded = await result.current.onUploadFormat({ targetFormat: "EPUB" })

    expect(uploaded).toEqual({ success: false })
    expect(uploadSpy).not.toHaveBeenCalled()
  })

  test("onUploadFormat returns failure when uploading the picked format fails", async () => {
    jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: "sample.epub",
          uri: "file:///tmp/sample.epub",
          mimeType: "application/epub+zip",
        },
      ],
    } as unknown as DocumentPicker.DocumentPickerResult)

    jest
      .spyOn(api, "uploadBookFormat")
      .mockResolvedValue({ kind: "bad-data" } as unknown as Awaited<
        ReturnType<typeof api.uploadBookFormat>
      >)

    const { result } = renderHook(() => useBookEdit())
    const uploaded = await result.current.onUploadFormat({ targetFormat: "EPUB" })

    expect(uploaded).toEqual({ success: false })
  })

  test("onDeleteFormat calls deleteBookFormat API", async () => {
    const deleteSpy = jest.spyOn(api, "deleteBookFormat").mockResolvedValue({ kind: "ok" })

    const { result } = renderHook(() => useBookEdit())
    const deletePromise = result.current.onDeleteFormat("PDF")

    const modalParams = mockOpenModal.mock.calls[0]?.[1] as
      | { onOKPress?: () => Promise<void> }
      | undefined
    await modalParams?.onOKPress?.()
    const deleted = await deletePromise

    expect(deleteSpy).toHaveBeenCalledWith("lib1", 1, "PDF")
    expect(deleted).toBe(true)
  })

  test("onDeleteFormat asks for confirmation before deleting", async () => {
    const { result } = renderHook(() => useBookEdit())
    const deletePromise = result.current.onDeleteFormat("PDF")

    expect(mockOpenModal).toHaveBeenCalledWith(
      "ConfirmModal",
      expect.objectContaining({
        titleTx: "bookEditScreen.deleteFormatConfirmTitle",
        message: expect.any(String),
      }),
    )

    const modalParams = mockOpenModal.mock.calls[0]?.[1] as { onCancelPress?: () => void } | undefined
    modalParams?.onCancelPress?.()
    const deleted = await deletePromise

    expect(deleted).toBe(false)
  })

  test("onDeleteFormat returns false when the format delete request fails after confirmation", async () => {
    jest
      .spyOn(api, "deleteBookFormat")
      .mockResolvedValue({ kind: "bad-data" } as unknown as Awaited<
        ReturnType<typeof api.deleteBookFormat>
      >)

    const { result } = renderHook(() => useBookEdit())
    const deletePromise = result.current.onDeleteFormat("PDF")

    const modalParams = mockOpenModal.mock.calls[0]?.[1] as
      | { onOKPress?: () => Promise<void> }
      | undefined
    await modalParams?.onOKPress?.()
    const deleted = await deletePromise

    expect(deleted).toBe(false)
  })

  test("onSubmit forwards the language values currently held by the edit form", () => {
    mockHandleSubmit.mockImplementationOnce((fn) => {
      return () => {
        fn({
          title: "Test Book",
          authors: ["Author 1"],
          languages: ["English", "Japanese"],
        })
      }
    })

    const { result } = renderHook(() => useBookEdit())

    result.current.onSubmit()

    expect(mockUpdate).toHaveBeenCalledWith(
      "lib1",
      expect.objectContaining({
        languages: ["English", "Japanese"],
      }),
      expect.any(Array),
    )
  })
})
