import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore" 
import { OpdsRootStore } from "./opds/OpdsRootStore"
import { SettingStoreModel } from "./SettingStore"
import { CalibreRootStore } from "./CalibreRootStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}), 
  settingStore: types.optional(SettingStoreModel, {}),
  opdsRootStore: types.optional(OpdsRootStore, {}),
  calibreRootStore: types.optional(CalibreRootStore, {}),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
