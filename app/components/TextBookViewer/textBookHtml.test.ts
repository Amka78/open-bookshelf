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
    expect(html).toContain("const waitForInitialResources = async () => {")
    expect(html).toContain("await Promise.race([Promise.allSettled(pendingResources), timeout])")
    expect(html).toContain("window.setTimeout(resolve, 5000)")
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
    expect(html).toContain("const getPageInlineSize = (inlineViewportSize, spreadPageCount) => {")
    expect(html).toContain("-webkit-column-width")
    expect(html).toContain("column-width")
    expect(html).toContain("const pageInlineSize = getPageInlineSize(inlineViewportSize, spreadPageCount)")
  })

  test("does not block paginated spine wrappers from splitting across columns", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: {
          n: "html",
          c: [
            {
              n: "body",
              c: [{ n: "div", c: [{ n: "p", c: ["chapter wrapper"] }] }],
            },
          ],
        },
        ns_map: [],
      },
      documentKey: "doc-key-wrapper",
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

    expect(html).not.toContain("body.obs-paginated > *")
    expect(html).toContain("body.obs-paginated img,")
    expect(html).toContain("body.obs-paginated table,")
    expect(html).toContain("body.obs-paginated pre {")
  })

  test("normalizes top-level paginated wrappers so Calibre spine content can split into columns", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: {
          n: "html",
          c: [
            {
              n: "body",
              c: [
                {
                  n: "div",
                  a: [["class", "calibre-wrapper"]],
                  c: [{ n: "p", c: ["wrapped chapter content"] }],
                },
              ],
            },
          ],
        },
        ns_map: [],
      },
      documentKey: "doc-key-root-wrapper",
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

    expect(html).toContain("const normalizePaginatedRootContainers = () => {")
    expect(html).toContain('child.style.setProperty("column-span", "none", "important")')
    expect(html).toContain("normalizePaginatedRootContainers()")
  })

  test("derives root writing-mode from wrapper elements before paginated layout", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: {
          n: "html",
          c: [
            {
              n: "body",
              c: [{ n: "div", a: [["class", "chapter"]], c: [{ n: "p", c: ["縦書き"] }] }],
            },
          ],
        },
        ns_map: [],
      },
      documentKey: "doc-key-writing-mode",
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

    expect(html).toContain("const applyDerivedRootWritingMode = () => {")
    expect(html).toContain('document.body.style.setProperty("writing-mode", candidateState.writingMode, "important")')
    expect(html).toContain('document.body.style.setProperty("direction", candidateStyle.direction, "important")')
    expect(html).toContain("applyDerivedRootWritingMode()")
  })

  test("queues command payload until initial layout is complete", () => {
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

    expect(html).toContain("let initialLayoutDone = false")
    expect(html).toContain("let pendingCommandPayload = null")
    expect(html).toContain("const applyCommandPayload = (payload) => {")
    expect(html).toContain("if (!initialLayoutDone) {")
    expect(html).toContain("pendingCommandPayload = payload")
    expect(html).toContain("applyCommandPayload(payload)")
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

  test("performs initial applyLayout only after waiting for resource readiness", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-initial-layout",
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

    expect(html).toContain("await waitForInitialResources()")
    expect(html).toContain("applyLayout()")
    expect(html).toContain("initialLayoutDone = true")
    expect(html).toContain("if (pendingCommandPayload) {")
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

  test("uses the active scroll container when computing and changing paginated position", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["hello"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-scroll-container",
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

    expect(html).toContain("const getScrollContainer = (axis) => {")
    expect(html).toContain("if (layoutState.isPaginated) {")
    expect(html).toContain("return null")
    expect(html).toContain("const getAxisScrollOffset = (axis) => {")
    expect(html).toContain("const scrollToAxisOffset = (axis, offset) => {")
    expect(html).toContain("return getAxisScrollOffset(getInlineScrollAxis(layoutState.isVerticalWriting))")
    expect(html).toContain('document.addEventListener("scroll", schedulePaginationUpdate, true)')
  })

  test("keeps paginated body overflow visible and constrains media to page inline size", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "img", a: [["src", "cover.jpg"]] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-media-limit",
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

    expect(html).toContain('applyImportantStyle(document.body, "overflow", "visible")')
    expect(html).toContain('applyImportantStyle(document.body, "overflow-x", isVerticalWriting ? "hidden" : "auto")')
    expect(html).toContain('applyImportantStyle(document.body, "overflow-y", isVerticalWriting ? "auto" : "hidden")')
    expect(html).toContain('const mediaElements = document.querySelectorAll("img, svg, video, canvas, iframe")')
    expect(html).toContain('applyImportantStyle(element, "max-height", pageInlineSize + "px")')
    expect(html).toContain('applyImportantStyle(element, "max-width", pageInlineSize + "px")')
  })

  test("reuses getWritingModeState aliases when deriving layout direction and vertical block extent", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["縦書き"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-layout-direction",
      annotations: [],
      appearance: {
        themeMode: "light",
        textColor: "#111318",
        linkColor: "#111318",
        fallbackBackgroundColor: "#ffffff",
        viewerFontSizePt: 16,
        viewerTheme: "default",
      },
      readingStyle: "verticalScroll",
      pageDirection: "left",
      initialPage: 0,
      leadingBlankPage: false,
    })

    expect(html).toContain("const bodyState = getWritingModeState(")
    expect(html).toContain("return htmlState.isVerticalWriting || htmlState.rtl ? htmlState : bodyState")
    expect(html).toContain("const getBlockExtent = (isVertical) => {")
    expect(html).toContain("getBlockExtent(isVerticalWriting)")
    expect(html).toContain("scrollToAxisOffset(getBlockScrollAxis(layoutState.isVerticalWriting), offset)")
  })

  test("applies preferred writing mode metadata before deriving layout direction", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["縦書き"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-preferred-writing-mode",
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
      preferredWritingMode: "vertical-rl",
    })

    expect(html).toContain('const preferredWritingMode = "vertical-rl"')
    expect(html).toContain("const applyPreferredWritingMode = () => {")
    expect(html).toContain('document.body.style.setProperty("writing-mode", preferredWritingMode, "important")')
    const clearLayoutIndex = html.indexOf("clearLayoutOverrides()")
    const applyPreferredIndex = html.indexOf("applyPreferredWritingMode()")
    expect(clearLayoutIndex).toBeGreaterThan(-1)
    expect(applyPreferredIndex).toBeGreaterThan(clearLayoutIndex)
    expect(html).toContain("applyPreferredWritingMode()")
  })
})
