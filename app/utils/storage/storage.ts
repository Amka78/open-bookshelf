import AsyncStorage from "@react-native-async-storage/async-storage"

import {
  isElectrobun,
  storageClear as clearInElectrobun,
  storageGet as getInElectrobun,
  storageRemove as removeInElectrobun,
  storageSet as setInElectrobun,
} from "@/utils/electrobunBridge"

// Electrobun では WebView の localStorage（AsyncStorage の Web 実装）が
// ランダムポート由来の origin 単位で起動をまたげないため、メインプロセスの
// ユーザーデータ領域へファイル保存する。他のプラットフォーム（Android/iOS は
// AsyncStorage ネイティブ、Web は固定オリジンの localStorage）は従来どおり。
function useElectrobunStorage(): boolean {
  return isElectrobun() && getInElectrobun !== undefined
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    if (useElectrobunStorage()) {
      return await getInElectrobun(key)
    }
    return await AsyncStorage.getItem(key)
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    if (useElectrobunStorage()) {
      await setInElectrobun(key, value)
    } else {
      await AsyncStorage.setItem(key, value)
    }
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load(key: string): Promise<unknown> {
  try {
    const almostThere = useElectrobunStorage()
      ? await getInElectrobun(key)
      : await AsyncStorage.getItem(key)
    if (almostThere === null) return null
    return JSON.parse(almostThere)
  } catch {
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: unknown): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value)
    if (useElectrobunStorage()) {
      await setInElectrobun(key, serialized)
    } else {
      await AsyncStorage.setItem(key, serialized)
    }
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export async function remove(key: string): Promise<void> {
  try {
    if (useElectrobunStorage()) {
      await removeInElectrobun(key)
    } else {
      await AsyncStorage.removeItem(key)
    }
  } catch {}
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<void> {
  try {
    if (useElectrobunStorage()) {
      await clearInElectrobun()
    } else {
      await AsyncStorage.clear()
    }
  } catch {}
}
