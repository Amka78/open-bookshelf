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

    store.setLibraryViewMode("grid", false)
    store.setLibraryViewMode("list", true)

    expect(store.getLibraryViewMode(false)).toBe("grid")
    expect(store.getLibraryViewMode(true)).toBe("list")
  })
})
