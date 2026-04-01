// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer"
import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
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
    get AuthenticationHeader() {
      return store.token ? api.getAuthHeaders() : undefined
    },
  }))
  .actions((store) => ({
    login(userId: string, password: string) {
      store.userId = userId
      store.password = password
      store.token = Buffer.from(`${userId}:${password}`, "utf-8").toString("base64")
      api.setCredentials(userId, password, store.token)
    },
    logout() {
      store.token = undefined
      store.userId = ""
      store.password = ""
      api.clearCredentials()
    },
    getHeader(url?: string) {
      if (store.isAuthenticated) {
        return api.getAuthHeaders(url)
      }
      return undefined
    },
  }))

export type AuthenticationStore = Instance<typeof AuthenticationStoreModel>
export type AuthenticationStoreSnapshot = SnapshotOut<typeof AuthenticationStoreModel>
