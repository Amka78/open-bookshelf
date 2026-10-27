import { describe as baseDescribe, test as baseTest, expect, vi } from "vitest"
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

    expect(html).toContain("document.querySelectorAll('link[rel~=\"stylesheet\"], style')")
    expect(html).toContain("const waitForInitialResources = async () => {")
    expect(html).toContain("await Promise.race([Promise.allSettled(pendingResources), timeout])")
    expect(html).toContain("window.setTimeout(resolve, 5000)")
    expect(html).toContain("document.fonts?.ready")
    expect(html).toContain('document.documentElement.style.overflow = "visible"')
    expect(html).toContain('document.body.style.setProperty("-webkit-margin-collapse", "separate")')
    expect(html).toContain("contentChildren.length === 1")
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
    expect(html).toContain(
      "const getPageInlineSize = (inlineViewportSize, spreadPageCount, isVerticalWriting) => {",
    )
    expect(html).toContain("-webkit-column-width")
    expect(html).toContain("column-width")
    expect(html).toContain("const pageInlineSize = getPageInlineSize(")
    expect(html).toContain("isVerticalWriting,\n          )")
  })

  test("splits a spread along the block axis for vertical writing", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["縦書き"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-vertical-spread",
      annotations: [],
      appearance: {
        themeMode: "light",
        textColor: "#111318",
        linkColor: "#111318",
        fallbackBackgroundColor: "#ffffff",
        viewerFontSizePt: 16,
        viewerTheme: "default",
      },
      readingStyle: "facingPage",
      pageDirection: "left",
      initialPage: 0,
      leadingBlankPage: false,
      preferredWritingMode: "vertical-rl",
    })

    // vertical-rl では inline 軸＝高さ。ここで spread を掛けるとページ高さが半分になり、
    // 画面幅いっぱいの横長い帯が下へ積み上がって1画面に複数ページ分が入る。
    // 1ユニット（画面いっぱいの列）が見開きそのものなので、spread は
    // 「ユニットあたりの論理ページ数」として扱う。
    expect(html).toContain(
      "const getLogicalPagesPerUnit = (isVerticalWriting, spreadPageCount) => {",
    )
    expect(html).toContain("return isVerticalWriting ? Math.max(1, spreadPageCount) : 1")
    expect(html).toContain("return Math.max(1, Math.floor(inlineViewportSize))")
    expect(html).toContain(
      "const logicalPagesPerUnit = getLogicalPagesPerUnit(isVerticalWriting, spreadPageCount)",
    )
    expect(html).toContain("unitCount * logicalPagesPerUnit")
    // 論理ページ → ユニット換算（横書きは perUnit=1 なので従来通り）
    expect(html).toContain("const perUnit = Math.max(1, layoutState.logicalPagesPerUnit || 1)")
    expect(html).toContain("const unit = Math.floor(internalPage / perUnit)")
    expect(html).toContain("const offset = unit * layoutState.inlinePageSize")
    // ユニット → 論理ページ換算
    expect(html).toContain(
      "const logicalPage = unit * Math.max(1, layoutState.logicalPagesPerUnit || 1)",
    )
  })

  test("re-runs doLayout when the viewport changes after the initial layout", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["resize"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-resize",
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
      pageDirection: "right",
      initialPage: 0,
      leadingBlankPage: false,
    })

    // notifyPagination() だけは列幅・wrapper 幅・body 幅を作り直さないので、
    // 実ビューポートと doLayout() が使った寸法の食い違いを検出して再レイアウトする。
    expect(html).toContain("const hasViewportChangedSinceLayout = () => {")
    expect(html).toContain("document.documentElement.clientWidth !== lastLayoutViewport[0]")
    expect(html).toContain("const refreshForViewport = () => {")
    expect(html).toContain('window.addEventListener("resize", refreshForViewport)')
    expect(html).toContain("new ResizeObserver(refreshForViewport)")
    expect(html).not.toContain('window.addEventListener("resize", schedulePaginationUpdate)')
    expect(html).toContain("lastLayoutViewport = [")
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

    // #obs-page-wrapper is the multicol container: column-fill:auto only fragments
    // when it keeps a definite block size, so normalization must target the wrapper's
    // children (Calibre's "body > *") and never the wrapper itself.
    expect(html).toContain("const layoutRoot = getPageWrapper() ?? document.body")
    expect(html).toContain("const { contentChildren } = getPrimaryLayoutElements()")
    expect(html).not.toContain("Array.from(document.body.children)")
    expect(html).not.toContain('document.querySelectorAll("body > *")')
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
    // writing-mode は継承されないので、body だけに掛けると html の中で orthogonal flow
    // になる（Chromium >= 134 で複数ページが重なって描画される。Calibre 9.16.0 の
    // resources/pdf-preprint.js が同じ理由で root へ伝播させている）。
    expect(html).toContain("const applyRootWritingMode = (writingMode, direction) => {")
    expect(html).toContain("for (const element of [document.documentElement, document.body]) {")
    expect(html).toContain("candidateState.writingMode || null")
    expect(html).toContain("candidateStyle.direction || null")
    expect(html).toContain("applyRootWritingMode(found.writingMode, found.direction)")
    expect(html).not.toContain(
      'document.body.style.setProperty("writing-mode", candidateState.writingMode, "important")',
    )
    expect(html).toContain("applyDerivedRootWritingMode()")
  })

  test("lays out vertical writing in a fixed A4-portrait page box", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["縦書き"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-vertical-page-box",
      annotations: [],
      appearance: {
        themeMode: "light",
        textColor: "#111318",
        linkColor: "#111318",
        fallbackBackgroundColor: "#ffffff",
        viewerFontSizePt: 16,
        viewerTheme: "default",
      },
      readingStyle: "facingPage",
      pageDirection: "left",
      initialPage: 0,
      leadingBlankPage: false,
      preferredWritingMode: "vertical-rl",
    })

    // Calibre の PDF 出力は Portrait 固定の用紙箱を1枚ずつ出す（見開き/2-up は無い）。
    // 同じく表示モードに依存しないページ箱を使うので、単一ページ=1箱・見開き=2箱となり
    // 総ページ数がモードで変わらない。
    expect(html).toContain("const VERTICAL_PAGE_ASPECT_RATIO = 210 / 297")
    expect(html).toContain("const getVerticalPageWidth = (viewportWidth, viewportHeight) => {")
    expect(html).toContain("Math.floor(viewportHeight * VERTICAL_PAGE_ASPECT_RATIO)")
    expect(html).toContain("const contentWidth = verticalPageWidth * spreadPageCount")
    expect(html).toContain('applyImportantStyle(pw, "width", contentWidth + "px")')
    expect(html).not.toContain('applyImportantStyle(pw, "width", "100%")')
    // vertical-rl では block-start が右。margin-left / margin-inline-* は効かないので
    // 中央寄せは物理プロパティの margin-right を px 指定する。
    expect(html).toContain('"margin-right",')
    expect(html).toContain("Math.floor((viewportWidth - contentWidth) / 2)")
    // 見開きでも画像は論理1ページ分に収める
    expect(html).toContain('applyImportantStyle(element, "max-width", verticalPageWidth + "px")')
    // 横書きへ切り替えた時に中央寄せの margin が残らないようにする
    expect(html).toContain('pw.style.removeProperty("margin-right")')
    expect(html).toContain('pw.style.removeProperty("margin-left")')
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

  test("computePageMetrics derives fresh isVerticalWriting for the measure axis", () => {
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

    // computePageMetrics derives a fresh isVerticalWriting from getLayoutDirectionState()
    // instead of reading stale layoutState, and uses it to pick the measure axis.
    expect(html).toContain("const { isVerticalWriting } = getLayoutDirectionState()")
    expect(html).toContain("const measureAxis = isVerticalWriting ? 'scrollHeight' : 'scrollWidth'")
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
    expect(html).toContain(
      "return getAxisScrollOffset(getInlineScrollAxis(layoutState.isVerticalWriting))",
    )
    expect(html).toContain('document.addEventListener("scroll", schedulePaginationUpdate, true)')
  })

  test("clips paginated body overflow and constrains media to page inline size", () => {
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

    // 頁送り時は overflow:clip（Chrome の overflow:hidden はクリップ外を描画しない
    // 最適化が働き、translateY で表示された時に空白になるため）。
    expect(html).toContain('applyImportantStyle(document.body, "overflow", "clip")')
    expect(html).toContain('document.documentElement.style.overflow = "clip"')
    // 縦スクロール時の分岐
    expect(html).toContain('applyImportantStyle(document.body, "overflow-x", "hidden")')
    expect(html).toContain('applyImportantStyle(document.body, "overflow-y", "auto")')
    expect(html).toContain(
      'const mediaElements = document.querySelectorAll("img, svg, video, canvas, iframe")',
    )
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
    expect(html).toContain(
      "return htmlState.isVerticalWriting || htmlState.rtl ? htmlState : bodyState",
    )
    expect(html).toContain("const getBlockExtent = (isVertical) => {")
    expect(html).toContain("getBlockExtent(isVerticalWriting)")
    expect(html).toContain(
      "scrollToAxisOffset(getBlockScrollAxis(layoutState.isVerticalWriting), offset)",
    )
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
    expect(html).toContain("applyRootWritingMode(normalized, null)")
    // Calibre reports the Kindle EXTH value "horizontal-lr", which is not a valid
    // CSS writing-mode, so only vertical values may be written to the DOM.
    expect(html).toContain('normalized !== "vertical-rl"')
    expect(html).not.toContain('preferredWritingMode === "horizontal-tb"')
    const clearLayoutIndex = html.indexOf("clearLayoutOverrides()")
    const applyPreferredIndex = html.indexOf("applyPreferredWritingMode()")
    expect(clearLayoutIndex).toBeGreaterThan(-1)
    expect(applyPreferredIndex).toBeGreaterThan(clearLayoutIndex)
    expect(html).toContain("applyPreferredWritingMode()")
  })

  test("never guesses vertical writing from pageDirection", () => {
    const html = buildTextBookHtmlDocument({
      documentData: {
        tree: { n: "html", c: [{ n: "body", c: [{ n: "p", c: ["横書き"] }] }] },
        ns_map: [],
      },
      documentKey: "doc-key-no-writing-mode-guess",
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
      pageDirection: "right",
      initialPage: 0,
      leadingBlankPage: false,
    })

    // direction:rtl combined with writing-mode:vertical-rl reverses the inline axis
    // (text flows bottom-to-top), which collapses column pagination to one page and
    // leaves every later page blank.
    expect(html).not.toContain('setProperty("direction", "rtl", "important")')
    expect(html).not.toContain('viewerState.pageDirection === "right"')
    expect(html).toContain("const { isVerticalWriting, rtl } = getLayoutDirectionState()")
  })

  test("lays out the cover spine as one full-viewport page with a height-fitted, centered image", () => {
    const build = (coverPage?: boolean) =>
      buildTextBookHtmlDocument({
        documentData: {
          tree: {
            n: "html",
            c: [{ n: "body", c: [{ n: "div", c: [{ n: "img", a: [["src", "cover.jpeg"]] }] }] }],
          },
          ns_map: [],
        },
        documentKey: `doc-key-cover-${coverPage}`,
        annotations: [],
        appearance: {
          themeMode: "light",
          textColor: "#111318",
          linkColor: "#111318",
          fallbackBackgroundColor: "#ffffff",
          viewerFontSizePt: 16,
          viewerTheme: "default",
        },
        readingStyle: "facingPageWithTitle",
        pageDirection: "left",
        initialPage: 0,
        leadingBlankPage: true,
        coverPage,
      })

    const html = build(true)

    expect(html).toContain("const coverPage = true")
    expect(build(false)).toContain("const coverPage = false")
    // 表紙の実体（画像1枚・テキスト無し）を確認してから全画面化するので、
    // 表紙の無い本で spine 0 が本文でも分页がずれない。
    expect(html).toContain('pw.querySelectorAll("img, svg, video, canvas, iframe").length !== 1')
    expect(html).toContain('return (pw.textContent || "").replace(/\\s+/g, "").length === 0')
    // 見開き+表紙モードの表紙だけ spread を 1 にして全画面1枚にする（縦書きは対象外）。
    expect(html).toContain('viewerState.readingStyle === "facingPageWithTitle"')
    expect(html).toContain("!getLayoutDirectionState().isVerticalWriting")
    expect(html).toContain("if (isFullScreenCoverPage()) {\n            return 1")
    // max-* は上限なので小さい表紙が画面高さまで拡大されない。高さ固定で揃える。
    expect(html).toContain('applyImportantStyle(element, "height", viewportHeight + "px")')
    expect(html).toContain('applyImportantStyle(element, "width", "auto")')
    expect(html).toContain('applyImportantStyle(element, "display", "block")')
    expect(html).toContain(
      "const centerCoverImage = isCoverOnlyDocument() && !isVerticalWriting && spreadPageCount === 1",
    )
    expect(html).toContain(
      'applyImportantStyle(element, "margin-left", centerCoverImage ? "auto" : "0px")',
    )
  })
})
