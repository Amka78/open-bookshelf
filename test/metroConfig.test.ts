import { describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "./test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const metroConfigModule = require("../metro.config.js") as {
  __internals: {
    getExpoVariantPath: (resolvedPath: string) => string | null
  }
}

const { getExpoVariantPath } = metroConfigModule.__internals

describe("metro config", () => {
  test("拡張子がない解決結果では .expo を参照しない", () => {
    expect(getExpoVariantPath("/tmp/.expo")).toBeNull()
    expect(getExpoVariantPath("/tmp/.pnpm/deps/some-package/index")).toBeNull()
  })

  test("絶対パス以外は .expo バリアントへ変換しない", () => {
    expect(getExpoVariantPath("app/library/PDF/Pdf.tsx")).toBeNull()
  })

  test(".expo バリアント自身には再適用しない", () => {
    expect(getExpoVariantPath("/tmp/app/module.expo.ts")).toBeNull()
  })

  test("対象外拡張子は .expo バリアントへ変換しない", () => {
    expect(getExpoVariantPath("/tmp/app/app.json")).toBeNull()
  })

  test("通常ファイルは .expo バリアントへ変換する", () => {
    expect(getExpoVariantPath("/tmp/app/module.ts")).toBe("/tmp/app/module.expo.ts")
  })
})
