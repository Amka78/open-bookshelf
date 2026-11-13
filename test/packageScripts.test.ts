import { beforeAll, describe as baseDescribe, expect, test as baseTest } from "vitest"
import { localizeTestRegistrar } from "./test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let packageJson: typeof import("../package.json")

beforeAll(async () => {
  packageJson = await import("../package.json")
})

describe("package scripts", () => {
  test("start はエントリを expoStart ラッパーに一本化し、dev-client はフラグで指定する", () => {
    expect(packageJson.default.scripts.start).toBe("bun scripts/expoStart.ts")
    expect(packageJson.default.scripts["start:dev-client"]).toBeUndefined()
    expect(packageJson.default.scripts["start:debug"]).toBeUndefined()
    expect(packageJson.default.scripts["start:perf"]).toBeUndefined()
    expect(packageJson.default.scripts["expo:start"]).toBeUndefined()
  })

  test("web 系の起動フラグは dev:web に集約し、Metro のみは web:metro として残す", () => {
    expect(packageJson.default.scripts["dev:web"]).toBe("bun scripts/devWeb.ts")
    expect(packageJson.default.scripts["web:metro"]).toBe("bunx expo start --web")
    expect(packageJson.default.scripts["debug:web"]).toBeUndefined()
    expect(packageJson.default.scripts["debug:web:perf"]).toBeUndefined()
    expect(packageJson.default.scripts["expo:web"]).toBeUndefined()
  })
})
