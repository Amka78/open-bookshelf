import Constants from "expo-constants"

export function getAppVersion(): string | undefined {
  return Constants.expoConfig?.version
}
