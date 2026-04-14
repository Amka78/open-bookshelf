import { describe, expect, test } from "bun:test"
import { buildComicImageList } from "./buildComicImageList"
import type { ImageFileType } from "@/services/api/api.types"

describe("buildComicImageList", () => {
  const createImageFile = (mimetype = "image/jpeg"): ImageFileType => ({
    is_virtualized: false,
    size: 100000,
    mimetype,
    is_html: false,
  })

  test("returns empty array for empty files object", () => {
    const result = buildComicImageList({})
    expect(result).toEqual([])
  })

  test("extracts only image files, excludes HTML", () => {
    const files = {
      "cover.jpg": createImageFile("image/jpeg"),
      "page001.jpg": createImageFile("image/jpeg"),
      "wrapper.xhtml": {
        is_virtualized: false,
        size: 5000,
        mimetype: "application/xhtml+xml",
        is_html: true,
        length: 100,
        has_maths: false,
        anchor_map: [],
      },
    }

    const result = buildComicImageList(files)
    expect(result).toEqual(["cover.jpg", "page001.jpg"])
  })

  test("sorts images using natural filename ordering", () => {
    const files = {
      "page10.jpg": createImageFile(),
      "page2.jpg": createImageFile(),
      "page1.jpg": createImageFile(),
      "page20.jpg": createImageFile(),
    }

    const result = buildComicImageList(files)
    expect(result).toEqual(["page1.jpg", "page2.jpg", "page10.jpg", "page20.jpg"])
  })

  test("handles zero-padded filenames correctly", () => {
    const files = {
      "page010.jpg": createImageFile(),
      "page002.jpg": createImageFile(),
      "page001.jpg": createImageFile(),
    }

    const result = buildComicImageList(files)
    expect(result).toEqual(["page001.jpg", "page002.jpg", "page010.jpg"])
  })

  test("moves raster_cover_name to front if present", () => {
    const files = {
      "page001.jpg": createImageFile(),
      "cover.jpg": createImageFile(),
      "page002.jpg": createImageFile(),
    }

    const result = buildComicImageList(files, "cover.jpg")
    expect(result).toEqual(["cover.jpg", "page001.jpg", "page002.jpg"])
  })

  test("does not duplicate cover if already first", () => {
    const files = {
      "cover.jpg": createImageFile(),
      "page001.jpg": createImageFile(),
      "page002.jpg": createImageFile(),
    }

    const result = buildComicImageList(files, "cover.jpg")
    expect(result).toEqual(["cover.jpg", "page001.jpg", "page002.jpg"])
  })

  test("handles null raster_cover_name", () => {
    const files = {
      "page002.jpg": createImageFile(),
      "page001.jpg": createImageFile(),
    }

    const result = buildComicImageList(files, null)
    expect(result).toEqual(["page001.jpg", "page002.jpg"])
  })

  test("handles undefined raster_cover_name", () => {
    const files = {
      "page002.jpg": createImageFile(),
      "page001.jpg": createImageFile(),
    }

    const result = buildComicImageList(files, undefined)
    expect(result).toEqual(["page001.jpg", "page002.jpg"])
  })

  test("ignores raster_cover_name if not in files", () => {
    const files = {
      "page001.jpg": createImageFile(),
      "page002.jpg": createImageFile(),
    }

    const result = buildComicImageList(files, "missing.jpg")
    expect(result).toEqual(["page001.jpg", "page002.jpg"])
  })

  test("handles mixed image formats (JPEG, PNG, GIF, WEBP)", () => {
    const files = {
      "cover.png": createImageFile("image/png"),
      "page001.jpg": createImageFile("image/jpeg"),
      "page002.gif": createImageFile("image/gif"),
      "page003.webp": createImageFile("image/webp"),
    }

    const result = buildComicImageList(files)
    expect(result).toEqual(["cover.png", "page001.jpg", "page002.gif", "page003.webp"])
  })

  test("handles complex directory structure", () => {
    const files = {
      "images/cover.jpg": createImageFile(),
      "images/page001.jpg": createImageFile(),
      "images/page002.jpg": createImageFile(),
      "wrapper.xhtml": {
        is_virtualized: false,
        size: 5000,
        mimetype: "application/xhtml+xml",
        is_html: true,
        length: 100,
        has_maths: false,
        anchor_map: [],
      },
    }

    const result = buildComicImageList(files, "images/cover.jpg")
    expect(result).toEqual(["images/cover.jpg", "images/page001.jpg", "images/page002.jpg"])
  })

  test("filters out non-image mimetypes", () => {
    const files = {
      "cover.jpg": createImageFile("image/jpeg"),
      "document.pdf": {
        is_virtualized: false,
        size: 500000,
        mimetype: "application/pdf",
        is_html: false,
      },
      "page001.jpg": createImageFile("image/jpeg"),
    }

    const result = buildComicImageList(files)
    expect(result).toEqual(["cover.jpg", "page001.jpg"])
  })

  test("handles files without mimetype (edge case)", () => {
    const files = {
      "page001.jpg": {
        is_virtualized: false,
        size: 100000,
        mimetype: undefined as never,
        is_html: false,
      },
      "page002.jpg": createImageFile(),
    }

    const result = buildComicImageList(files)
    // File without mimetype starting with "image/" should be excluded
    expect(result).toEqual(["page002.jpg"])
  })
})
