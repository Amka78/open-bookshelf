import { describe, expect, test } from "vitest"

import type { TocItem } from "@/models/calibre"
import { hasNamedTocEntries } from "./toc"

function createToc(children: TocItem["children"]): TocItem {
  return { title: "Table of Contents", children }
}

function createEntry(title: string | undefined, dest: string): TocItem {
  return { title, dest, children: [] }
}

describe("hasNamedTocEntries", () => {
  test("returns false when the toc is missing", () => {
    expect(hasNamedTocEntries(null)).toBe(false)
    expect(hasNamedTocEntries(undefined)).toBe(false)
  })

  test("returns false when there are no children", () => {
    expect(hasNamedTocEntries(createToc([]))).toBe(false)
  })

  test("returns false when entries only have destinations", () => {
    expect(
      hasNamedTocEntries(
        createToc([
          createEntry(undefined, "page-1.xhtml"),
          createEntry("", "page-2.xhtml"),
          createEntry("   ", "page-3.xhtml"),
        ]),
      ),
    ).toBe(false)
  })

  test("returns true when an entry has a title", () => {
    expect(hasNamedTocEntries(createToc([createEntry("Chapter 1", "chapter-1.xhtml")]))).toBe(true)
  })

  test("returns true when only a nested entry has a title", () => {
    const nested: TocItem = {
      title: "Part 1",
      children: [createEntry("Chapter 1", "chapter-1.xhtml")],
    }

    expect(hasNamedTocEntries(createToc([nested]))).toBe(true)
  })
})
