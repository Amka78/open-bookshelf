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

const mockGetConversionStatus = jest.fn()
const mockUseStores = jest.fn()

mock.module("@/models", () => ({
  useStores: mockUseStores,
}))

mock.module("@/services/api", () => ({
  api: {
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

function createTrackedJob(overrides?: Record<string, unknown>) {
  return {
    id: "lib1:42",
    jobId: 42,
    libraryId: "lib1",
    bookId: 1,
    bookTitle: "Queued Book",
    inputFormat: "EPUB",
    outputFormat: "AZW3",
    status: "running",
    percent: 0,
    ...overrides,
  }
}

function createCalibreRootStore(trackedJobs: ReturnType<typeof createTrackedJob>[]) {
  return {
    selectedLibrary: { id: "lib1" },
    getConversionJobsForLibrary: jest.fn(() => trackedJobs),
    updateConversionJobRunning: jest.fn(
      (_libraryId: string, _jobId: number, percent: number, _msg: string | null) => {
        const job = trackedJobs.find((j) => j.jobId === _jobId)
        if (job) job.percent = percent
      },
    ),
    updateConversionJobFinished: jest.fn(
      (params: { jobId: number; ok: boolean; wasAborted: boolean }) => {
        const job = trackedJobs.find((j) => j.jobId === params.jobId)
        if (job) {
          job.status = params.ok ? "done" : params.wasAborted ? "aborted" : "failed"
          if (params.ok) job.percent = 1
        }
      },
    ),
  }
}

function renderJobQueueModal() {
  return render(
    <JobQueueModal
      modal={{ closeModal: jest.fn(), params: {} } as never}
    />,
  )
}

describe("JobQueueModal", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("shows tracked conversion jobs started from the convert modal", async () => {
    const trackedJob = createTrackedJob()
    const calibreRootStore = createCalibreRootStore([trackedJob])

    mockUseStores.mockReturnValue({ calibreRootStore })
    mockGetConversionStatus.mockResolvedValue({
      kind: "ok",
      data: {
        running: true,
        percent: 0.4,
        msg: "Converting",
      },
    })

    const { getByText } = renderJobQueueModal()

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

  test("marks job as failed when conversion/status returns 404 (expired)", async () => {
    const trackedJob = createTrackedJob()
    const calibreRootStore = createCalibreRootStore([trackedJob])

    mockUseStores.mockReturnValue({ calibreRootStore })
    mockGetConversionStatus.mockResolvedValue({ kind: "not-found" })

    renderJobQueueModal()

    await waitFor(() => {
      expect(calibreRootStore.updateConversionJobFinished).toHaveBeenCalledWith({
        libraryId: "lib1",
        jobId: 42,
        ok: false,
        wasAborted: false,
        traceback: null,
        log: null,
      })
    })
  })

  test("shows completed job with done status", async () => {
    const trackedJob = createTrackedJob({ status: "done", percent: 1 })
    const calibreRootStore = createCalibreRootStore([trackedJob])

    mockUseStores.mockReturnValue({ calibreRootStore })

    const { getByText } = renderJobQueueModal()

    await waitFor(() => {
      expect(getByText("Queued Book (EPUB -> AZW3)")).toBeTruthy()
      expect(getByText("jobQueue.done")).toBeTruthy()
    })

    // Done jobs should not be polled
    expect(mockGetConversionStatus).not.toHaveBeenCalled()
  })

  test("updates job to done when conversion finishes", async () => {
    const trackedJob = createTrackedJob()
    const calibreRootStore = createCalibreRootStore([trackedJob])

    mockUseStores.mockReturnValue({ calibreRootStore })
    mockGetConversionStatus.mockResolvedValue({
      kind: "ok",
      data: {
        running: false,
        ok: true,
        was_aborted: false,
        traceback: "",
        log: "",
        size: 12345,
        fmt: "azw3",
      },
    })

    renderJobQueueModal()

    await waitFor(() => {
      expect(calibreRootStore.updateConversionJobFinished).toHaveBeenCalledWith({
        libraryId: "lib1",
        jobId: 42,
        ok: true,
        wasAborted: false,
        traceback: "",
        log: "",
        size: 12345,
        format: "azw3",
      })
    })
  })

  test("shows no jobs message when queue is empty", async () => {
    const calibreRootStore = createCalibreRootStore([])

    mockUseStores.mockReturnValue({ calibreRootStore })

    const { getByText } = renderJobQueueModal()

    await waitFor(() => {
      expect(getByText("jobQueue.noJobs")).toBeTruthy()
    })
  })
})
