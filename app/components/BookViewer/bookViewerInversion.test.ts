import { describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { mapBookViewerIndex, resolveBookViewerInversionStrategy } from "./bookViewerInversion"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("bookViewerInversion", () => {
  test("web の single-page PDF では transform workaround を使わない", () => {
    expect(
      resolveBookViewerInversionStrategy({
        isInverted: true,
        isSinglePagePdfMode: true,
        platformOS: "web",
      }),
    ).toEqual({
      useReversedData: false,
      useTransformInvert: false,
    })
  })

  test("web の FlashList 表示では data reverse に切り替える", () => {
    expect(
      resolveBookViewerInversionStrategy({
        isInverted: true,
        isSinglePagePdfMode: false,
        platformOS: "web",
      }),
    ).toEqual({
      useReversedData: true,
      useTransformInvert: false,
    })
  })

  test("android の FlashList 表示では transform workaround を使う", () => {
    expect(
      resolveBookViewerInversionStrategy({
        isInverted: true,
        isSinglePagePdfMode: false,
        platformOS: "android",
      }),
    ).toEqual({
      useReversedData: false,
      useTransformInvert: true,
    })
  })

  test("reversed data 用に logical index と display index を相互変換できる", () => {
    expect(mapBookViewerIndex(0, 5, true)).toBe(4)
    expect(mapBookViewerIndex(1, 5, true)).toBe(3)
    expect(mapBookViewerIndex(4, 5, true)).toBe(0)
    expect(mapBookViewerIndex(2, 5, false)).toBe(2)
  })
})
