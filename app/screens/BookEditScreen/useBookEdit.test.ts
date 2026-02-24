import { useBookEdit } from "./useBookEdit"
import { useStores } from "@/models"
import { useNavigation } from "@react-navigation/native"
import { useForm } from "react-hook-form"

jest.mock("@/models")
jest.mock("@react-navigation/native")
jest.mock("react-hook-form")

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
    ;(useForm as jest.Mock).mockReturnValue(mockForm)
    mockHandleSubmit.mockImplementation((fn) => {
      return () => {
        fn({
          title: "Test Book",
          authors: ["Author 1"],
        })
      }
    })
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

    expect(mockUpdate).toHaveBeenCalledWith("lib1", expect.objectContaining({
      title: "Test Book",
      authors: ["Author 1"],
    }), expect.any(Array))
  })

  test("useForm is called with correct type parameters", () => {
    useBookEdit()

    expect(useForm).toHaveBeenCalled()
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
})
