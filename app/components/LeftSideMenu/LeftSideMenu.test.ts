import { describe, expect, test } from "bun:test"

type QueryOperator = "AND" | "OR"
type CalibreFieldOperator = "=" | "~" | "!=" | "!~"

/** Mirrors buildItemKey from LeftSideMenu: "category:value" (no calibre op, lowercase) */
function buildItemKey(categoryKey: string, value: string): string {
  return `${categoryKey.trim().toLowerCase()}:${value.trim().toLowerCase()}`
}

function buildTagQuery(
  categoryKey: string,
  value: string,
  calibreOp: CalibreFieldOperator = "=",
): string {
  return `${categoryKey.trim().toLowerCase()}:${calibreOp}${value.trim()}`
}

function normalizeTagQuery(query: string): string | null {
  const sepIdx = query.indexOf(":")
  if (sepIdx <= 0) return null
  const cat = query.slice(0, sepIdx).trim().toLowerCase()
  let val = query.slice(sepIdx + 1).trim()
  // strip boolean operators appended after value
  const boolMatch = val.match(/\s+(and|or)\s+/i)
  if (boolMatch?.index !== undefined) val = val.slice(0, boolMatch.index).trim()
  // strip calibre op prefix
  val = val.replace(/^(!?[=~])/, "").trim().toLowerCase()
  if (!cat || !val) return null
  return `${cat}:=${val}`
}

function parseQueryParts(query: string): string[] {
  if (!query.trim()) return []
  return query.split(/ AND | OR /i).map((q) => q.trim()).filter(Boolean)
}

function playBuildTagQuery(
  categoryKey: string,
  value: string,
  calibreOp: CalibreFieldOperator = "=",
): string {
  return buildTagQuery(categoryKey, value, calibreOp)
}

function playToggleQuery(
  currentQuery: string,
  newQuery: string,
  itemOperators: Record<string, QueryOperator> = {},
): string {
  const current = currentQuery ? parseQueryParts(currentQuery) : []
  const normalizedNew = normalizeTagQuery(newQuery)
  const alreadySelected = current.some((q) => normalizeTagQuery(q) === normalizedNew)
  let nextParts: string[]
  if (alreadySelected) {
    nextParts = current.filter((q) => normalizeTagQuery(q) !== normalizedNew)
  } else {
    nextParts = [...current, newQuery.trim()]
  }
  return buildQueryFromParts(nextParts, itemOperators)
}

function playBuildSelectedNames(query: string): string[] {
  return parseQueryParts(query)
}

function playToggleItemOperator(current: QueryOperator): QueryOperator {
  return current === "AND" ? "OR" : "AND"
}

function nextCalibreOperator(current: CalibreFieldOperator): CalibreFieldOperator {
  const cycle: CalibreFieldOperator[] = ["=", "~", "!=", "!~"]
  return cycle[(cycle.indexOf(current) + 1) % cycle.length]
}

function buildQueryFromParts(
  parts: string[],
  itemOperators: Record<string, QueryOperator>,
): string {
  return parts.reduce((acc, part, i) => {
    if (i === 0) return part
    // key is itemKey of the previous part: "category:value" without calibre op
    const prevNorm = normalizeTagQuery(parts[i - 1])
    // Convert "category:=value" → "category:value" for itemKey lookup
    const prevKey = prevNorm ? prevNorm.replace(":=", ":") : parts[i - 1].trim().toLowerCase()
    const op = itemOperators[prevKey] ?? "AND"
    return `${acc} ${op} ${part}`
  }, "")
}

