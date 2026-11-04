import { describe, expect, test } from "vitest"
import { isAllowedCalibreHost, parseAllowedCalibreHosts } from "../../src-electrobun/calibreProxy"

describe("parseAllowedCalibreHosts", () => {
  test("returns an empty list when unset", () => {
    expect(parseAllowedCalibreHosts(undefined)).toEqual([])
    expect(parseAllowedCalibreHosts("")).toEqual([])
  })

  test("normalizes schemes, paths and whitespace", () => {
    expect(
      parseAllowedCalibreHosts(" https://Calibre.Example.com:8080/path , 192.168.1.11 "),
    ).toEqual(["calibre.example.com:8080", "192.168.1.11"])
  })
})

describe("isAllowedCalibreHost", () => {
  test("allows any host when the list is empty", () => {
    expect(isAllowedCalibreHost(new URL("http://any.example.com/x"), [])).toBe(true)
  })

  test("matches host:port and hostname", () => {
    const target = new URL("http://calibre.example.com:8080/x")

    expect(isAllowedCalibreHost(target, ["calibre.example.com:8080"])).toBe(true)
    expect(isAllowedCalibreHost(target, ["calibre.example.com"])).toBe(true)
    expect(isAllowedCalibreHost(target, ["other.example.com"])).toBe(false)
  })

  test("matches the IP address form", () => {
    expect(isAllowedCalibreHost(new URL("http://192.168.1.11:8081/x"), ["192.168.1.11"])).toBe(true)
    expect(isAllowedCalibreHost(new URL("http://192.168.1.11:8081/x"), ["192.168.1.12"])).toBe(
      false,
    )
  })
})
