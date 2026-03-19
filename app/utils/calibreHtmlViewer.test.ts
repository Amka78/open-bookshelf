import { isCalibreHtmlViewerFormat, isCalibreSerializedHtmlPath } from "@/utils/calibreHtmlViewer"

describe("calibreHtmlViewer", () => {
  test("detects calibre html viewer formats", () => {
    expect(isCalibreHtmlViewerFormat("azw3")).toBe(true)
    expect(isCalibreHtmlViewerFormat("KF8")).toBe(true)
    expect(isCalibreHtmlViewerFormat("EPUB")).toBe(false)
  })

  test("detects serialized html spine paths", () => {
    expect(isCalibreSerializedHtmlPath("Text/chapter-1.xhtml")).toBe(true)
    expect(isCalibreSerializedHtmlPath("Text/chapter-2.html?foo=bar#frag")).toBe(true)
    expect(isCalibreSerializedHtmlPath("Images/page-1.jpg")).toBe(false)
    expect(isCalibreSerializedHtmlPath(undefined)).toBe(false)
  })
})
