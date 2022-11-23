import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"

export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    baseUrl: types.maybe(types.string),
  })
  .actions((store) => ({
    async setUrl(baseUrl: string) {
      store.baseUrl = baseUrl
      api.setUrl(baseUrl)
    },
  }))

export interface SettingStore extends Instance<typeof SettingStoreModel> {}
export interface SettingStoreSnapshot extends SnapshotOut<typeof SettingStoreModel> {}
