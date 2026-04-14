import { describe, expect, test } from "bun:test"
import { detectCoverImagePath } from "./bookImageCache"

describe("detectCoverImagePath", () => {
  test("returns null for empty path list", () => {
    expect(detectCoverImagePath([])).toBeNull()
  })

  test("uses raster_cover_name if present in path list", () => {
    const paths = ["page001.jpg", "cover.jpg", "page002.jpg"]
    expect(detectCoverImagePath(paths, "cover.jpg")).toBe("cover.jpg")
  })

  test("falls back to detecting 'cover' filename if raster_cover_name is null", () => {
    const paths = ["page001.jpg", "cover.jpg", "page002.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("cover.jpg")
  })

  test("falls back to detecting 'cover' filename if raster_cover_name is undefined", () => {
    const paths = ["page001.jpg", "cover.jpg", "page002.jpg"]
    expect(detectCoverImagePath(paths, undefined)).toBe("cover.jpg")
  })

  test("detects 'cover' case-insensitively", () => {
    const paths = ["page001.jpg", "Cover.jpg", "page002.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("Cover.jpg")
  })

  test("detects 'COVER' in uppercase", () => {
    const paths = ["page001.jpg", "COVER.png", "page002.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("COVER.png")
  })

  test("detects cover with various extensions", () => {
    expect(detectCoverImagePath(["page001.jpg", "cover.png", "page002.jpg"], null)).toBe("cover.png")
    expect(detectCoverImagePath(["page001.jpg", "cover.gif", "page002.jpg"], null)).toBe("cover.gif")
    expect(detectCoverImagePath(["page001.jpg", "cover.webp", "page002.jpg"], null)).toBe("cover.webp")
    expect(detectCoverImagePath(["page001.jpg", "cover.bmp", "page002.jpg"], null)).toBe("cover.bmp")
  })

  test("returns first image if no cover detected", () => {
    const paths = ["page001.jpg", "page002.jpg", "page003.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("page001.jpg")
  })

  test("returns first image if raster_cover_name not in path list", () => {
    const paths = ["page001.jpg", "page002.jpg", "page003.jpg"]
    expect(detectCoverImagePath(paths, "missing.jpg")).toBe("page001.jpg")
  })

  test("handles paths with directory structure", () => {
    const paths = ["images/page001.jpg", "images/cover.jpg", "images/page002.jpg"]
    expect(detectCoverImagePath(paths, "images/cover.jpg")).toBe("images/cover.jpg")
  })

  test("handles paths with directory structure and fallback", () => {
    const paths = ["images/page001.jpg", "images/cover.jpg", "images/page002.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("images/cover.jpg")
  })

  test("ignores non-image files when detecting cover", () => {
    const paths = ["page001.jpg", "cover.txt", "page002.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("page001.jpg")
  })

  test("handles single image list", () => {
    const paths = ["only-image.jpg"]
    expect(detectCoverImagePath(paths, null)).toBe("only-image.jpg")
    expect(detectCoverImagePath(paths, "only-image.jpg")).toBe("only-image.jpg")
  })
})
