import { type Instance, type SnapshotOut, types } from "mobx-state-tree";
import { api } from "../services/api";

const ApiModel = types.model("ApiModel").props({
  baseUrl: types.maybe(types.string),
  initialPath: types.maybeNull(types.string),
  isOpds: types.maybe(types.boolean),
});

export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    api: types.optional(ApiModel, {}),
    autoPageTurnIntervalMs: types.optional(types.number, 3000),
  })
  .actions((store) => ({
    async setConnectionSetting(baseUrl: string, type: boolean) {
      if (type) {
        store.api.baseUrl = baseUrl.replace("/opds", "");
        store.api.initialPath = "/opds";
        api.setUrl(store.api.baseUrl);
      } else {
        store.api.baseUrl = baseUrl;
        api.setUrl(baseUrl);
      }
    },
    setAutoPageTurnIntervalMs(intervalMs: number) {
      if (!Number.isFinite(intervalMs)) return;
      store.autoPageTurnIntervalMs = Math.max(100, Math.floor(intervalMs));
    },
  }));

export type SettingStore = Instance<typeof SettingStoreModel>;
export type SettingStoreSnapshot = SnapshotOut<typeof SettingStoreModel>;
