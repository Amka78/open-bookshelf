import { api } from "@/services/api"
import { RootStoreModel } from "./RootStore"
import { SettingStoreModel } from "./SettingStore"

describe("Store models", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test("RootStoreModel creates optional child stores", () => {
    const store = RootStoreModel.create({})

    expect(store.authenticationStore).toBeDefined()
    expect(store.settingStore).toBeDefined()
    expect(store.opdsRootStore).toBeDefined()
    expect(store.calibreRootStore).toBeDefined()
  })

  test("CalibreRootStore tracks conversion jobs by library and updates their status", () => {
    const store = RootStoreModel.create({})

    store.calibreRootStore.addConversionJob({
      jobId: 12,
      libraryId: "main",
      bookId: 99,
      bookTitle: "Queued Book",
      inputFormat: "EPUB",
      outputFormat: "AZW3",
    })

    expect(store.calibreRootStore.getConversionJobsForLibrary("main")).toHaveLength(1)

    store.calibreRootStore.updateConversionJobRunning("main", 12, 0.4, "Converting")
    let [job] = store.calibreRootStore.getConversionJobsForLibrary("main")
    expect(job.percent).toBe(0.4)
    expect(job.status).toBe("running")

    store.calibreRootStore.updateConversionJobFinished({
      libraryId: "main",
      jobId: 12,
      ok: true,
      wasAborted: false,
      traceback: null,
      log: null,
      size: 1234,
      format: "AZW3",
    })

    ;[job] = store.calibreRootStore.getConversionJobsForLibrary("main")
    expect(job.status).toBe("done")
    expect(job.percent).toBe(1)
    expect(job.format).toBe("AZW3")
    expect(job.size).toBe(1234)
  })

  test("SettingStoreModel setConnectionSetting handles OPDS URL", async () => {
    const setUrl = jest.spyOn(api, "setUrl").mockImplementation(() => undefined)
    const store = SettingStoreModel.create({})

    await store.setConnectionSetting("https://example.com/opds", true)

    expect(store.api.baseUrl).toBe("https://example.com")
    expect(store.api.initialPath).toBe("/opds")
    expect(setUrl).toHaveBeenCalledWith("https://example.com")
  })

  test("SettingStoreModel clamps auto page interval", () => {
    const store = SettingStoreModel.create({})

    store.setAutoPageTurnIntervalMs(50)
    expect(store.autoPageTurnIntervalMs).toBe(100)

    store.setAutoPageTurnIntervalMs(1234.9)
    expect(store.autoPageTurnIntervalMs).toBe(1234)
  })

  test("SettingStoreModel uses list as the mobile library default and grid on large screens", () => {
    const store = SettingStoreModel.create({})

    expect(store.getLibraryViewMode(false)).toBe("list")
    expect(store.getLibraryViewMode(true)).toBe("grid")
  })

  test("SettingStoreModel stores library view mode separately for mobile and large screens", () => {
    const store = SettingStoreModel.create({})

    store.setLibraryViewMode("table", false)
    store.setLibraryViewMode("list", true)

    expect(store.getLibraryViewMode(false)).toBe("table")
    expect(store.getLibraryViewMode(true)).toBe("list")
  })
})
