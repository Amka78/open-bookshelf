import { beforeAll, describe, expect, test, vi } from "vitest"

// plugin 本体 withAndroidMainActivityAttributes.js は CommonJS（require + module.exports）で、
// Expo が app.config.ts の文字列パスから require するため ESM 化できない。
// unit プロジェクトの commonjs() プラグインが require を ESM import へ書き換えるので、
// ホイスティングされる vi.mock で傍受できる。ファクトリが参照する spy は vi.hoisted で作る。
const { withAndroidManifestMock } = vi.hoisted(() => ({
  withAndroidManifestMock: vi.fn(
    (config: { modResults: unknown }, action: (c: { modResults: unknown }) => unknown) =>
      action(config),
  ),
}))

vi.mock("@expo/config-plugins", () => {
  const mod = {
    withAndroidManifest: (...args: Parameters<typeof withAndroidManifestMock>) =>
      withAndroidManifestMock(...args),
  }
  // commonjs() が require を default import へ書き換えるため default も必要。
  return { ...mod, default: mod }
})

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
    expect(result.modResults.manifest.application[0].$["android:forceDarkAllowed"]).toBe("false")
  })
})
