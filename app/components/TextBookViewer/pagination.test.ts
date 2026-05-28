import { describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  buildSpinePageOffsets,
  estimateSpinePageCounts,
  mapDisplayPageToSpineLocation,
  mapProgressFractionToDisplayPage,
  mapProgressFractionToSpineLocation,
  mapSpineLocationToProgressFraction,
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

  test("estimates unmeasured spine page counts from measured spine lengths", () => {
    expect(estimateSpinePageCounts(3, [4, 0, 0], [100, 100, 200])).toEqual([4, 4, 8])
  })

  test("maps progress fractions into spine-local positions", () => {
    expect(mapProgressFractionToSpineLocation(0.75, 3, [100, 100, 200])).toEqual({
      spineIndex: 2,
      progressInSpine: 0.5,
    })
  })

  test("maps progress fractions into estimated display pages", () => {
    expect(mapProgressFractionToDisplayPage(0.75, 3, [4, 0, 0], [100, 100, 200])).toBe(12)
  })

  test("maps spine-local progress back to book-level progress fraction", () => {
    expect(
      mapSpineLocationToProgressFraction(
        { spineIndex: 2, progressInSpine: 0.5 },
        3,
        [100, 100, 200],
      ),
    ).toBe(0.75)
  })
})
