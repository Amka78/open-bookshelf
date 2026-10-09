import { vi, describe as baseDescribe, test as baseTest, beforeAll, beforeEach, expect } from "vitest"
import { render } from "@testing-library/react"
import * as DocumentPicker from "expo-document-picker"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playBookEditModalFormatClickRunsUpload } from "./bookEditModalStoryPlay"

vi.doMock("@/utils/fileToDataUrl", () => ({
  fileToDataUrl: vi.fn().mockResolvedValue("data:application/epub+zip;base64,abc123"),
}))

vi.doMock("@/components/BookEditFieldList/BookEditFieldList", () => ({
  BookEditFieldList: ({
    onUploadFormat,
  }: {
    onUploadFormat?: (params: { targetFormat?: string }) => Promise<{
      success: boolean
      format?: string
    }>
  }) => (
    <button
      data-testid="book-edit-modal-format-upload"
      type="button"
      onClick={() => {
        void onUploadFormat?.({ targetFormat: "EPUB" })
      }}
    >
      upload
    </button>
  ),
}))

vi.doMock("mobx-state-tree", () => ({
  getSnapshot: vi.fn(() => ({
    formats: ["EPUB", "PDF"],
    languages: [],
    langNames: {},
  })),
}))

vi.doMock("@/components/Button/Button", () => ({
  Button: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <button type="button" {...(props as object)}>
      {children}
    </button>
  ),
}))

vi.doMock("@/components/Forms/FormImageUploader", () => ({
  FormImageUploader: () => <div />,
}))

vi.doMock("@/components/HStack/HStack", () => ({
  HStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

vi.doMock("@/components/Heading/Heading", () => ({
  Heading: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

vi.doMock("./Body", () => ({
  Body: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

vi.doMock("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      close
    </button>
  ),
}))

vi.doMock("./Header", () => ({
  Header: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

vi.doMock("./ModalFooter", () => ({
  Footer: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

vi.doMock("./Root", () => ({
  Root: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

const mockSelectedBook = {
  id: 1,
  metaData: {
    formats: ["EPUB", "PDF"],
  },
  update: vi.fn(),
}

const mockSelectedLibrary = {
  id: "lib1",
  selectedBook: mockSelectedBook,
  fieldMetadataList: new Map(),
  tagBrowser: [],
}

let BookEditModal: typeof import("./BookEditModal").BookEditModal

beforeAll(async () => {
  ;({ BookEditModal } = await import("./BookEditModal"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("BookEditModal format upload wiring", () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    const stores = await import("@/models")
    ;(stores.useStores as unknown as vi.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
      },
    })

    vi.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: "replace.epub",
          uri: "file:///tmp/replace.epub",
          mimeType: "application/epub+zip",
        },
      ],
    } as unknown as DocumentPicker.DocumentPickerResult)
  })

  test("clicking format row in modal stores pending upload", async () => {
    const closeModal = vi.fn()

    const { container } = render(
      <BookEditModal
        modal={
          {
            closeModal,
            params: {
              imageUrl: "",
              selectedBook: mockSelectedBook as never,
              fieldMetadataList: new Map() as never,
              tagBrowser: [],
            },
          } as never
        }
      />,
    )

    await playBookEditModalFormatClickRunsUpload({
      canvasElement: container,
    })

    // Upload is now deferred - the format row triggers document picker and stores pending data
    // Verify DocumentPicker was called (the upload is stored, not sent immediately)
    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled()
  })
})
