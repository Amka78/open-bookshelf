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
  })
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
  }))

export type SettingStore = Instance<typeof SettingStoreModel>
export type SettingStoreSnapshot = SnapshotOut<typeof SettingStoreModel>
