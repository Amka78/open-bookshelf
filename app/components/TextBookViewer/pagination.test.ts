import { describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  buildSpinePageOffsets,
  mapDisplayPageToSpineLocation,
  mapSpineLocationToDisplayPage,
  normalizeDisplayPageForReadingStyle,
} from "./pagination"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("TextBookViewer pagination", () => {
  test("builds book-level offsets from per-spine page counts", () => {
    expect(buildSpinePageOffsets(3, [4, 1, 2])).toEqual({
      offsets: [0, 4, 5],
      totalPages: 7,
    })
  })

  test("maps display pages back into spine-local locations", () => {
    expect(mapDisplayPageToSpineLocation(0, 3, [4, 1, 2])).toEqual({
      spineIndex: 0,
      pageInSpine: 0,
    })
    expect(mapDisplayPageToSpineLocation(4, 3, [4, 1, 2])).toEqual({
      spineIndex: 1,
      pageInSpine: 0,
    })
    expect(mapDisplayPageToSpineLocation(6, 3, [4, 1, 2])).toEqual({
      spineIndex: 2,
      pageInSpine: 1,
    })
  })

  test("maps spine-local locations into display pages", () => {
    expect(mapSpineLocationToDisplayPage({ spineIndex: 2, pageInSpine: 1 }, 3, [4, 1, 2])).toBe(6)
  })

  test("aligns spread reading modes to their visible start pages", () => {
    expect(normalizeDisplayPageForReadingStyle(3, 10, "facingPage")).toBe(2)
    expect(normalizeDisplayPageForReadingStyle(4, 10, "facingPageWithTitle")).toBe(3)
    expect(normalizeDisplayPageForReadingStyle(0, 10, "facingPageWithTitle")).toBe(0)
    expect(normalizeDisplayPageForReadingStyle(5, 10, "singlePage")).toBe(5)
  })
})
