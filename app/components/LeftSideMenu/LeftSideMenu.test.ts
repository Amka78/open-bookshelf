import { describe, expect, test } from "bun:test"

type QueryOperator = "AND" | "OR"

function playBuildTagQuery(categoryKey: string, value: string): string {
  return `${categoryKey.trim().toLowerCase()}:=${value.trim()}`
}

function parseQueryParts(query: string): string[] {
  if (!query.trim()) return []
  return query.split(/ AND | OR /i).map((q) => q.trim()).filter(Boolean)
}

function playToggleQuery(
  currentQuery: string,
  newQuery: string,
  itemOperators: Record<string, QueryOperator> = {},
): string {
  const current = currentQuery ? parseQueryParts(currentQuery) : []
  const normalizedNew = newQuery.trim().toLowerCase()
  const alreadySelected = current.some((q) => q.toLowerCase() === normalizedNew)
  const nextParts = alreadySelected
    ? current.filter((q) => q.toLowerCase() !== normalizedNew)
    : [...current, newQuery.trim()]
  return buildQueryFromParts(nextParts, itemOperators)
}

function playBuildSelectedNames(query: string): string[] {
  return parseQueryParts(query)
}

function playToggleItemOperator(current: QueryOperator): QueryOperator {
  return current === "AND" ? "OR" : "AND"
}

function buildQueryFromParts(
  parts: string[],
  itemOperators: Record<string, QueryOperator>,
): string {
  return parts.reduce((acc, part, i) => {
    if (i === 0) return part
    const op = itemOperators[parts[i - 1].trim().toLowerCase()] ?? "AND"
    return `${acc} ${op} ${part}`
  }, "")
}

describe("LeftSideMenu multi-select", () => {
  describe("playBuildTagQuery", () => {
    test("builds a normalized tag query", () => {
      expect(playBuildTagQuery("authors", "Tolkien")).toBe("authors:=Tolkien")
    })

    test("trims whitespace in category key and value", () => {
      expect(playBuildTagQuery(" Authors ", " Tolkien ")).toBe("authors:=Tolkien")
    })
  })

  describe("playToggleQuery (no operators / default AND)", () => {
    test("adds a query when none selected", () => {
      expect(playToggleQuery("", "authors:=Tolkien")).toBe("authors:=Tolkien")
    })

    test("adds a second query with AND by default (no itemOperators entry)", () => {
      expect(playToggleQuery("authors:=Tolkien", "formats:=EPUB")).toBe(
        "authors:=Tolkien AND formats:=EPUB",
      )
    })

    test("removes a query that is already selected (deselect)", () => {
      // "authors:=tolkien" is first item, its operator was "AND" connecting to "formats:=EPUB"
      // After deselecting authors, only formats remains → no operator needed
      expect(
        playToggleQuery(
          "authors:=Tolkien AND formats:=EPUB",
          "authors:=tolkien",
          {},
        ),
      ).toBe("formats:=EPUB")
    })

    test("deselecting the last query returns empty string", () => {
      expect(playToggleQuery("authors:=Tolkien", "Authors:=Tolkien")).toBe("")
    })

    test("adding a third item with per-item operators (keyed by preceding item)", () => {
      // "authors:=tolkien" has OR → connects A to B as OR
      // "formats:=epub" has AND → connects B to C as AND
      const operators = { "authors:=tolkien": "OR", "formats:=epub": "AND" } as Record<string, "AND" | "OR">
      expect(
        playToggleQuery("authors:=Tolkien OR formats:=EPUB", "rating:=5", operators),
      ).toBe("authors:=Tolkien OR formats:=EPUB AND rating:=5")
    })
  })

  describe("playBuildSelectedNames", () => {
    test("returns empty array for empty query", () => {
      expect(playBuildSelectedNames("")).toEqual([])
    })

    test("returns single item array for single query", () => {
      expect(playBuildSelectedNames("authors:=Tolkien")).toEqual(["authors:=Tolkien"])
    })

    test("splits AND-joined queries into array", () => {
      expect(playBuildSelectedNames("authors:=Tolkien AND formats:=EPUB")).toEqual([
        "authors:=Tolkien",
        "formats:=EPUB",
      ])
    })

    test("splits OR-joined queries into array", () => {
      expect(playBuildSelectedNames("authors:=Tolkien OR formats:=EPUB")).toEqual([
        "authors:=Tolkien",
        "formats:=EPUB",
      ])
    })

    test("filters out empty segments", () => {
      expect(playBuildSelectedNames("  ")).toEqual([])
    })
  })

  describe("playToggleItemOperator", () => {
    test("toggles AND to OR", () => {
      expect(playToggleItemOperator("AND")).toBe("OR")
    })

    test("toggles OR to AND", () => {
      expect(playToggleItemOperator("OR")).toBe("AND")
    })
  })

  describe("buildQueryFromParts", () => {
    test("single part returns that part", () => {
      expect(buildQueryFromParts(["authors:=Tolkien"], {})).toBe("authors:=Tolkien")
    })

    test("two parts with AND default (no entry in operators)", () => {
      expect(buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB"], {})).toBe(
        "authors:=Tolkien AND formats:=EPUB",
      )
    })

    test("first item operator OR connects to second item", () => {
      expect(
        buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB"], {
          "authors:=tolkien": "OR",
        }),
      ).toBe("authors:=Tolkien OR formats:=EPUB")
    })

    test("three parts: first item AND, second item OR", () => {
      expect(
        buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB", "rating:=5"], {
          "authors:=tolkien": "AND",
          "formats:=epub": "OR",
        }),
      ).toBe("authors:=Tolkien AND formats:=EPUB OR rating:=5")
    })

    test("empty parts returns empty string", () => {
      expect(buildQueryFromParts([], {})).toBe("")
    })
  })
})
