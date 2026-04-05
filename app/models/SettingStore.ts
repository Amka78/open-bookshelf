import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"

const ApiModel = types.model("ApiModel").props({
  baseUrl: types.maybe(types.string),
  initialPath: types.maybeNull(types.string),
  isOpds: types.maybe(types.boolean),
})

export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    api: types.optional(ApiModel, {}),
    autoPageTurnIntervalMs: types.optional(types.number, 3000),
    preferredFormat: types.optional(types.maybeNull(types.string), null),
    dateDisplayFormat: types.optional(types.string, "YYYY-MM-DD"),
    booksPerPage: types.optional(types.number, 50),
    recentSearches: types.optional(types.array(types.string), []),
    viewerFontSizePt: types.optional(types.number, 16),
    viewerTheme: types.optional(
      types.union(
        types.literal("default"),
        types.literal("sepia"),
        types.literal("dark"),
      ),
      "default",
    ),
    readStatuses: types.optional(types.map(types.string), {}),
  })
  .views((store) => ({
    getReadStatus(libraryId: string, bookId: number): string | undefined {
      return store.readStatuses.get(`${libraryId}:${bookId}`)
    },
  }))
  .actions((store) => ({
    async setConnectionSetting(baseUrl: string, type: boolean) {
      if (type) {
        store.api.baseUrl = baseUrl.replace("/opds", "")
        store.api.initialPath = "/opds"
        api.setUrl(store.api.baseUrl)
      } else {
        store.api.baseUrl = baseUrl
        api.setUrl(baseUrl)
      }
    },
    setAutoPageTurnIntervalMs(intervalMs: number) {
      if (!Number.isFinite(intervalMs)) return
      store.autoPageTurnIntervalMs = Math.max(100, Math.floor(intervalMs))
    },
    setPreferredFormat(format: string | null) {
      store.preferredFormat = format
    },
    setDateDisplayFormat(fmt: string) {
      store.dateDisplayFormat = fmt
    },
    setBooksPerPage(n: number) {
      store.booksPerPage = Math.max(10, Math.min(200, n))
    },
    addRecentSearch(query: string) {
      const trimmed = query.trim()
      if (!trimmed || trimmed.length < 2) return
      const filtered = store.recentSearches.filter((s) => s !== trimmed)
      store.recentSearches.replace([trimmed, ...filtered].slice(0, 10))
    },
    setViewerFontSizePt(pt: number) {
      store.viewerFontSizePt = Math.max(10, Math.min(28, pt))
    },
    setViewerTheme(theme: "default" | "sepia" | "dark") {
      store.viewerTheme = theme
    },
    setReadStatus(
      libraryId: string,
      bookId: number,
      status: "want-to-read" | "reading" | "finished" | null,
    ) {
      const key = `${libraryId}:${bookId}`
      if (status === null) {
        store.readStatuses.delete(key)
      } else {
        store.readStatuses.set(key, status)
      }
    },
  }))

export type SettingStore = Instance<typeof SettingStoreModel>
export type SettingStoreSnapshot = SnapshotOut<typeof SettingStoreModel>
