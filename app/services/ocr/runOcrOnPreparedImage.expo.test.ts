import { beforeAll, describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { ExpoGoOcrUnavailableError } from "./errors"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let runOcrOnPreparedImage: typeof import("./runOcrOnPreparedImage.expo").runOcrOnPreparedImage

beforeAll(async () => {
  ;({ runOcrOnPreparedImage } = await import("./runOcrOnPreparedImage.expo"))
})

describe("runOcrOnPreparedImage.expo", () => {
  test("Expo Go では OCR unavailable error を投げる", async () => {
    await expect(runOcrOnPreparedImage("file:///cover.jpg", ["ja"])).rejects.toBeInstanceOf(
      ExpoGoOcrUnavailableError,
    )
  })
})
