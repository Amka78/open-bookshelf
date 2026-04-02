import { describe, expect, test } from "bun:test"

import { resolveVisibleCoverTargets } from "./coverSelection"

describe("resolveVisibleCoverTargets", () => {
  test("returns single-page target for single page items", () => {
    expect(resolveVisibleCoverTargets(4, "left")).toEqual({
      isFacing: false,
      singlePage: 4,
    })
  })

  test("returns single-page target when spread contains only one page", () => {
    expect(resolveVisibleCoverTargets({ page1: 0 }, "left")).toEqual({
      isFacing: false,
      singlePage: 0,
    })
  })

  test("maps visible left and right pages for left page direction", () => {
    expect(resolveVisibleCoverTargets({ page1: 2, page2: 3 }, "left")).toEqual({
      isFacing: true,
      leftPage: 3,
      rightPage: 2,
    })
  })

  test("maps visible left and right pages for right page direction", () => {
    expect(resolveVisibleCoverTargets({ page1: 2, page2: 3 }, "right")).toEqual({
      isFacing: true,
      leftPage: 2,
      rightPage: 3,
    })
  })
})
