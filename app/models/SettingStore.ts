import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"

const ApiModel = types.model("ApiModel").props({
  baseUrl: types.maybe(types.string),
  initialPath: types.maybeNull(types.string),
})

export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    api: types.optional(ApiModel, {}),
  })
  .actions((store) => ({
    async setUrl(baseUrl: string) {
      if (baseUrl.match("/opds")) {
        store.api.baseUrl = baseUrl.replace("/opds", "")
        store.api.initialPath = "/opds"
        api.setUrl(store.api.baseUrl)
      } else {
        store.api.baseUrl = baseUrl
        api.setUrl(baseUrl)
      }
    },
  }))

export interface SettingStore extends Instance<typeof SettingStoreModel> {}
export interface SettingStoreSnapshot extends SnapshotOut<typeof SettingStoreModel> {}
