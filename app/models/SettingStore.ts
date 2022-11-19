import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"

export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    baseUrl: types.maybe(types.string),
  })
  .views((store) => ({
    /*get isAuthenticated() {
      return !!store.authToken
    },
    get validationErrors() {
      return {
        authEmail: (function () {
          if (store.authEmail.length === 0) return "can't be blank"
          if (store.authEmail.length < 6) return "must be at least 6 characters"
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.authEmail))
            return "must be a valid email address"
          return ""
        })(),
        authPassword: (function () {
          if (store.authPassword.length === 0) return "can't be blank"
          if (store.authPassword.length < 6) return "must be at least 6 characters"
          return ""
        })(),
      }
    }, */
  }))
  .actions((store) => ({
    async connect(baseUrl: string) {
      store.baseUrl = baseUrl
      api.setUrl(baseUrl)
      await api.connect()
    },
  }))

export interface SettingStore extends Instance<typeof SettingStoreModel> {}
export interface SettingStoreSnapshot extends SnapshotOut<typeof SettingStoreModel> {}

// @demo remove-file
