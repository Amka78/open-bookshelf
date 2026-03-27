import { useStores } from "@/models"
import { api } from "@/services/api"
import { useNavigation } from "@react-navigation/native"
import * as DocumentPicker from "expo-document-picker"
import * as reactHookForm from "react-hook-form"
import { useBookEdit } from "./useBookEdit"

describe("useBookEdit", () => {
  const mockUpdate = jest.fn()
  const mockGoBack = jest.fn()
  const mockHandleSubmit = jest.fn()

  const mockBook = {
    id: 1,
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

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useStores as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
      },
    })
    ;(useNavigation as jest.Mock).mockReturnValue({
      goBack: mockGoBack,
    })
    jest.spyOn(reactHookForm, "useForm").mockReturnValue(mockForm as any)
    mockHandleSubmit.mockImplementation((fn) => {
      return () => {
        fn({
          title: "Test Book",
          authors: ["Author 1"],
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
      }),
      expect.any(Array),
    )
  })

  test("useForm is called with correct type parameters", () => {
    useBookEdit()

    expect(reactHookForm.useForm).toHaveBeenCalled()
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

  test("onDeleteFormat calls deleteBookFormat API", async () => {
    const deleteSpy = jest.spyOn(api, "deleteBookFormat").mockResolvedValue({ kind: "ok" })

    const result = useBookEdit()
    const deleted = await result.onDeleteFormat("PDF")

    expect(deleteSpy).toHaveBeenCalledWith("lib1", 1, "PDF")
    expect(deleted).toBe(true)
  })
})
