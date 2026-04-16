import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { render, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const mockGetJobs = jest.fn()
const mockGetConversionStatus = jest.fn()
const mockUseStores = jest.fn()

mock.module("@/models", () => ({
  useStores: mockUseStores,
}))

mock.module("@/services/api", () => ({
  api: {
    getJobs: mockGetJobs,
    getConversionStatus: mockGetConversionStatus,
  },
}))

mock.module("@/components/Button/Button", () => ({
  Button: ({
    children,
    tx,
    onPress,
  }: {
    children?: ReactNode
    tx?: string
    onPress?: () => void
  }) => (
    <button type="button" onClick={onPress}>
      {children ?? tx}
    </button>
  ),
}))

mock.module("@/components/Heading/Heading", () => ({
  Heading: ({ children, tx }: { children?: ReactNode; tx?: string }) => <div>{children ?? tx}</div>,
}))

mock.module("@/components/Text/Text", () => ({
  Text: ({ children, tx }: { children?: ReactNode; tx?: string }) => <div>{children ?? tx}</div>,
}))

mock.module("@gluestack-ui/themed", () => {
  const Div = ({ children }: { children?: ReactNode }) => <div>{children}</div>
  return {
    HStack: Div,
    ScrollView: Div,
    VStack: Div,
    View: Div,
  }
})

mock.module("./Body", () => ({
  Body: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./CloseButton", () => ({
  CloseButton: ({ onPress }: { onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      close
    </button>
  ),
}))

mock.module("./Header", () => ({
  Header: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./ModalFooter", () => ({
  Footer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

mock.module("./Root", () => ({
  Root: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

let JobQueueModal: typeof import("./JobQueueModal").JobQueueModal

beforeAll(async () => {
  ;({ JobQueueModal } = await import("./JobQueueModal"))
})

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("JobQueueModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("shows tracked conversion jobs started from the convert modal", async () => {
    const trackedJob = {
      id: "lib1:42",
      jobId: 42,
      libraryId: "lib1",
      bookId: 1,
      bookTitle: "Queued Book",
      inputFormat: "EPUB",
      outputFormat: "AZW3",
      status: "running",
      percent: 0,
    }

    const calibreRootStore = {
      selectedLibrary: {
        id: "lib1",
      },
      getConversionJobsForLibrary: jest.fn(() => [trackedJob]),
      updateConversionJobRunning: jest.fn((_libraryId: string, _jobId: number, percent: number) => {
        trackedJob.percent = percent
      }),
      updateConversionJobFinished: jest.fn(),
    }

    mockUseStores.mockReturnValue({ calibreRootStore })
    mockGetJobs.mockResolvedValue({ kind: "ok", data: [] })
    mockGetConversionStatus.mockResolvedValue({
      kind: "ok",
      data: {
        running: true,
        percent: 0.4,
        msg: "Converting",
      },
    })

    const { getByText } = render(
      <JobQueueModal
        modal={
          {
            closeModal: jest.fn(),
            params: {},
          } as never
        }
      />,
    )

    await waitFor(() => {
      expect(getByText("Queued Book (EPUB -> AZW3)")).toBeTruthy()
    })

    expect(mockGetConversionStatus).toHaveBeenCalledWith("lib1", 42)
    expect(calibreRootStore.updateConversionJobRunning).toHaveBeenCalledWith(
      "lib1",
      42,
      0.4,
      "Converting",
    )
  })
})
