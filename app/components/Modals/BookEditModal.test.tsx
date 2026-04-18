import {
  describe as baseDescribe,
  test as baseTest,
  beforeAll,
  beforeEach,
  expect,
  jest,
  mock,
} from "bun:test"
import { render } from "@testing-library/react"
import * as DocumentPicker from "expo-document-picker"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { playBookEditModalFormatClickRunsUpload } from "./bookEditModalStoryPlay"

mock.module("@/utils/fileToDataUrl", () => ({
  fileToDataUrl: jest.fn().mockResolvedValue("data:application/epub+zip;base64,abc123"),
}))

mock.module("@/components/BookEditFieldList/BookEditFieldList", () => ({
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

mock.module("mobx-state-tree", () => ({
  getSnapshot: jest.fn(() => ({
    formats: ["EPUB", "PDF"],
    languages: [],
    langNames: {},
  })),
}))

mock.module("@/components/Button/Button", () => ({
  Button: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <button type="button" {...(props as object)}>
      {children}
    </button>
  ),
}))

mock.module("@/components/Forms/FormImageUploader", () => ({
  FormImageUploader: () => <div />,
}))

mock.module("@/components/HStack/HStack", () => ({
  HStack: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("./Body", () => ({
  Body: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      close
    </button>
  ),
}))

mock.module("./Header", () => ({
  Header: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("./ModalFooter", () => ({
  Footer: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

mock.module("./Root", () => ({
  Root: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <div {...(props as object)}>{children}</div>
  ),
}))

const mockSelectedBook = {
  id: 1,
  metaData: {
    formats: ["EPUB", "PDF"],
  },
  update: jest.fn(),
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
    jest.clearAllMocks()

    const stores = await import("@/models")
    ;(stores.useStores as unknown as jest.Mock).mockReturnValue({
      calibreRootStore: {
        selectedLibrary: mockSelectedLibrary,
      },
    })

    jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
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
    const closeModal = jest.fn()

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
