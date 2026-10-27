import {
  buildItemKey,
  normalizeTagQuery,
  parseTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"
import { beforeAll, describe, expect, test, vi } from "vitest"

vi.doMock("@/components", () => ({
  buildItemKey,
  normalizeTagQuery,
  parseTagQuery,
}))

let librarySearchState: typeof import("./librarySearchState")

beforeAll(async () => {
  librarySearchState = await import("./librarySearchState")
})

describe("librarySearchState", () => {
  test("parseQueryParts splits boolean search queries", () => {
    expect(librarySearchState.parseQueryParts("authors:=Tolkien OR formats:=EPUB")).toEqual([
      "authors:=Tolkien",
      "formats:=EPUB",
    ])
  })

  test("buildQueryFromParts applies per-item operators", () => {
    expect(
      librarySearchState.buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB", "rating:=5"], {
        "authors:tolkien": "OR",
        "formats:epub": "AND",
      }),
    ).toBe("authors:=Tolkien OR formats:=EPUB AND rating:=5")
  })

  test("edited search text clears the previous left menu selection", () => {
    const previouslySelected = normalizeTagQuery("authors:=Tolkien")

    const initialSelectedNames = librarySearchState.getLeftSideMenuSelectedNames("authors:=Tolkien")
    expect(
      initialSelectedNames.some((query) => normalizeTagQuery(query) === previouslySelected),
    ).toBe(true)

    const editedSelectedNames = librarySearchState.getLeftSideMenuSelectedNames("authors:=Tolk")
    expect(
      editedSelectedNames.some((query) => normalizeTagQuery(query) === previouslySelected),
    ).toBe(false)
  })

  test("isMenuDrivenSearchText returns true for tag-query-only search text", () => {
    expect(librarySearchState.isMenuDrivenSearchText("authors:=Tolkien OR formats:=EPUB")).toBe(
      true,
    )
  })

  test("isMenuDrivenSearchText returns false for free-text search text", () => {
    expect(librarySearchState.isMenuDrivenSearchText("tolkien")).toBe(false)
  })

  test("clicking left menu while free text is active resets to clicked query only", () => {
    expect(
      librarySearchState.getNextLeftSideMenuSelectionState({
        currentSearchText: "tolkien",
        clickedQuery: "authors:=Tolkien",
        itemOperators: {
          "formats:epub": "OR",
        },
      }),
    ).toEqual({
      nextQuery: "authors:=Tolkien",
      nextOperators: {},
      shouldResetMenuSettings: true,
    })
  })

  test("clicking left menu while menu-driven query is active preserves multi-select behavior", () => {
    expect(
      librarySearchState.getNextLeftSideMenuSelectionState({
        currentSearchText: "authors:=Tolkien",
        clickedQuery: "formats:=EPUB",
        itemOperators: {},
      }),
    ).toEqual({
      nextQuery: "authors:=Tolkien AND formats:=EPUB",
      nextOperators: {},
      shouldResetMenuSettings: false,
    })
  })
})