describe("LeftSideMenu multi-select", () => {
  describe("buildTagQuery with calibre operators", () => {
    test("builds exact match query (default)", () => {
      expect(playBuildTagQuery("authors", "Tolkien")).toBe("authors:=Tolkien")
    })

    test("builds contains query with ~", () => {
      expect(playBuildTagQuery("authors", "Tolkien", "~")).toBe("authors:~Tolkien")
    })

    test("builds not-equal query with !=", () => {
      expect(playBuildTagQuery("authors", "Tolkien", "!=")).toBe("authors:!=Tolkien")
    })

    test("builds not-contains query with !~", () => {
      expect(playBuildTagQuery("authors", "Tolkien", "!~")).toBe("authors:!~Tolkien")
    })

    test("trims whitespace in category key and value", () => {
      expect(playBuildTagQuery(" Authors ", " Tolkien ")).toBe("authors:=Tolkien")
    })
  })

  describe("buildItemKey", () => {
    test("returns category:value lowercase without calibre op", () => {
      expect(buildItemKey("authors", "Tolkien")).toBe("authors:tolkien")
    })

    test("trims and lowercases both parts", () => {
      expect(buildItemKey(" Authors ", " Tolkien, J.R.R. ")).toBe("authors:tolkien, j.r.r.")
    })
  })

  describe("nextCalibreOperator cycle", () => {
    test("= cycles to ~", () => expect(nextCalibreOperator("=")).toBe("~"))
    test("~ cycles to !=", () => expect(nextCalibreOperator("~")).toBe("!="))
    test("!= cycles to !~", () => expect(nextCalibreOperator("!=")).toBe("!~"))
    test("!~ cycles back to =", () => expect(nextCalibreOperator("!~")).toBe("="))
  })

  describe("normalizeTagQuery", () => {
    test("normalizes = operator query", () => {
      expect(normalizeTagQuery("authors:=Tolkien")).toBe("authors:=tolkien")
    })

    test("normalizes ~ operator query", () => {
      expect(normalizeTagQuery("authors:~Tolkien")).toBe("authors:=tolkien")
    })

    test("normalizes != operator query", () => {
      expect(normalizeTagQuery("authors:!=Tolkien")).toBe("authors:=tolkien")
    })

    test("normalizes !~ operator query", () => {
      expect(normalizeTagQuery("authors:!~Tolkien")).toBe("authors:=tolkien")
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
      expect(
        playToggleQuery("authors:=Tolkien AND formats:=EPUB", "authors:=Tolkien", {}),
      ).toBe("formats:=EPUB")
    })

    test("deselects regardless of calibre operator difference", () => {
      // authors was selected with =, toggled again with ~ → should deselect
      expect(playToggleQuery("authors:=Tolkien", "authors:~Tolkien")).toBe("")
    })

    test("deselecting the last query returns empty string", () => {
      expect(playToggleQuery("authors:=Tolkien", "authors:=Tolkien")).toBe("")
    })

    test("adding a third item with per-item operators (itemKey keyed)", () => {
      // keys are "authors:tolkien" and "formats:epub"
      const operators = { "authors:tolkien": "OR", "formats:epub": "AND" } as Record<string, "AND" | "OR">
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

  describe("buildQueryFromParts (itemKey-keyed operators)", () => {
    test("single part returns that part", () => {
      expect(buildQueryFromParts(["authors:=Tolkien"], {})).toBe("authors:=Tolkien")
    })

    test("two parts with AND default (no entry in operators)", () => {
      expect(buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB"], {})).toBe(
        "authors:=Tolkien AND formats:=EPUB",
      )
    })

    test("first item operator OR connects to second item (itemKey key)", () => {
      expect(
        buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB"], {
          "authors:tolkien": "OR",
        }),
      ).toBe("authors:=Tolkien OR formats:=EPUB")
    })

    test("three parts: first item AND, second item OR", () => {
      expect(
        buildQueryFromParts(["authors:=Tolkien", "formats:=EPUB", "rating:=5"], {
          "authors:tolkien": "AND",
          "formats:epub": "OR",
        }),
      ).toBe("authors:=Tolkien AND formats:=EPUB OR rating:=5")
    })

    test("calibre op in parts does not break operator lookup", () => {
      expect(
        buildQueryFromParts(["authors:~Tolkien", "formats:!=EPUB"], {
          "authors:tolkien": "OR",
        }),
      ).toBe("authors:~Tolkien OR formats:!=EPUB")
    })

    test("empty parts returns empty string", () => {
      expect(buildQueryFromParts([], {})).toBe("")
    })
  })
})

