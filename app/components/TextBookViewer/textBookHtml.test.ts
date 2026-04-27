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

  test("includes blockViewportSize and column-width in doLayout for paginated style", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello world"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-paginated",
      annotations: [],
      appearance: {
        themeMode: "light",
        textColor: "#111318",
        linkColor: "#111318",
        fallbackBackgroundColor: "#ffffff",
        viewerFontSizePt: 16,
        viewerTheme: "default",
      },
      readingStyle: "doublePage",
      pageDirection: "left",
      initialPage: 0,
      leadingBlankPage: false,
    })

    expect(html).toContain("const blockViewportSize = Math.max(")
    expect(html).toContain("-webkit-column-width")
    expect(html).toContain("column-width")
  })

  test("handleCommand calls doLayout instead of applyLayout to avoid stale pagination notification", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-cmd",
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

    // doLayout() is extracted and handleCommand uses it (not applyLayout)
    expect(html).toContain("const doLayout = () => {")
    expect(html).toContain("const applyLayout = () => {")
    // handleCommand calls doLayout() — no stale notifyPagination before scroll
    expect(html).toContain("currentAnchor = typeof payload.anchor === \"string\" ? payload.anchor : null")
    expect(html).toContain("doLayout()")
    // applyLayout saves page, scrolls to it, then notifies — no raw scrollX in between
    expect(html).toContain("const savedPage = viewerState.currentPage")
    expect(html).toContain("scrollToPhysicalPage(savedPage)")
    expect(html).toContain("notifyPagination()")
  })

  test("applyLayout restores logical page after doLayout clears column-width to prevent schedule-reset", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-restore",
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

    // applyLayout must save the current logical page BEFORE doLayout() removes column-width
    // (which resets scrollX to 0), then restore via scrollToPhysicalPage so that the
    // 50ms/250ms/1000ms scheduled relayouts don't kick the reader back to page 0.
    expect(html).toContain("const savedPage = viewerState.currentPage")
    expect(html).toContain("doLayout()")
    expect(html).toContain("scrollToPhysicalPage(savedPage)")

    // handleCommand must NOT restore scroll (it calls scrollToPhysicalPage with its own target)
    const handleCommandIndex = html.indexOf("const handleCommand = (payload) =>")
    const applyLayoutIndex = html.indexOf("const applyLayout = () =>")
    expect(handleCommandIndex).toBeGreaterThan(-1)
    expect(applyLayoutIndex).toBeGreaterThan(-1)
    // The savedPage restoration pattern belongs to applyLayout, not handleCommand
    // Verify by ensuring "savedPage" appears BEFORE handleCommand in source order
    const savedPageIndex = html.indexOf("const savedPage = viewerState.currentPage")
    expect(savedPageIndex).toBeLessThan(handleCommandIndex)
  })

  test("getInlineExtent accepts isVertical parameter and computePageMetrics passes fresh value", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-extent",
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

    // getInlineExtent accepts explicit isVertical parameter (not stale layoutState)
    expect(html).toContain("const getInlineExtent = (isVertical) =>")
    // computePageMetrics passes fresh isVerticalWriting to getInlineExtent
    expect(html).toContain("getInlineExtent(isVerticalWriting)")
  })
})

