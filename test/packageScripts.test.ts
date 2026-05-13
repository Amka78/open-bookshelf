import { beforeAll, describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "./test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let packageJson: typeof import("../package.json")

beforeAll(async () => {
  packageJson = await import("../package.json")
})

describe("package scripts", () => {
  test("start は Expo Go を起動する", () => {
    expect(packageJson.default.scripts.start).toBe("USE_EXPO_GO=true bunx expo start")
    expect(packageJson.default.scripts["start:debug"]).toBe(
      "EXPO_PUBLIC_LOG_LEVEL=debug USE_EXPO_GO=true bunx expo start",
    )
  })

  test("dev client 用の起動スクリプトは明示的に残す", () => {
    expect(packageJson.default.scripts["start:dev-client"]).toBe("bunx expo start --dev-client")
    expect(packageJson.default.scripts["start:debug:dev-client"]).toBe(
      "EXPO_PUBLIC_LOG_LEVEL=debug bunx expo start --dev-client",
    )
  })
})
