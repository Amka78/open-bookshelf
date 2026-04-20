import { describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { parseOcrToMetadata } from "./parseOcrToMetadata"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("parseOcrToMetadata", () => {
  test("extracts title, author, publisher, ISBN, and languages from cover text", () => {
    const result = parseOcrToMetadata({
      text: "The Great Adventure\nby Jane Doe\nOrbit Books\nISBN 978-1-23456-789-0",
      lines: [
        { text: "The Great Adventure", confidence: 98 },
        { text: "by Jane Doe", confidence: 96 },
        { text: "Orbit Books", confidence: 94 },
        { text: "ISBN 978-1-23456-789-0", confidence: 92 },
      ],
    })

    expect(result.mappedMetadata).toEqual({
      title: "The Great Adventure",
      authors: ["Jane Doe"],
      publisher: "Orbit Books",
      identifiers: {
        isbn: "9781234567890",
      },
    })
  })

  test("extracts series and detects Japanese script from OCR text", () => {
    const result = parseOcrToMetadata({
      text: "銀河の旅 Book 2",
      lines: [{ text: "銀河の旅 Book 2", confidence: 95 }],
    })

    expect(result.mappedMetadata.series).toBe("銀河の旅")
    expect(result.mappedMetadata.seriesIndex).toBe(2)
    expect(result.mappedMetadata.languages).toEqual(["ja"])
  })
})
