import { beforeAll, describe, expect, jest, mock, test } from "bun:test"

const withAndroidManifestMock = jest.fn((config, action) => {
  return action(config)
})

mock.module("@expo/config-plugins", () => ({
  withAndroidManifest: (...args: Parameters<typeof withAndroidManifestMock>) =>
    withAndroidManifestMock(...args),
}))

let androidManifestPlugin: typeof import("../withAndroidMainActivityAttributes.js")

beforeAll(async () => {
  androidManifestPlugin = await import("../withAndroidMainActivityAttributes.js")
})

describe("withAndroidMainActivityAttributes", () => {
  test("disables Android force dark on the application manifest", async () => {
    const config = {
      modResults: {
        manifest: {
          application: [
            {
              $: {},
            },
          ],
        },
      },
    }

    const result = await androidManifestPlugin.default(config)
    expect(result.modResults.manifest.application[0].$["android:largeHeap"]).toBe("true")
    expect(result.modResults.manifest.application[0].$["android:forceDarkAllowed"]).toBe(
      "false",
    )
  })
})
