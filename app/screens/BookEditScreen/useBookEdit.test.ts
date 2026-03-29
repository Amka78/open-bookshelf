import { api } from "@/services/api"
import { beforeAll, beforeEach, afterEach, describe, expect, jest, mock, test } from "bun:test"
import * as DocumentPicker from "expo-document-picker"
import * as reactHookForm from "react-hook-form"

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: useNavigationMock,
}))

mock.module("mobx-state-tree", () => ({
  getSnapshot: (value: unknown) => value,
}))

let useBookEdit: typeof import("./useBookEdit").useBookEdit

describe("useBookEdit", () => {
  const mockUpdate = jest.fn()
  const mockGoBack = jest.fn()
  const mockHandleSubmit = jest.fn()

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
    control: {} as any,
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
      },
    })
    useNavigationMock.mockReturnValue({
      goBack: mockGoBack,
    })
    jest.spyOn(reactHookForm, "useForm").mockReturnValue(mockForm as any)
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
    const result = useBookEdit()

    expect(result.form).toBeDefined()
    expect(result.form).toBe(mockForm)
  })

  test("returns selectedBook from store", () => {
    const result = useBookEdit()

    expect(result.selectedBook).toBe(mockBook)
  })

  test("returns selectedLibrary from store", () => {
    const result = useBookEdit()

    expect(result.selectedLibrary).toBe(mockSelectedLibrary)
  })

  test("returns onSubmit function", () => {
    const result = useBookEdit()

    expect(result.onSubmit).toBeDefined()
    expect(typeof result.onSubmit).toBe("function")
  })

  test("onSubmit calls selectedBook.update with correct params", () => {
    const result = useBookEdit()

    result.onSubmit()

    expect(mockUpdate).toHaveBeenCalled()
  })

  test("onSubmit calls navigation.goBack after update", () => {
    const result = useBookEdit()

    result.onSubmit()

    expect(mockGoBack).toHaveBeenCalled()
  })

  test("onSubmit uses form.handleSubmit", () => {
    useBookEdit()

    expect(mockHandleSubmit).toHaveBeenCalled()
  })

  test("update is called with library id and form values", () => {
    const result = useBookEdit()

    result.onSubmit()

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
    useBookEdit()

    expect(reactHookForm.useForm).toHaveBeenCalled()
  })

  test("useForm receives display-friendly language names as default values", () => {
    useBookEdit()

    expect(reactHookForm.useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          languages: ["English", "Japanese"],
        }),
      }),
    )
  })

  test("selectedLibrary has required properties", () => {
    const result = useBookEdit()

    expect(result.selectedLibrary.id).toBe("lib1")
    expect(result.selectedLibrary.selectedBook).toBe(mockBook)
    expect(result.selectedLibrary.fieldMetadataList).toEqual([])
    expect(result.selectedLibrary.tagBrowser).toEqual([])
  })

  test("returns all required properties", () => {
    const result = useBookEdit()

    expect(result).toHaveProperty("form")
    expect(result).toHaveProperty("selectedBook")
    expect(result).toHaveProperty("selectedLibrary")
    expect(result).toHaveProperty("onSubmit")
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

    const result = useBookEdit()
    const uploaded = await result.onUploadFormat({ targetFormat: "EPUB" })

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

    const result = useBookEdit()
    const uploaded = await result.onUploadFormat({})

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

    const result = useBookEdit()
    const uploaded = await result.onUploadFormat({ targetFormat: "EPUB" })

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

    const result = useBookEdit()
    const uploaded = await result.onUploadFormat({ targetFormat: "EPUB" })

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

    jest.spyOn(api, "uploadBookFormat").mockResolvedValue({ kind: "bad-data" } as any)

    const result = useBookEdit()
    const uploaded = await result.onUploadFormat({ targetFormat: "EPUB" })

    expect(uploaded).toEqual({ success: false })
  })

  test("onDeleteFormat calls deleteBookFormat API", async () => {
    const deleteSpy = jest.spyOn(api, "deleteBookFormat").mockResolvedValue({ kind: "ok" })

    const result = useBookEdit()
    const deleted = await result.onDeleteFormat("PDF")

    expect(deleteSpy).toHaveBeenCalledWith("lib1", 1, "PDF")
    expect(deleted).toBe(true)
  })

  test("onDeleteFormat returns false when the format delete request fails", async () => {
    jest.spyOn(api, "deleteBookFormat").mockResolvedValue({ kind: "bad-data" } as any)

    const result = useBookEdit()
    const deleted = await result.onDeleteFormat("PDF")

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

    const result = useBookEdit()

    result.onSubmit()

    expect(mockUpdate).toHaveBeenCalledWith(
      "lib1",
      expect.objectContaining({
        languages: ["English", "Japanese"],
      }),
      expect.any(Array),
    )
  })
})
