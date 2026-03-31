import { describe, expect, test } from "bun:test"
import { resolveSinglePageGesture } from "./pdfSinglePageGestures"

describe("resolveSinglePageGesture", () => {
  test("single page tap always goes next for right page direction", () => {
    expect(
      resolveSinglePageGesture({
        startX: 250,
        endX: 252,
        startY: 100,
        endY: 102,
        width: 300,
        pageDirection: "right",
        tapNavigationMode: "single",
      }),
    ).toBe("next")
  })

  test("single page tap always goes next for left page direction", () => {
    expect(
      resolveSinglePageGesture({
        startX: 40,
        endX: 41,
        startY: 100,
        endY: 100,
        width: 300,
        pageDirection: "left",
        tapNavigationMode: "single",
      }),
    ).toBe("next")
  })

  test("spread tap left half goes next for left page direction", () => {
    expect(
      resolveSinglePageGesture({
        startX: 40,
        endX: 42,
        startY: 100,
        endY: 101,
        width: 300,
        pageDirection: "left",
        tapNavigationMode: "spread",
      }),
    ).toBe("next")
  })

  test("spread tap right half goes previous for left page direction", () => {
    expect(
      resolveSinglePageGesture({
        startX: 260,
        endX: 262,
        startY: 100,
        endY: 101,
        width: 300,
        pageDirection: "left",
        tapNavigationMode: "spread",
      }),
    ).toBe("previous")
  })

  test("spread tap left half goes previous for right page direction", () => {
    expect(
      resolveSinglePageGesture({
        startX: 40,
        endX: 41,
        startY: 100,
        endY: 100,
        width: 300,
        pageDirection: "right",
        tapNavigationMode: "spread",
      }),
    ).toBe("previous")
  })

  test("spread tap right half goes next for right page direction", () => {
    expect(
      resolveSinglePageGesture({
        startX: 250,
        endX: 252,
        startY: 100,
        endY: 102,
        width: 300,
        pageDirection: "right",
        tapNavigationMode: "spread",
      }),
    ).toBe("next")
  })

  test("left page direction swipe left goes next", () => {
    expect(
      resolveSinglePageGesture({
        startX: 250,
        endX: 150,
        startY: 100,
        endY: 104,
        width: 300,
        pageDirection: "left",
        tapNavigationMode: "spread",
      }),
    ).toBe("next")
  })

  test("left page direction swipe right goes previous", () => {
    expect(
      resolveSinglePageGesture({
        startX: 100,
        endX: 180,
        startY: 100,
        endY: 100,
        width: 300,
        pageDirection: "left",
        tapNavigationMode: "spread",
      }),
    ).toBe("previous")
  })

  test("right page direction swipe right goes next", () => {
    expect(
      resolveSinglePageGesture({
        startX: 100,
        endX: 180,
        startY: 100,
        endY: 100,
        width: 300,
        pageDirection: "right",
        tapNavigationMode: "spread",
      }),
    ).toBe("next")
  })

  test("right page direction swipe left goes previous", () => {
    expect(
      resolveSinglePageGesture({
        startX: 250,
        endX: 150,
        startY: 100,
        endY: 104,
        width: 300,
        pageDirection: "right",
        tapNavigationMode: "spread",
      }),
    ).toBe("previous")
  })

  test("small drag returns no navigation", () => {
    expect(
      resolveSinglePageGesture({
        startX: 100,
        endX: 120,
        startY: 100,
        endY: 145,
        width: 300,
        pageDirection: "right",
        tapNavigationMode: "spread",
      }),
    ).toBeNull()
  })
})
