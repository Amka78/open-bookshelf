import { describe, expect, test } from "bun:test"
import { normalizeTagQuery } from "@/components/LeftSideMenu/LeftSideMenu"
import {
  buildQueryFromParts,
  getLeftSideMenuSelectedNames,
  getNextLeftSideMenuSelectionState,
  isMenuDrivenSearchText,
  parseQueryParts,
} from "./librarySearchState"

describe("librarySearchState", () => {
  test("parseQueryParts splits boolean search queries", () => {
    expect(parseQueryParts("authors:=Tolkien OR formats:=EPUB")).toEqual([
      "authors:=Tolkien",
      "formats:=EPUB",
    ])
  })

  test("buildQueryFromParts applies per-item operators", () => {
    expect(
      buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB", "rating:=5"], {
        "authors:tolkien": "OR",
        "formats:epub": "AND",
      }),
    ).toBe("authors:=Tolkien OR formats:=EPUB AND rating:=5")
  })

  test("edited search text clears the previous left menu selection", () => {
    const previouslySelected = normalizeTagQuery("authors:=Tolkien")

    const initialSelectedNames = getLeftSideMenuSelectedNames("authors:=Tolkien")
    expect(
      initialSelectedNames.some((query) => normalizeTagQuery(query) === previouslySelected),
    ).toBe(true)

    const editedSelectedNames = getLeftSideMenuSelectedNames("authors:=Tolk")
    expect(
      editedSelectedNames.some((query) => normalizeTagQuery(query) === previouslySelected),
    ).toBe(false)
  })

  test("isMenuDrivenSearchText returns true for tag-query-only search text", () => {
    expect(isMenuDrivenSearchText("authors:=Tolkien OR formats:=EPUB")).toBe(true)
  })

  test("isMenuDrivenSearchText returns false for free-text search text", () => {
    expect(isMenuDrivenSearchText("tolkien")).toBe(false)
  })

  test("clicking left menu while free text is active resets to clicked query only", () => {
    expect(
      getNextLeftSideMenuSelectionState({
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
      getNextLeftSideMenuSelectionState({
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
