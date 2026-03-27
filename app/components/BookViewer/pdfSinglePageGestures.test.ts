import { describe, expect, test } from "bun:test"
import { resolveSinglePageGesture } from "./pdfSinglePageGestures"

describe("resolveSinglePageGesture", () => {
  test("LTR tap right half goes next", () => {
    expect(
      resolveSinglePageGesture({
        startX: 250,
        endX: 252,
        startY: 100,
        endY: 102,
        width: 300,
        pageDirection: "right",
      }),
    ).toBe("next")
  })

  test("LTR tap left half goes previous", () => {
    expect(
      resolveSinglePageGesture({
        startX: 40,
        endX: 41,
        startY: 100,
        endY: 100,
        width: 300,
        pageDirection: "right",
      }),
    ).toBe("previous")
  })

  test("RTL tap left half goes next", () => {
    expect(
      resolveSinglePageGesture({
        startX: 40,
        endX: 42,
        startY: 100,
        endY: 101,
        width: 300,
        pageDirection: "left",
      }),
    ).toBe("next")
  })

  test("LTR swipe left goes next", () => {
    expect(
      resolveSinglePageGesture({
        startX: 250,
        endX: 150,
        startY: 100,
        endY: 104,
        width: 300,
        pageDirection: "right",
      }),
    ).toBe("next")
  })

  test("RTL swipe right goes next", () => {
    expect(
      resolveSinglePageGesture({
        startX: 100,
        endX: 180,
        startY: 100,
        endY: 100,
        width: 300,
        pageDirection: "left",
      }),
    ).toBe("next")
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
      }),
    ).toBeNull()
  })
})
