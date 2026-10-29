import {
  buildItemKey,
  buildTagQuery,
  normalizeTagQuery,
  parseTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"
import { beforeAll, describe, expect, test, vi } from "vitest"

vi.doMock("@/components", () => ({
  buildItemKey,
  buildTagQuery,
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

  describe("values with whitespace are quoted in tag queries", () => {
    test("buildTagQuery wraps whitespace-containing values in quotes", () => {
      expect(buildTagQuery("authors", "J.R.R. Tolkien")).toBe('authors:="J.R.R. Tolkien"')
      expect(buildTagQuery("series", "Book Series", "~")).toBe('series:~"Book Series"')
    })

    test("buildTagQuery leaves single-word values unquoted", () => {
      expect(buildTagQuery("authors", "Tolkien")).toBe("authors:=Tolkien")
      expect(buildTagQuery(" Authors ", " Tolkien ")).toBe("authors:=Tolkien")
    })

    test("parseTagQuery strips wrapping quotes from the value", () => {
      expect(parseTagQuery('authors:="J.R.R. Tolkien"')).toEqual({
        categoryKey: "authors",
        value: "J.R.R. Tolkien",
      })
      expect(parseTagQuery("authors:=Tolkien")).toEqual({
        categoryKey: "authors",
        value: "Tolkien",
      })
    })

    test("normalizeTagQuery treats quoted and unquoted values identically", () => {
      expect(normalizeTagQuery('authors:="J.R.R. Tolkien"')).toBe("authors:=j.r.r. tolkien")
      expect(normalizeTagQuery("authors:=J.R.R. Tolkien")).toBe("authors:=j.r.r. tolkien")
    })

    test("itemKey is identical for quoted and unquoted queries (operator consistency)", () => {
      const quoted = parseTagQuery('authors:="J.R.R. Tolkien"')
      const unquoted = parseTagQuery("authors:=J.R.R. Tolkien")
      expect(buildItemKey(quoted!.categoryKey, quoted!.value)).toBe("authors:j.r.r. tolkien")
      expect(buildItemKey(unquoted!.categoryKey, unquoted!.value)).toBe("authors:j.r.r. tolkien")
    })

    test("selecting an author with whitespace then another filter keeps both, and deselect works", () => {
      // 1回目: スペース入り著者を選択（引用符付きクエリになる）
      const first = librarySearchState.getNextLeftSideMenuSelectionState({
        currentSearchText: "",
        clickedQuery: buildTagQuery("authors", "J.R.R. Tolkien"),
        itemOperators: {},
      })
      expect(first.nextQuery).toBe('authors:="J.R.R. Tolkien"')
      expect(first.shouldResetMenuSettings).toBe(false)

      // 2回目: 別フィルタを追加（壊れたクエリに連結されない）
      const second = librarySearchState.getNextLeftSideMenuSelectionState({
        currentSearchText: first.nextQuery,
        clickedQuery: buildTagQuery("format", "EPUB"),
        itemOperators: {},
      })
      expect(second.nextQuery).toBe('authors:="J.R.R. Tolkien" AND formats:=EPUB')

      // 3回目: 同じ著者を再クリックで解除できる（引用符あり/なしが正規化で一致）
      const third = librarySearchState.getNextLeftSideMenuSelectionState({
        currentSearchText: second.nextQuery,
        clickedQuery: buildTagQuery("authors", "J.R.R. Tolkien"),
        itemOperators: {},
      })
      expect(third.nextQuery).toBe("formats:=EPUB")
    })
  })
})
