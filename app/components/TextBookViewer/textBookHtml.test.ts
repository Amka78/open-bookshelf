import { describe as baseDescribe, expect, test as baseTest } from "bun:test"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import { buildTextBookHtmlDocument } from "./textBookHtml"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("textBookHtml", () => {
  test("includes runtime hooks to relayout after stylesheet and font loading", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key",
      annotations: [],
      appearance: {
        themeMode: "light",
        textColor: "#111318",
        linkColor: "#111318",
        fallbackBackgroundColor: "#ffffff",
        viewerFontSizePt: 16,
        viewerTheme: "default",
      },
      readingStyle: "singlePage",
      pageDirection: "left",
      initialPage: 0,
      leadingBlankPage: false,
    })

    expect(html).toContain('document.querySelectorAll(\'link[rel~="stylesheet"], style\')')
    expect(html).toContain("document.fonts?.ready")
    expect(html).toContain('document.documentElement.style.overflow = "visible"')
    expect(html).toContain('document.body.style.setProperty("-webkit-margin-collapse", "separate")')
    expect(html).toContain('bodyChildren.length === 1')
    expect(html).toContain('style.setProperty("height", "auto", "important")')
  })
})
