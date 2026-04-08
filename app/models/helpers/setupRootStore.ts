/**
 * This file is where we do "rehydration" of your RootStore from AsyncStorage.
 * This lets you persist your state between app launches.
 *
 * Navigation state persistence is handled in navigationUtilities.tsx.
 *
 * Note that Fast Refresh doesn't play well with this file, so if you edit this,
 * do a full refresh of your app instead.
 *
 * @refresh reset
 */
import { api } from "@/services/api"
import * as storage from "@/utils/storage"
import { type IDisposer, applySnapshot, onSnapshot } from "mobx-state-tree"

import type { RootStore, RootStoreSnapshot } from "../RootStore"
/**
 * The key we'll be saving our state as within async storage.
 */
const ROOT_STATE_STORAGE_KEY = "root-v1"

/**
 * Setup the root state.
 */
let _disposer: IDisposer
export async function setupRootStore(rootStore: RootStore): Promise<{
  rootStore: RootStore
  restoredState: RootStoreSnapshot | undefined
  unsubscribe: () => void
}> {
  let restoredState: RootStoreSnapshot | undefined

  try {
    // load the last known state from AsyncStorage
    restoredState =
      ((await storage.load(ROOT_STATE_STORAGE_KEY)) as RootStoreSnapshot | undefined) ||
      ({} as RootStoreSnapshot)
    applySnapshot(rootStore, restoredState)

    // Re-apply API settings to the singleton — applySnapshot only updates MST
    // model data; it does not call the side-effectful setUrl / setAuthorization
    // helpers, so the apisauce instance must be re-configured explicitly.
    const { settingStore, authenticationStore } = rootStore
    if (settingStore.api.baseUrl) {
      api.setUrl(settingStore.api.baseUrl)
    }
    if (authenticationStore.userId && authenticationStore.password && authenticationStore.token) {
      api.setCredentials(
        authenticationStore.userId,
        authenticationStore.password,
        authenticationStore.token,
      )
    }
  } catch (e) {
    // if there's any problems loading, then inform the dev what happened
    if (__DEV__) {
      console.tron.error(e.message, null)
    }
  }

  // stop tracking state changes if we've already setup
  if (_disposer) _disposer()

  // track changes & save to AsyncStorage
  _disposer = onSnapshot(rootStore, (snapshot) => storage.save(ROOT_STATE_STORAGE_KEY, snapshot))

  const unsubscribe = () => {
    _disposer()
    _disposer = undefined
  }

  return { rootStore, restoredState, unsubscribe }
}
