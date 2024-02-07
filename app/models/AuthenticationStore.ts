import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Buffer } from "buffer"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    token: types.maybe(types.string),
    userId: types.optional(types.string, ""),
    password: types.optional(types.string, ""),
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.token
    },
  }))
  .actions((store) => ({
    login(userId: string, password: string) {
      store.userId = userId
      store.password = password
      store.token = Buffer.from(`${userId}:${password}`, "utf-8").toString("base64")
      api.setAuthorization(store.token)
    },
    logout() {
      store.token = undefined
      store.userId = ""
      store.password = ""
      api.clearAuthorization()
    },
    getHeader() {
      if (store.isAuthenticated) {
        return { Authorization: `Basic ${store.token}` }
      }
      return undefined
    },
  }))

export type AuthenticationStore = Instance<typeof AuthenticationStoreModel>
export type AuthenticationStoreSnapshot = SnapshotOut<typeof AuthenticationStoreModel>
