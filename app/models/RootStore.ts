import { type Instance, type SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { CalibreRootStore } from "./CalibreRootStore"
import { SettingStoreModel } from "./SettingStore"
import { OpdsRootStore } from "./opds/OpdsRootStore"

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
export type RootStore = Instance<typeof RootStoreModel>
/**
 * The data of a RootStore.
 */
export type RootStoreSnapshot = SnapshotOut<typeof RootStoreModel>
