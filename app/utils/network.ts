import { Platform } from "react-native"

/**
 * Check if the device is currently connected to the network.
 * Uses navigator.onLine on web, and a simple fetch test on native platforms.
 */
export async function isNetworkAvailable(): Promise<boolean> {
  if (Platform.OS === "web") {
    return typeof navigator !== "undefined" && navigator.onLine
  }

  // On native platforms, try a simple fetch to a reliable endpoint
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}
