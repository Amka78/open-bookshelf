import type { PreparedCalibreHtmlDocument } from "@/components/BookHtmlPage/shared"
import type { BookReadingStyleType } from "@/type/types"

export const textBookViewerPaginationMessageType = "open-bookshelf:text-book-pagination"
export const textBookViewerInteractionMessageType = "open-bookshelf:text-book-interaction"
export const textBookViewerSelectionMessageType = "open-bookshelf:text-book-selection"
export const textBookViewerCommandMessageType = "open-bookshelf:text-book-command"
export const textBookViewerTapAction = "tap"
export const textBookViewerLongPressAction = "long-press"

type BuildTextBookHtmlDocumentInput = {
  documentData: PreparedCalibreHtmlDocument
  documentKey: string
  appearance: {
    themeMode: "light" | "dark"
    textColor: string
    linkColor: string
    fallbackBackgroundColor: string
    viewerFontSizePt?: number
    viewerTheme?: "default" | "sepia" | "dark"
  }
  annotations: Array<{ uuid: string; highlightedText: string | null; styleWhich: string | null }>
  readingStyle: BookReadingStyleType
  pageDirection: "left" | "right"
  initialPage: number
  leadingBlankPage: boolean
  preferredWritingMode?: string | null
  /** spine 0（Calibre が非EPUB形式に挿入する表紙 titlepage）のとき true */
  coverPage?: boolean
}

const serializeForScriptTag = (value: unknown) => {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

export const buildTextBookHtmlDocument = ({
  annotations,
  appearance,
  coverPage,
  documentData,
  documentKey,
  initialPage,
  leadingBlankPage,
  pageDirection,
  preferredWritingMode,
  readingStyle,
}: BuildTextBookHtmlDocumentInput) => {
  const serializedData = serializeForScriptTag(documentData)
  const escapedDocumentKey = serializeForScriptTag(documentKey)
  const escapedAnnotations = serializeForScriptTag(annotations)
  const escapedThemeMode = serializeForScriptTag(appearance.themeMode)
  const escapedTextColor = serializeForScriptTag(appearance.textColor)
  const escapedLinkColor = serializeForScriptTag(appearance.linkColor)
  const escapedFallbackBackgroundColor = serializeForScriptTag(appearance.fallbackBackgroundColor)
  const escapedReadingStyle = serializeForScriptTag(readingStyle)
  const escapedPageDirection = serializeForScriptTag(pageDirection)
  const escapedInitialPage = serializeForScriptTag(initialPage)
  const escapedLeadingBlankPage = serializeForScriptTag(leadingBlankPage)
  const escapedPreferredWritingMode = serializeForScriptTag(preferredWritingMode ?? null)
  const escapedCoverPage = serializeForScriptTag(coverPage ?? false)
  const fontSizePt = appearance.viewerFontSizePt ?? 16
  const fontSizeCss = `body, p, div, span, li, td, th { font-size: ${fontSizePt}pt !important; }`
  const sepiaCss =
    appearance.viewerTheme === "sepia"
      ? `html, body { background-color: #f4ecd8 !important; color: #5b4636 !important; }
      a, a * { color: #7a5c44 !important; }`
      : ""

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      :root {
        color-scheme: ${appearance.themeMode};
        --obs-text-color: ${appearance.textColor};
        --obs-link-color: ${appearance.linkColor};
        --obs-fallback-background-color: ${appearance.fallbackBackgroundColor};
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        min-height: 100%;
        background: var(--obs-fallback-background-color);
        color: var(--obs-text-color);
      }
      body {
        overflow: visible;
        overscroll-behavior: contain;
        word-break: normal;
        overflow-wrap: break-word;
      }
      body.obs-paginated {
        height: 100vh !important;
        max-height: 100vh !important;
      }
      /* Force all elements to allow column breaks, overriding any Calibre CSS
         that may set break-inside: avoid on chapter/section wrappers. */
      body.obs-paginated * {
        break-inside: auto !important;
        -webkit-column-break-inside: auto !important;
      }
      body.obs-paginated img,
      body.obs-paginated svg,
      body.obs-paginated video,
      body.obs-paginated canvas,
      body.obs-paginated iframe,
      body.obs-paginated table,
      body.obs-paginated pre {
        break-inside: avoid;
      }
      body.obs-dark a,
      body.obs-dark a * {
        color: var(--obs-link-color) !important;
      }
      img, svg, video, canvas, iframe {
        max-width: 100%;
        color-scheme: light;
      }
      ${fontSizeCss}
      ${sepiaCss}
    </style>
  </head>
  <body>
    <div id="obs-body-anchor" data-obs-helper="1"></div>
    <script id="obs-serialized-data" data-obs-helper="1" type="application/json">${serializedData}</script>
    <script data-obs-helper="1">
      const pageAnnotations = ${escapedAnnotations}
      ;(async () => {
        try { console.log('[tb] script started') } catch {}
        try {
        const serializedData = JSON.parse(document.getElementById("obs-serialized-data")?.textContent || "{}")
        const documentKey = ${escapedDocumentKey}
        const nsMap = Array.isArray(serializedData.ns_map) ? serializedData.ns_map : []
        const helperSelector = '[data-obs-helper="1"]'
        const anchor = document.getElementById("obs-body-anchor")
        const paginationMessageType = ${serializeForScriptTag(textBookViewerPaginationMessageType)}
        const interactionMessageType = ${serializeForScriptTag(
          textBookViewerInteractionMessageType,
        )}
        const selectionMessageType = ${serializeForScriptTag(textBookViewerSelectionMessageType)}
        const commandMessageType = ${serializeForScriptTag(textBookViewerCommandMessageType)}
        const tapAction = ${serializeForScriptTag(textBookViewerTapAction)}
        const longPressAction = ${serializeForScriptTag(textBookViewerLongPressAction)}
        const themeMode = ${escapedThemeMode}
        const themeTextColor = ${escapedTextColor}
        const themeLinkColor = ${escapedLinkColor}
        const initialThemeFallbackBackgroundColor = ${escapedFallbackBackgroundColor}
        const preferredWritingMode = ${escapedPreferredWritingMode}
        const coverPage = ${escapedCoverPage}
        const longPressDelayMs = 450
        const longPressMoveThresholdPx = 10
        const defaultViewerState = {
          readingStyle: ${escapedReadingStyle},
          pageDirection: ${escapedPageDirection},
          currentPage: ${escapedInitialPage},
          leadingBlankPage: ${escapedLeadingBlankPage},
        }
        const viewerState = { ...defaultViewerState }
        let layoutState = {
          physicalPageCount: 1,
          inlinePageSize: 1,
          blockPageSize: 1,
          isVerticalWriting: false,
          isPaginated: false,
          spreadPageCount: 1,
          logicalPagesPerUnit: 1,
        }
        let currentAnchor = null
        let scheduledLayoutFrame = 0
        let initialLayoutDone = false
        let pendingCommandPayload = null
        // doLayout() が実際に使ったビューポート寸法。resize 追従の判定に使う。
        let lastLayoutViewport = null

        const postPayload = (payload) => {
          const message = JSON.stringify(payload)

          if (window.ReactNativeWebView?.postMessage) {
            window.ReactNativeWebView.postMessage(message)
          }

          if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*")
          }
        }

        const removeMarkedHeadNodes = () => {
          const nodes = document.head.querySelectorAll(helperSelector)
          for (const node of nodes) {
            node.parentNode?.removeChild(node)
          }
        }

        const clearRenderedBodyNodes = () => {
          for (const child of Array.from(document.body.childNodes)) {
            if (child instanceof Element && child.matches(helperSelector)) {
              continue
            }

            child.parentNode?.removeChild(child)
          }
        }

        const applyAttributes = (source, element) => {
          if (!Array.isArray(source?.a)) {
            return
          }

          for (const attribute of source.a) {
            if (!attribute || !attribute[0]) {
              continue
            }

            const [name, value, nsIndex] = attribute
            if (value === undefined || value === null) {
              continue
            }

            if (nsIndex !== undefined && nsMap[nsIndex]) {
              try {
                element.setAttributeNS(nsMap[nsIndex], name, value)
                continue
              } catch {
                // Fallback to normal attributes below.
              }
            }

            element.setAttribute(name, value)
          }
        }

        const appendNode = (node, parent, markHeadNodes) => {
          if (!node) {
            return
          }

          if (typeof node === "string") {
            parent.appendChild(document.createTextNode(node))
            return
          }

          if (!node.n) {
            return
          }

          const element =
            node.s !== undefined && nsMap[node.s]
              ? document.createElementNS(nsMap[node.s], node.n)
              : document.createElement(node.n)

          if (markHeadNodes) {
            element.setAttribute("data-obs-helper", "1")
          }

          applyAttributes(node, element)

          if (node.x) {
            element.appendChild(document.createTextNode(node.x))
          }

          if (Array.isArray(node.c)) {
            for (const child of node.c) {
              appendNode(child, element, false)
            }
          }

          parent.appendChild(element)

          if (node.l) {
            parent.appendChild(document.createTextNode(node.l))
          }
        }

        const firstElementChild = (parent) => {
          let child = parent?.firstChild
          let count = 0

          while (child && child.nodeType !== Node.ELEMENT_NODE && count < 20) {
            child = child.nextSibling
            count += 1
          }

          return child && child.nodeType === Node.ELEMENT_NODE ? child : null
        }

        const hasStartText = (element) => {
          for (const child of Array.from(element.childNodes)) {
            if (child.nodeType !== Node.TEXT_NODE) {
              break
            }

            if (child.nodeValue && /\\S/.test(child.nodeValue)) {
              return true
            }
          }

          return false
        }

        const getPrimaryLayoutElements = () => {
          // Calibre applies its "body > *" normalization to the children of the
          // multicol container. Here that container is #obs-page-wrapper, so the
          // wrapper itself must never be normalized: giving it height:auto removes
          // the definite block size that column-fill:auto requires, which collapses
          // the whole spine into a single column.
          const layoutRoot = getPageWrapper() ?? document.body
          const contentChildren = Array.from(layoutRoot.children).filter(
            (element) => !element.matches(helperSelector),
          )
          const primary = contentChildren[0] ?? null
          const nestedPrimary =
            primary && primary.tagName.toLowerCase() === "div" && !hasStartText(primary)
              ? firstElementChild(primary)
              : null
          return { contentChildren, nestedPrimary, primary }
        }

        const getWritingModeState = (writingMode, direction) => {
          const normalizedWritingMode = String(writingMode || "").trim().toLowerCase()
          const verticalRl =
            normalizedWritingMode === "vertical-rl" ||
            normalizedWritingMode === "sideways-rl" ||
            normalizedWritingMode === "tb-rl"
          const verticalLr =
            normalizedWritingMode === "vertical-lr" ||
            normalizedWritingMode === "sideways-lr" ||
            normalizedWritingMode === "tb-lr"
          const isVerticalWriting = verticalRl || verticalLr
          const rtl = verticalRl || String(direction || "").trim().toLowerCase() === "rtl"

          return {
            isVerticalWriting,
            ltr: verticalLr || !rtl,
            rtl,
            writingMode: normalizedWritingMode,
          }
        }

        // writing-mode を body だけに掛けると、body が html の中の orthogonal flow になり、
        // Chromium >= 134 では複数ページのコンテンツが重なって描画される。Calibre が
        // 9.16.0 の resources/pdf-preprint.js で「body の vertical writing mode を root へ
        // 伝播させる」対策を入れたのと同じ理由で、html と body の両方に設定する。
        // direction は従来通り body のみ（html に rtl を渡すと溢れの起点が変わるため）。
        const applyRootWritingMode = (writingMode, direction) => {
          if (writingMode) {
            for (const element of [document.documentElement, document.body]) {
              element.style.setProperty("writing-mode", writingMode, "important")
              element.style.setProperty("-webkit-writing-mode", writingMode, "important")
            }
          }

          if (direction) {
            document.body.style.setProperty("direction", direction, "important")
          }
        }

        const applyDerivedRootWritingMode = () => {
          const computedBodyStyle = window.getComputedStyle(document.body)
          const computedHtmlStyle = window.getComputedStyle(document.documentElement)
          const bodyState = getWritingModeState(
            computedBodyStyle.getPropertyValue("writing-mode") || computedBodyStyle.writingMode,
            computedBodyStyle.direction,
          )
          const htmlState = getWritingModeState(
            computedHtmlStyle.getPropertyValue("writing-mode") || computedHtmlStyle.writingMode,
            computedHtmlStyle.direction,
          )

          if (bodyState.isVerticalWriting || htmlState.isVerticalWriting || computedBodyStyle.direction === "rtl") {
            return
          }

          const { nestedPrimary, primary } = getPrimaryLayoutElements()
          const candidates = [primary, nestedPrimary].filter((value) => value instanceof Element)

          for (const candidate of candidates) {
            const candidateStyle = window.getComputedStyle(candidate)
            const candidateState = getWritingModeState(
              candidateStyle.getPropertyValue("writing-mode") || candidateStyle.writingMode,
              candidateStyle.direction,
            )

            if (!candidateState.isVerticalWriting && candidateStyle.direction !== "rtl") {
              continue
            }

            applyRootWritingMode(
              candidateState.writingMode || null,
              candidateStyle.direction || null,
            )
            return
          }

          // Fallback: scan down the FIRST child chain (up to 6 levels deep).
          // Calibre often nests content 3-4+ levels (body > div > div > p[writing-mode]),
          // which the shallow 2-level scan above misses. We follow only the first child
          // of each element, not all descendants — O(depth) not O(total elements).
          const scanFirstChildChain = (element, depth) => {
            if (depth > 6 || !(element instanceof Element)) {
              return null
            }

            const style = window.getComputedStyle(element)
            const wm = style.getPropertyValue("writing-mode") || style.writingMode
            const dir = style.direction

            if (wm && !wm.includes("horizontal") && !wm.includes("initial")) {
              return { writingMode: wm, direction: dir }
            }
            if (dir === "rtl") {
              return { writingMode: null, direction: dir }
            }

            // Follow only the FIRST child element (chain, not breadth)
            const child = element.firstElementChild
            if (child) {
              return scanFirstChildChain(child, depth + 1)
            }

            return null
          }

          const bodyRoot = document.body
          if (bodyRoot) {
            const found = scanFirstChildChain(bodyRoot, 0)
            if (found) {
              applyRootWritingMode(found.writingMode, found.direction)
            }
          }
        }

        const applyPreferredWritingMode = () => {
          if (typeof preferredWritingMode !== "string" || preferredWritingMode.length === 0) {
            return
          }

          // Calibre surfaces the Kindle EXTH primary-writing-mode, whose horizontal
          // value is "horizontal-lr" — not a valid CSS writing-mode. Only vertical
          // values are applied.
          const normalized = preferredWritingMode.trim().toLowerCase()
          if (
            normalized !== "vertical-rl" &&
            normalized !== "vertical-lr" &&
            normalized !== "sideways-rl" &&
            normalized !== "sideways-lr"
          ) {
            return
          }

          applyRootWritingMode(normalized, null)
        }

        const normalizeFirstColumnElements = () => {
          const { contentChildren, nestedPrimary, primary } = getPrimaryLayoutElements()

          if (contentChildren.length === 1) {
            contentChildren[0].style.setProperty("height", "auto", "important")
            contentChildren[0].style.setProperty("min-height", "0", "important")
            contentChildren[0].style.setProperty("max-height", "none", "important")
            contentChildren[0].style.setProperty("break-inside", "auto", "important")
            contentChildren[0].style.setProperty("overflow", "visible", "important")
          }

          const first = primary
          if (!first || first.matches(helperSelector)) {
            return
          }

          first.style.setProperty("break-before", "avoid", "important")
          first.style.setProperty("break-inside", "auto", "important")
          if (first.tagName.toLowerCase() !== "div") {
            return
          }

          if (nestedPrimary) {
            nestedPrimary.style.setProperty("break-before", "avoid", "important")
            nestedPrimary.style.setProperty("break-inside", "auto", "important")
          }
        }

        const normalizePaginatedRootContainers = () => {
          if (viewerState.readingStyle === "verticalScroll") {
            return
          }

          const { contentChildren } = getPrimaryLayoutElements()

          for (const child of contentChildren) {
            child.style.setProperty("height", "auto", "important")
            child.style.setProperty("min-height", "0", "important")
            child.style.setProperty("max-height", "none", "important")
            child.style.setProperty("min-width", "0", "important")
            child.style.setProperty("max-width", "none", "important")
            child.style.setProperty("overflow", "visible", "important")
            child.style.setProperty("break-inside", "auto", "important")
            child.style.setProperty("column-span", "none", "important")
          }
        }

        const getPageWrapper = () => document.getElementById('obs-page-wrapper')

        const renderBodyNode = (bodyNode) => {
          clearRenderedBodyNodes()
          document.body.removeAttribute("style")
          applyAttributes(bodyNode, document.body)

          const wrapper = document.createElement("div")
          wrapper.id = "obs-page-wrapper"

          if (bodyNode?.x) {
            wrapper.appendChild(document.createTextNode(bodyNode.x))
          }

          if (Array.isArray(bodyNode?.c)) {
            for (const child of bodyNode.c) {
              appendNode(child, wrapper, false)
            }
          }

          if (anchor) {
            document.body.insertBefore(wrapper, anchor)
          } else {
            document.body.appendChild(wrapper)
          }
        }

        const render = () => {
          const htmlNode = serializedData?.tree
          if (!htmlNode) {
            return
          }

          applyAttributes(htmlNode, document.documentElement)
          removeMarkedHeadNodes()

          const children = Array.isArray(htmlNode.c) ? htmlNode.c : []
          let bodyNode = null

          for (const child of children) {
            if (typeof child !== "object" || !child?.n) {
              continue
            }

            const tagName = child.n.toLowerCase()
            if (tagName === "head" && Array.isArray(child.c)) {
              for (const headChild of child.c) {
                appendNode(headChild, document.head, true)
              }
              continue
            }

            if (tagName === "body") {
              bodyNode = child
              continue
            }

            if (!bodyNode) {
              bodyNode = { n: "body", c: [child] }
            } else {
              bodyNode.c = Array.isArray(bodyNode.c) ? [...bodyNode.c, child] : [child]
            }
          }

          renderBodyNode(bodyNode || { n: "body", c: [] })
        }

        const parseCssColor = (value) => {
          if (typeof value !== "string") {
            return null
          }

          const normalized = value.trim().toLowerCase()
          if (!normalized || normalized === "transparent") {
            return null
          }

          const rgbMatch = normalized.match(/^rgba?\\(([^)]+)\\)$/)
          if (rgbMatch) {
            const parts = rgbMatch[1]
              .split(",")
              .map((part) => Number.parseFloat(part.trim()))

            if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
              return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: Number.isFinite(parts[3]) ? parts[3] : 1,
              }
            }
          }

          const hexMatch = normalized.match(/^#([\\da-f]{3}|[\\da-f]{4}|[\\da-f]{6}|[\\da-f]{8})$/i)
          if (!hexMatch) {
            return null
          }

          const hex = hexMatch[1]
          if (hex.length === 3 || hex.length === 4) {
            return {
              r: Number.parseInt(hex[0] + hex[0], 16),
              g: Number.parseInt(hex[1] + hex[1], 16),
              b: Number.parseInt(hex[2] + hex[2], 16),
              a: hex.length === 4 ? Number.parseInt(hex[3] + hex[3], 16) / 255 : 1,
            }
          }

          return {
            r: Number.parseInt(hex.slice(0, 2), 16),
            g: Number.parseInt(hex.slice(2, 4), 16),
            b: Number.parseInt(hex.slice(4, 6), 16),
            a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
          }
        }

        const getBrightness = (color) => {
          if (!color) {
            return 255
          }

          return (color.r * 299 + color.g * 587 + color.b * 114) / 1000
        }

        const isDarkTextColor = (color) => {
          return Boolean(color && color.a > 0.05 && getBrightness(color) < 110)
        }

        const isLightBackgroundColor = (color) => {
          return Boolean(color && color.a > 0.05 && getBrightness(color) > 170)
        }

        const getEffectiveBackgroundColor = (element) => {
          let current = element
          while (current) {
            const backgroundColor = parseCssColor(window.getComputedStyle(current).backgroundColor)
            if (backgroundColor && backgroundColor.a > 0.05) {
              return backgroundColor
            }

            current = current.parentElement
          }

          return parseCssColor(initialThemeFallbackBackgroundColor)
        }

        const shouldIgnoreTextNormalization = (element) => {
          const tagName = element.tagName.toLowerCase()
          if (["img", "svg", "path", "video", "canvas", "iframe", "object", "embed"].includes(tagName)) {
            return true
          }

          return Boolean(element.closest("svg"))
        }

        const applyThemeOverrides = () => {
          document.documentElement.style.colorScheme = themeMode
          document.body.classList.toggle("obs-dark", themeMode === "dark")

          if (themeMode !== "dark") {
            return
          }

          document.body.style.setProperty("color", themeTextColor, "important")

          const candidates = [document.body, ...Array.from(document.body.querySelectorAll("*"))]
          for (const node of candidates) {
            if (!(node instanceof Element) || shouldIgnoreTextNormalization(node)) {
              continue
            }

            const computedStyle = window.getComputedStyle(node)
            const textColor = parseCssColor(computedStyle.color)
            if (!isDarkTextColor(textColor)) {
              continue
            }

            const backgroundColor = getEffectiveBackgroundColor(node)
            if (isLightBackgroundColor(backgroundColor)) {
              continue
            }

            const replacementColor = node.tagName.toLowerCase() === "a" ? themeLinkColor : themeTextColor
            node.style.setProperty("color", replacementColor, "important")
          }
        }

        const applyImportantStyle = (element, property, value) => {
          element.style.setProperty(property, value, "important")
        }

        const clearLayoutOverrides = () => {
          document.documentElement.style.height = ""
          document.documentElement.style.width = ""
          document.documentElement.style.overflow = ""
          document.documentElement.style.overflowX = ""
          document.documentElement.style.overflowY = ""
          document.body.style.removeProperty("background-color")
          document.body.style.removeProperty("color")
          document.body.style.removeProperty("width")
          document.body.style.removeProperty("height")
          document.body.style.removeProperty("min-width")
          document.body.style.removeProperty("max-width")
          document.body.style.removeProperty("min-height")
          document.body.style.removeProperty("max-height")
          document.body.style.removeProperty("margin")
          document.body.style.removeProperty("padding")
          document.body.style.removeProperty("border-width")
          document.body.style.removeProperty("box-sizing")
          document.body.style.removeProperty("overflow-wrap")
          document.body.style.removeProperty("overflow-x")
          document.body.style.removeProperty("overflow-y")
          document.body.style.removeProperty("column-gap")
          document.body.style.removeProperty("column-width")
          document.body.style.removeProperty("column-fill")
          document.body.style.removeProperty("column-rule")
          document.body.style.removeProperty("-webkit-column-gap")
          document.body.style.removeProperty("-webkit-column-width")
          document.body.style.removeProperty("-webkit-margin-collapse")
          // Clear wrapper column styles but PRESERVE transform (page position)
          const pw = getPageWrapper()
          if (pw) {
            pw.style.removeProperty("column-gap")
            pw.style.removeProperty("column-width")
            pw.style.removeProperty("column-fill")
            pw.style.removeProperty("column-rule")
            pw.style.removeProperty("-webkit-column-gap")
            pw.style.removeProperty("-webkit-column-width")
            pw.style.removeProperty("height")
            pw.style.removeProperty("width")
            // 縦書きの中央寄せで付けた margin を残すと、横書きへ切り替えた時に
            // wrapper がずれたままになるのでここで戻す。
            pw.style.removeProperty("margin-right")
            pw.style.removeProperty("margin-left")
          }
        }

        // 表紙 spine（Calibre が非EPUB形式に挿入する titlepage）は画像1枚だけで
        // 本文テキストを持たない。表紙の無い本では spine 0 が本文になるので、
        // prop だけでなく実体も確認する（本文ページの分页を壊さないため）。
        const isCoverOnlyDocument = () => {
          if (!coverPage) {
            return false
          }

          const pw = getPageWrapper()
          if (!pw || pw.querySelectorAll("img, svg, video, canvas, iframe").length !== 1) {
            return false
          }

          return (pw.textContent || "").replace(/\\s+/g, "").length === 0
        }

        // 見開き+表紙モードの表紙は「見開きの左ページ」ではなく画面いっぱいの1枚として
        // 扱う。縦書きは 1ユニット＝見開き（右半ページが先のページ）という箱の作りが
        // 異なるため対象外。
        const isFullScreenCoverPage = () => {
          return (
            isCoverOnlyDocument() &&
            viewerState.readingStyle === "facingPageWithTitle" &&
            !getLayoutDirectionState().isVerticalWriting
          )
        }

        const getSpreadPageCount = () => {
          if (isFullScreenCoverPage()) {
            return 1
          }

          return viewerState.readingStyle === "facingPage" ||
            viewerState.readingStyle === "facingPageWithTitle"
            ? 2
            : 1
        }

        const getPageInlineSize = (inlineViewportSize, spreadPageCount, isVerticalWriting) => {
          // 横書きでは inline 軸＝幅なので、見開きは列幅を分割する（1ユニット=論理1ページ）。
          // 縦書きでは inline 軸＝高さなので、ここで分割するとページ高さが半分になり、
          // 画面幅いっぱいの横長い帯が下方向に積み上がって1画面に複数ページ分が入る。
          // 縦書きの1ユニット（画面いっぱいの列）は右半分が論理Nページ・左半分がN+1ページ
          // という見開きそのものなので、inline サイズは分割せず spread を
          // 「ユニットあたりの論理ページ数」として扱う。
          if (isVerticalWriting) {
            return Math.max(1, Math.floor(inlineViewportSize))
          }

          return Math.max(1, Math.floor(inlineViewportSize / Math.max(1, spreadPageCount)))
        }

        const getLogicalPagesPerUnit = (isVerticalWriting, spreadPageCount) => {
          return isVerticalWriting ? Math.max(1, spreadPageCount) : 1
        }

        // 縦書きの論理ページ箱の幅。Calibre の PDF 出力は Portrait 固定の用紙箱を
        // 1枚ずつ出力し（見開き/2-up のオプションは存在しない）、このアプリの PDF
        // ビューアはそのページ固有のアスペクト比を画面にフィットさせて 1枚/2枚を
        // 表示する。同じく「表示モードに依存しない固定のページ箱」を使うことで、
        // 単一ページ=1箱・見開き=2箱 となり総ページ数がモードで変わらない。
        // 比率は A4 縦の外形 210:297。画面幅の半分を上限にする（見開きが画面に収まる）。
        const VERTICAL_PAGE_ASPECT_RATIO = 210 / 297

        const getVerticalPageWidth = (viewportWidth, viewportHeight) => {
          return Math.max(
            1,
            Math.min(
              Math.floor(viewportWidth / 2),
              Math.floor(viewportHeight * VERTICAL_PAGE_ASPECT_RATIO),
            ),
          )
        }

        const getLayoutDirectionState = () => {
          const computedBodyStyle = window.getComputedStyle(document.body)
          const bodyState = getWritingModeState(
            computedBodyStyle.getPropertyValue("writing-mode") ||
            computedBodyStyle.writingMode,
            computedBodyStyle.direction,
          )
          if (bodyState.isVerticalWriting || bodyState.rtl) {
            return bodyState
          }

          const computedHtmlStyle = window.getComputedStyle(document.documentElement)
          const htmlState = getWritingModeState(
            computedHtmlStyle.getPropertyValue("writing-mode") || computedHtmlStyle.writingMode,
            computedHtmlStyle.direction,
          )
          return htmlState.isVerticalWriting || htmlState.rtl ? htmlState : bodyState
        }

        const getInlineScrollAxis = (isVerticalWriting) => {
          return isVerticalWriting ? "y" : "x"
        }

        const getBlockScrollAxis = (isVerticalWriting) => {
          return isVerticalWriting ? "x" : "y"
        }

        const getScrollContainer = (axis) => {
          const computedBodyStyle = window.getComputedStyle(document.body)
          const overflowValue = axis === "x" ? computedBodyStyle.overflowX : computedBodyStyle.overflowY
          const bodyIsScrollContainer =
            (overflowValue === "auto" || overflowValue === "scroll") &&
            (axis === "x"
              ? document.body.scrollWidth > document.body.clientWidth + 1
              : document.body.scrollHeight > document.body.clientHeight + 1)

          if (bodyIsScrollContainer) {
            return document.body
          }

          // In paginated mode, body may be its own scroll container (e.g. vertical writing
          // with height: 100vh + overflow-y: auto). The check above handles that.
          // When body is not a scroll container in paginated mode, return null so callers
          // fall back to window.* scroll methods (which works for horizontal text where
          // body's overflow is delegated to the viewport).
          if (layoutState.isPaginated) {
            return null
          }

          const scrollingElement = document.scrollingElement
          return scrollingElement instanceof HTMLElement ? scrollingElement : null
        }

        const getAxisScrollOffset = (axis) => {
          // Try all possible scroll sources — Chrome's scroll propagation
          // is inconsistent for CSS columns inside iframes.
          const scrollVal = axis === "x"
            ? Math.max(
                document.documentElement.scrollLeft || 0,
                document.body.scrollLeft || 0,
                window.scrollX || 0,
              )
            : Math.max(
                document.documentElement.scrollTop || 0,
                document.body.scrollTop || 0,
                window.scrollY || 0,
              )
          return scrollVal
        }

        const scrollToAxisOffset = (axis, offset) => {
          const safeOffset = Math.max(0, offset)
          if (axis === "y") {
            const beforeDoc = document.documentElement.scrollTop
            const beforeBody = document.body.scrollTop
            const beforeWin = window.scrollY
            document.documentElement.scrollTop = safeOffset
            document.body.scrollTop = safeOffset
            window.scrollTo({ top: safeOffset, left: 0, behavior: "instant" })
            // Force reflow
            window.getComputedStyle(document.documentElement).overflow
            const afterDoc = document.documentElement.scrollTop
            const afterBody = document.body.scrollTop
            const afterWin = window.scrollY
            debugLog(
              'scrollTo: axis=y offset=' + safeOffset +
              ' doc[' + beforeDoc + '→' + afterDoc + ']' +
              ' body[' + beforeBody + '→' + afterBody + ']' +
              ' win[' + beforeWin + '→' + afterWin + ']'
            )
          } else {
            document.documentElement.scrollLeft = safeOffset
            document.body.scrollLeft = safeOffset
            window.scrollTo({ left: safeOffset, top: 0, behavior: "instant" })
          }
        }

        const getScrollInlineOffset = () => {
          return getAxisScrollOffset(getInlineScrollAxis(layoutState.isVerticalWriting))
        }

        const getBlockExtent = (isVertical) => {
          const axis = getBlockScrollAxis(isVertical)
          const scrollContainer = getScrollContainer(axis)
          if (scrollContainer) {
            return axis === "x"
              ? Math.max(scrollContainer.scrollWidth || 0, scrollContainer.clientWidth || 0)
              : Math.max(scrollContainer.scrollHeight || 0, scrollContainer.clientHeight || 0)
          }

          return isVertical
            ? Math.max(
                document.documentElement?.scrollWidth || 0,
                document.body?.scrollWidth || 0,
              )
            : Math.max(
                document.documentElement?.scrollHeight || 0,
                document.body?.scrollHeight || 0,
              )
        }

        const computePageMetrics = () => {
          const isPaginated = viewerState.readingStyle !== "verticalScroll"
          const spreadPageCount = getSpreadPageCount()
          const { isVerticalWriting } = getLayoutDirectionState()
          const inlineViewportSize = Math.max(
            1,
            isVerticalWriting ? window.innerHeight || 1 : window.innerWidth || 1,
          )
          const blockViewportSize = Math.max(
            1,
            isVerticalWriting ? window.innerWidth || 1 : window.innerHeight || 1,
          )

          if (!isPaginated) {
            const totalPages = Math.max(1, Math.ceil(getBlockExtent(isVerticalWriting) / blockViewportSize))
            return {
              blockPageSize: blockViewportSize,
              inlinePageSize: inlineViewportSize,
              isPaginated,
              isVerticalWriting,
              logicalPagesPerUnit: 1,
              physicalPageCount: totalPages,
              spreadPageCount: 1,
            }
          }

          const pageInlineSize = getPageInlineSize(
            inlineViewportSize,
            spreadPageCount,
            isVerticalWriting,
          )
          const logicalPagesPerUnit = getLogicalPagesPerUnit(isVerticalWriting, spreadPageCount)

          // Total inline extent of the fragmented columns, read from the multicol
          // container itself. Paginated mode puts overflow:clip on body, so the
          // column overflow never reaches documentElement — Calibre measures
          // documentElement only because it leaves body unclipped.
          const pw = getPageWrapper()
          const measureAxis = isVerticalWriting ? 'scrollHeight' : 'scrollWidth'
          const effectiveExtent = pw ? pw[measureAxis] || 0 : 0

          const unitCount = Math.max(1, Math.ceil(effectiveExtent / pageInlineSize))
          const physicalPageCount = Math.max(
            1,
            unitCount * logicalPagesPerUnit - (viewerState.leadingBlankPage ? 1 : 0),
          )

          debugLog(
            'measure: axis=' + measureAxis + ' val=' + effectiveExtent +
            ' pageInlineSize=' + pageInlineSize +
            ' units=' + unitCount +
            ' perUnit=' + logicalPagesPerUnit +
            ' pages=' + physicalPageCount +
            ' cover=' + isCoverOnlyDocument()
          )

          return {
            blockPageSize: blockViewportSize,
            inlinePageSize: pageInlineSize,
            isPaginated,
            isVerticalWriting,
            logicalPagesPerUnit,
            physicalPageCount,
            spreadPageCount,
          }
        }

        // Track current page offset in a variable instead of parsing
        // the DOM transform string. Chrome converts translateY(-918px)
        // to matrix(1,0,0,1,0,-918) on readback, which doesn't match
        // a translateY regex and would always return parsed=0.
        let currentPageOffset = 0

        const setPageOffset = (offset) => {
          currentPageOffset = offset
        }

        const getPageOffset = () => currentPageOffset

        const getCurrentPhysicalPage = () => {
          if (layoutState.isPaginated) {
            const offset = getPageOffset()
            const unit = Math.max(0, Math.round(offset / layoutState.inlinePageSize))
            const logicalPage = unit * Math.max(1, layoutState.logicalPagesPerUnit || 1)
            if (viewerState.leadingBlankPage) {
              return logicalPage === 0 ? 0 : Math.max(0, logicalPage - 1)
            }
            return logicalPage
          }

          return Math.max(
            0,
            Math.round(
              getAxisScrollOffset(getBlockScrollAxis(layoutState.isVerticalWriting)) /
                layoutState.blockPageSize,
            ),
          )
        }

        const debugLog = (msg) => {
          try { console.log('[tb-debug]', msg) } catch {}
          try {
            postPayload({ type: 'debug', key: documentKey, message: String(msg) })
          } catch {}
        }

        const notifyPagination = () => {
          layoutState = computePageMetrics()
          const currentPage = Math.max(
            0,
            Math.min(getCurrentPhysicalPage(), layoutState.physicalPageCount - 1),
          )
          viewerState.currentPage = currentPage

          debugLog(
            'pages=' + layoutState.physicalPageCount +
            ' current=' + currentPage +
            ' isVert=' + layoutState.isVerticalWriting +
            ' scrollH=' + (document.body?.scrollHeight || 0) +
            ' scrollW=' + (document.body?.scrollWidth || 0) +
            ' clientH=' + (document.body?.clientHeight || 0) +
            ' clientW=' + (document.body?.clientWidth || 0) +
            ' inlineSize=' + layoutState.inlinePageSize +
            ' blockSize=' + layoutState.blockPageSize
          )

          postPayload({
            type: paginationMessageType,
            key: documentKey,
            currentPage,
            totalPages: layoutState.physicalPageCount,
          })
        }

        const doLayout = () => {
          const spreadPageCount = getSpreadPageCount()
          const isPaginated = viewerState.readingStyle !== "verticalScroll"
          clearLayoutOverrides()
          applyPreferredWritingMode()
          applyDerivedRootWritingMode()
          const { isVerticalWriting, rtl } = getLayoutDirectionState()

          const viewportWidth = Math.max(1, window.innerWidth || 1)
          const viewportHeight = Math.max(1, window.innerHeight || 1)
          const inlineViewportSize = Math.max(
            1,
            isVerticalWriting ? viewportHeight : viewportWidth,
          )
          const pageInlineSize = getPageInlineSize(
            inlineViewportSize,
            spreadPageCount,
            isVerticalWriting,
          )
          // 縦書きの論理ページ箱の幅。単一ページ=1箱、見開き=2箱をこの幅から作る。
          const verticalPageWidth = isVerticalWriting
            ? getVerticalPageWidth(viewportWidth, viewportHeight)
            : 0

          // 実際にレイアウトへ渡したビューポート寸法を控えておく。resize 時に
          // documentElement の実寸とこれを比べ、食い違っていれば doLayout() を回す。
          lastLayoutViewport = [
            viewportWidth,
            viewportHeight,
            pageInlineSize,
            spreadPageCount,
            isVerticalWriting,
            verticalPageWidth,
          ]

          document.documentElement.style.height = "100%"
          document.documentElement.style.width = "100%"
          if (rtl) {
            document.documentElement.style.overflow = "visible"
          }
          document.body.classList.toggle("obs-paginated", isPaginated)
          applyImportantStyle(document.body, "background-color", initialThemeFallbackBackgroundColor)
          applyImportantStyle(document.body, "color", themeTextColor)
          applyImportantStyle(document.body, "min-width", "0")
          applyImportantStyle(document.body, "max-width", "none")
          applyImportantStyle(document.body, "min-height", "0")
          applyImportantStyle(document.body, "margin", "0")
          applyImportantStyle(document.body, "padding", "0")
          applyImportantStyle(document.body, "border-width", "0")
          applyImportantStyle(document.body, "box-sizing", "content-box")
          applyImportantStyle(document.body, "overflow-wrap", "break-word")
          applyImportantStyle(document.body, "width", viewportWidth + "px")
          applyImportantStyle(document.body, "height", viewportHeight + "px")
          applyImportantStyle(document.body, "max-height", viewportHeight + "px")
          document.body.style.setProperty("-webkit-margin-collapse", "separate")

          if (isPaginated) {
            // CSS columns on wrapper create page-sized fragments. Body has
            // overflow:hidden (no scroll). Page navigation via CSS transform
            // on the wrapper shifts which column is visible in the viewport.
            const pw = getPageWrapper()
            if (pw) {
              applyImportantStyle(pw, "-webkit-column-gap", "0px")
              applyImportantStyle(pw, "column-gap", "0px")
              applyImportantStyle(pw, "-webkit-column-width", pageInlineSize + "px")
              applyImportantStyle(pw, "column-width", pageInlineSize + "px")
              applyImportantStyle(pw, "column-fill", "auto")
              applyImportantStyle(pw, "column-rule", "0px inset transparent")
              // Wrapper is exactly one page's inline size. No overflow
              // setting — default visible lets columns overflow naturally.
              // Body's overflow:hidden clips the viewport boundary.
              // 表紙 spine では画像が column-width より小さい場合に空き領域が
              // 次の列に折り返され、scrollHeight が viewportHeight を超える。
              // overflow:hidden で見えない列をクリップする。
              // ※ coverOnlyPage は下の 1185行目で宣言されるため、ここでは使えない。
              //    表紙 spine の overflow は下の coverOnlyPage 宣言後に設定する。
              if (isVerticalWriting) {
                // 1ユニット = 論理ページ箱 × spread。単一ページは1箱、見開きは2箱が
                // 横に並ぶ（vertical-rl の行は右→左へ進むので右半分が先のページ）。
                const contentWidth = verticalPageWidth * spreadPageCount
                applyImportantStyle(pw, "height", pageInlineSize + "px")
                applyImportantStyle(pw, "width", contentWidth + "px")
                // vertical-rl では block-start が右なので、既定では右端に立つ。
                // margin-left と margin-inline-* は over-constrained で無視されるため、
                // 中央寄せは物理プロパティの margin-right を px 指定する。
                applyImportantStyle(
                  pw,
                  "margin-right",
                  Math.max(0, Math.floor((viewportWidth - contentWidth) / 2)) + "px",
                )
                applyImportantStyle(pw, "margin-left", "0px")
              } else {
                applyImportantStyle(pw, "width", pageInlineSize + "px")
                applyImportantStyle(pw, "height", "100%")
              }
            }
            // Body: clip at viewport boundary. Use overflow:clip instead of
            // overflow:hidden — Chrome's overflow:hidden triggers a rendering
            // optimization that skips painting content outside the clipped
            // area. When translateY brings that content into view, it's
            // blank because it was never rendered. overflow:clip clips
            // without this optimization.
            applyImportantStyle(document.body, "overflow", "clip")
            document.documentElement.style.overflow = "clip"
          } else {
            applyImportantStyle(document.body, "overflow-x", "hidden")
            applyImportantStyle(document.body, "overflow-y", "auto")
          }

          // 表紙 spine は縦スクロール（isPaginated=false）でも画面高さに揃える。
          // ページ箱が画面いっぱいになるモード（単一ページ・縦スクロール・全画面化した
          // 見開き+表紙）では中央へ。見開きの半ページ箱では箱内の位置を変えない。
          // 縦書きは 1ユニット＝見開きで表紙が右半ページに来るのが正なので中央にしない。
          const centerCoverImage = isCoverOnlyDocument() && !isVerticalWriting && spreadPageCount === 1
          const mediaElements = document.querySelectorAll("img, svg, video, canvas, iframe")
          for (const element of mediaElements) {
            if (isPaginated) {
              if (isVerticalWriting) {
                applyImportantStyle(element, "max-height", pageInlineSize + "px")
                // 見開きでも画像は論理1ページ分に収める（2ページをまたがせない）。
                applyImportantStyle(element, "max-width", verticalPageWidth + "px")
              } else {
                applyImportantStyle(element, "max-width", pageInlineSize + "px")
                applyImportantStyle(element, "max-height", viewportHeight + "px")
              }
            }

            if (!isCoverOnlyDocument()) {
              continue
            }

            // max-* は上限指定なので、元の表紙が画面より小さいと小さいまま左詰めで残る。
            // 表紙は縦幅を画面高さに固定し、width:auto でアスペクト比を保つ。
            // display:block は inline 画像のベースライン隙間（数pxの縦溢出）も消す。
            applyImportantStyle(element, "display", "block")
            applyImportantStyle(element, "height", viewportHeight + "px")
            applyImportantStyle(element, "width", "auto")
            applyImportantStyle(element, "margin-left", centerCoverImage ? "auto" : "0px")
            applyImportantStyle(element, "margin-right", centerCoverImage ? "auto" : "0px")
          }

          // TEMP DIAGNOSTIC: 表紙の縦溢出を診断するため、実測値をログに出す。確認後に削除予定。
          if (isCoverOnlyDocument()) {
            const diagImg = document.querySelector("img, svg")
            if (diagImg) {
              const r = diagImg.getBoundingClientRect()
              const pw = document.getElementById("obs-page-wrapper")
              const pwRect = pw ? pw.getBoundingClientRect() : null
              debugLog(
                "cover-diag: " +
                  JSON.stringify({
                    vh: viewportHeight,
                    iw: window.innerWidth,
                    ih: window.innerHeight,
                    imgTop: Math.round(r.top),
                    imgH: Math.round(r.height),
                    imgBottom: Math.round(r.bottom),
                    bodySH: document.body.scrollHeight,
                    wrapperH: pwRect ? Math.round(pwRect.height) : null,
                    wrapperTop: pwRect ? Math.round(pwRect.top) : null,
                    initialDone: initialLayoutDone,
                  }),
              )
            }
            // TEMP DIAGNOSTIC: wrapper 内の子要素の詳細を記録。確認後に削除予定。
            const pw = document.getElementById("obs-page-wrapper")
            if (pw) {
              const children = Array.from(pw.children)
              const childInfo = children.map((child) => {
                const rect = child.getBoundingClientRect()
                const style = window.getComputedStyle(child)
                return {
                  tag: child.tagName.toLowerCase(),
                  text: (child.textContent || "").slice(0, 50).replace(/\\s+/g, " "),
                  h: Math.round(rect.height),
                  w: Math.round(rect.width),
                  top: Math.round(rect.top),
                  bottom: Math.round(rect.bottom),
                  marginTop: style.marginTop,
                  marginBottom: style.marginBottom,
                  paddingTop: style.paddingTop,
                  paddingBottom: style.paddingBottom,
                }
              })
              debugLog("cover-children: " + JSON.stringify({ childCount: children.length, children: childInfo }))
            }
          }

          normalizePaginatedRootContainers()
          normalizeFirstColumnElements()
          applyThemeOverrides()
        }

        const applyLayout = () => {
          // Save the logical page before doLayout() clears column-width.
          // Removing column-width collapses horizontal overflow, causing the browser
          // to reset window.scrollX to 0. We restore position via scrollToPhysicalPage
          // so that notifyPagination() reads the correct page after every relayout.
          const savedPage = viewerState.currentPage
          doLayout()
          // Debug: check column properties on wrapper after doLayout
          const pw_debug = getPageWrapper()
          if (pw_debug) {
            const cs = window.getComputedStyle(pw_debug)
            debugLog(
              'cols: cw=' + cs.columnWidth +
              ' cc=' + cs.columnCount +
              ' wm=' + cs.writingMode +
              ' h=' + cs.height +
              ' sh=' + (pw_debug.scrollHeight || 0) +
              ' sw=' + (pw_debug.scrollWidth || 0)
            )
          }
          scrollToPhysicalPage(savedPage)
          notifyPagination()
        }

        const scheduleLayout = () => {
          if (scheduledLayoutFrame) {
            return
          }

          scheduledLayoutFrame = window.requestAnimationFrame(() => {
            scheduledLayoutFrame = 0
            applyLayout()
          })
        }

        const scrollToPhysicalPage = (page) => {
          layoutState = computePageMetrics()
          const safePage = Math.max(0, Math.min(page, layoutState.physicalPageCount - 1))
          viewerState.currentPage = safePage

          if (layoutState.isPaginated) {
            const internalPage =
              viewerState.leadingBlankPage && safePage > 0 ? safePage + 1 : safePage
            // 縦書きの見開きは1ユニット（画面いっぱいの列）に論理2ページが入るので、
            // 論理ページをユニット番号へ換算してからオフセットを出す。横書きは
            // logicalPagesPerUnit=1 なので従来通り internalPage がそのままユニットになる。
            const perUnit = Math.max(1, layoutState.logicalPagesPerUnit || 1)
            const unit = Math.floor(internalPage / perUnit)
            const offset = unit * layoutState.inlinePageSize
            const pw = getPageWrapper()
            if (pw) {
              if (layoutState.isVerticalWriting) {
                pw.style.transform = 'translateY(-' + offset + 'px)'
              } else {
                pw.style.transform = 'translateX(-' + offset + 'px)'
              }
              // Force Chrome to render off-screen CSS column content
              // that translateY moves into the viewport. Without this,
              // Chrome's rendering optimization sometimes skips painting
              // column content that was previously outside overflow:clip.
              window.getComputedStyle(pw).transform
            }
            setPageOffset(offset)
            debugLog(
              'scrollPage: page=' + safePage + ' internal=' + internalPage +
              ' unit=' + unit + ' perUnit=' + perUnit +
              ' offset=' + offset +
              ' isVert=' + layoutState.isVerticalWriting
            )
          } else {
            const offset = safePage * layoutState.blockPageSize
            scrollToAxisOffset(getBlockScrollAxis(layoutState.isVerticalWriting), offset)
          }

          window.setTimeout(notifyPagination, 0)
        }

        const scrollToAnchor = (rawAnchor) => {
          if (!rawAnchor) {
            return false
          }

          const escapedId = typeof CSS !== "undefined" && typeof CSS.escape === "function"
            ? CSS.escape(rawAnchor)
            : rawAnchor.replace(/"/g, '\\"')
          const target =
            document.getElementById(rawAnchor) ||
            document.querySelector('[name="' + escapedId + '"]')

          if (!(target instanceof Element)) {
            return false
          }

          target.scrollIntoView({ block: "start", inline: "start", behavior: "auto" })
          window.setTimeout(notifyPagination, 0)
          return true
        }

        const applyCommandPayload = (payload) => {
          viewerState.readingStyle = payload.readingStyle ?? viewerState.readingStyle
          viewerState.pageDirection = payload.pageDirection ?? viewerState.pageDirection
          viewerState.leadingBlankPage =
            typeof payload.leadingBlankPage === "boolean"
              ? payload.leadingBlankPage
              : viewerState.leadingBlankPage
          currentAnchor = typeof payload.anchor === "string" ? payload.anchor : null

          doLayout()

          if (currentAnchor && scrollToAnchor(currentAnchor)) {
            return
          }

          if (typeof payload.page === "number") {
            scrollToPhysicalPage(Math.max(0, Math.floor(payload.page)))
          }
        }

        const handleCommand = (payload) => {
          if (!initialLayoutDone) {
            pendingCommandPayload = payload
            return
          }

          applyCommandPayload(payload)
        }

        const installCommandHandler = () => {
          window.addEventListener("message", (event) => {
            try {
              const payload =
                typeof event.data === "string" ? JSON.parse(event.data) : event.data

              if (payload?.type !== commandMessageType || payload?.key !== documentKey) {
                return
              }

              handleCommand(payload)
            } catch {
              // Ignore unrelated messages.
            }
          })
        }

        const waitForInitialResources = async () => {
          const pendingResources = []
          const waitForLoadOrError = (target) => {
            return new Promise((resolve) => {
              let settled = false
              const finish = () => {
                if (settled) {
                  return
                }
                settled = true
                target.removeEventListener("load", finish, true)
                target.removeEventListener("error", finish, true)
                resolve(undefined)
              }

              target.addEventListener("load", finish, true)
              target.addEventListener("error", finish, true)
            })
          }

          const stylesheetLinks = Array.from(document.querySelectorAll('link[rel~="stylesheet"]'))
          for (const link of stylesheetLinks) {
            pendingResources.push(waitForLoadOrError(link))
          }

          const mediaResources = Array.from(document.querySelectorAll("img, image, video, iframe"))
          for (const resource of mediaResources) {
            if (resource instanceof HTMLImageElement && resource.complete) {
              continue
            }
            if (resource instanceof HTMLVideoElement && resource.readyState >= 1) {
              continue
            }
            if (
              resource instanceof HTMLIFrameElement &&
              resource.contentDocument?.readyState === "complete"
            ) {
              continue
            }
            pendingResources.push(waitForLoadOrError(resource))
          }

          if (document.fonts?.ready) {
            pendingResources.push(document.fonts.ready.catch(() => undefined))
          }

          if (!pendingResources.length) {
            return
          }

          const timeout = new Promise((resolve) => {
            window.setTimeout(resolve, 5000)
          })
          await Promise.race([Promise.allSettled(pendingResources), timeout])
        }

        const installStylesheetAndFontObservers = () => {
          const stylesheetNodes = Array.from(
            document.querySelectorAll('link[rel~="stylesheet"], style'),
          )

          for (const node of stylesheetNodes) {
            node.addEventListener("load", scheduleLayout, true)
            node.addEventListener("error", scheduleLayout, true)
          }

          if (document.fonts?.ready) {
            document.fonts.ready.then(() => {
              scheduleLayout()
            })
          }
        }

        const installLongPressHandler = () => {
          let activePointerId = null
          let longPressTimer = 0
          let longPressTriggered = false
          let preventContextMenuUntil = 0
          let startX = 0
          let startY = 0

          const clearLongPressTimer = () => {
            if (!longPressTimer) {
              return
            }

            window.clearTimeout(longPressTimer)
            longPressTimer = 0
          }

          const beginLongPress = (x, y, pointerId) => {
            clearLongPressTimer()
            longPressTriggered = false
            startX = x
            startY = y
            activePointerId = pointerId
            longPressTimer = window.setTimeout(() => {
              longPressTimer = 0
              longPressTriggered = true
              preventContextMenuUntil = Date.now() + 1000
              postPayload({
                type: interactionMessageType,
                key: documentKey,
                action: longPressAction,
              })
            }, longPressDelayMs)
          }

          const shouldIgnoreTapTarget = (target) => {
            if (!(target instanceof Element)) {
              return false
            }

            return Boolean(target.closest("a, button, input, select, textarea, summary, label"))
          }

          const emitTap = (eventTarget, clientX, clientY) => {
            if (longPressTriggered || shouldIgnoreTapTarget(eventTarget)) {
              longPressTriggered = false
              return
            }

            postPayload({
              type: interactionMessageType,
              key: documentKey,
              action: tapAction,
              x: clientX,
              y: clientY,
              width: window.innerWidth || 1,
              height: window.innerHeight || 1,
            })
          }

          const updateLongPress = (x, y, pointerId) => {
            if (!longPressTimer) {
              return
            }

            if (activePointerId !== null && pointerId !== null && activePointerId !== pointerId) {
              return
            }

            if (
              Math.abs(x - startX) > longPressMoveThresholdPx ||
              Math.abs(y - startY) > longPressMoveThresholdPx
            ) {
              clearLongPressTimer()
            }
          }

          const endLongPress = (pointerId) => {
            if (activePointerId !== null && pointerId !== null && activePointerId !== pointerId) {
              return
            }

            clearLongPressTimer()
            activePointerId = null
          }

          if (typeof window.PointerEvent === "function") {
            document.addEventListener(
              "pointerdown",
              (event) => {
                if (event.isPrimary === false) {
                  return
                }

                if (typeof event.button === "number" && event.button !== 0) {
                  return
                }

                beginLongPress(
                  event.clientX || 0,
                  event.clientY || 0,
                  typeof event.pointerId === "number" ? event.pointerId : null,
                )
              },
              true,
            )

            document.addEventListener(
              "pointermove",
              (event) => {
                updateLongPress(
                  event.clientX || 0,
                  event.clientY || 0,
                  typeof event.pointerId === "number" ? event.pointerId : null,
                )
              },
              true,
            )

            document.addEventListener(
              "pointerup",
              (event) => {
                emitTap(event.target, event.clientX || 0, event.clientY || 0)
                endLongPress(typeof event.pointerId === "number" ? event.pointerId : null)
              },
              true,
            )

            document.addEventListener(
              "pointercancel",
              (event) => {
                endLongPress(typeof event.pointerId === "number" ? event.pointerId : null)
              },
              true,
            )
          } else {
            document.addEventListener(
              "touchstart",
              (event) => {
                const touch = event.touches?.[0]
                if (!touch || event.touches.length !== 1) {
                  return
                }

                beginLongPress(touch.clientX || 0, touch.clientY || 0, null)
              },
              true,
            )

            document.addEventListener(
              "touchmove",
              (event) => {
                const touch = event.touches?.[0]
                if (!touch) {
                  return
                }

                updateLongPress(touch.clientX || 0, touch.clientY || 0, null)
              },
              true,
            )

            document.addEventListener(
              "touchend",
              (event) => {
                const touch = event.changedTouches?.[0]
                emitTap(event.target, touch?.clientX || 0, touch?.clientY || 0)
                endLongPress(null)
              },
              true,
            )

            document.addEventListener(
              "touchcancel",
              () => {
                endLongPress(null)
              },
              true,
            )
          }

          document.addEventListener(
            "scroll",
            () => {
              endLongPress(null)
            },
            true,
          )

          document.addEventListener(
            "contextmenu",
            (event) => {
              if (Date.now() > preventContextMenuUntil) {
                return
              }

              event.preventDefault()
            },
            true,
          )
        }

        const installSelectionHandler = () => {
          document.addEventListener("mouseup", () => {
            const sel = window.getSelection()
            const text = sel ? sel.toString().trim() : ""
            if (!text.length) {
              return
            }

            postPayload({
              type: selectionMessageType,
              key: documentKey,
              text,
            })
          })
        }

        const applyHighlights = () => {
          if (!pageAnnotations || pageAnnotations.length === 0) return
          const colorMap = {
            yellow: "rgba(255,220,0,0.4)",
            green: "rgba(100,220,100,0.4)",
            blue: "rgba(100,180,255,0.4)",
            pink: "rgba(255,150,180,0.4)",
            purple: "rgba(200,130,255,0.4)",
          }
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
          const textNodes = []
          let node
          while ((node = walker.nextNode())) {
            if (node.parentElement?.matches(helperSelector)) {
              continue
            }
            textNodes.push(node)
          }
          for (const ann of pageAnnotations) {
            if (!ann.highlightedText) continue
            const color = colorMap[ann.styleWhich] || colorMap.yellow
            for (const textNode of textNodes) {
              const idx = textNode.nodeValue ? textNode.nodeValue.indexOf(ann.highlightedText) : -1
              if (idx === -1) continue
              const range = document.createRange()
              range.setStart(textNode, idx)
              range.setEnd(textNode, idx + ann.highlightedText.length)
              const mark = document.createElement("mark")
              mark.setAttribute("data-obs-ann-uuid", ann.uuid)
              mark.style.backgroundColor = color
              mark.style.color = "inherit"
              try {
                range.surroundContents(mark)
              } catch {
                // Skip if range spans multiple elements.
              }
              break
            }
          }
        }

        const installPaginationObserver = () => {
          let rafId = 0
          const schedulePaginationUpdate = () => {
            if (rafId) {
              return
            }

            rafId = window.requestAnimationFrame(() => {
              rafId = 0
              notifyPagination()
            })
          }

          // column-width / wrapper 幅 / body 幅は doLayout() がビューポート寸法から
          // 明示設定する。notifyPagination() だけを呼ぶと実レイアウトは古い寸法のまま
          // 残り、列境界とページオフセットがずれるので、寸法が変わっていたら再レイアウトする。
          const hasViewportChangedSinceLayout = () => {
            if (!Array.isArray(lastLayoutViewport)) {
              return false
            }

            return (
              document.documentElement.clientWidth !== lastLayoutViewport[0] ||
              document.documentElement.clientHeight !== lastLayoutViewport[1]
            )
          }

          const refreshForViewport = () => {
            if (hasViewportChangedSinceLayout()) {
              scheduleLayout()
              return
            }

            schedulePaginationUpdate()
          }

          window.addEventListener("scroll", schedulePaginationUpdate, { passive: true })
          document.addEventListener("scroll", schedulePaginationUpdate, true)
          window.addEventListener("resize", refreshForViewport)

          if (window.ResizeObserver) {
            // body のサイズは doLayout() が書き換えるので、同じ値の再設定では発火しない。
            // 実ビューポートと食い違っているときだけ再レイアウトへ切り替えることで
            // scheduleLayout → doLayout → ResizeObserver の無限ループを避ける。
            const observer = new ResizeObserver(refreshForViewport)
            observer.observe(document.body)
          }

          for (const image of Array.from(document.images)) {
            image.addEventListener("load", schedulePaginationUpdate, { once: true })
          }
        }

        render()
        applyHighlights()
        installStylesheetAndFontObservers()
        installCommandHandler()
        installLongPressHandler()
        installSelectionHandler()
        installPaginationObserver()
        await waitForInitialResources()
        applyLayout()
        initialLayoutDone = true
        if (pendingCommandPayload) {
          const payload = pendingCommandPayload
          pendingCommandPayload = null
          applyCommandPayload(payload)
        } else {
          scrollToPhysicalPage(viewerState.currentPage)
        }
        // Periodic scheduleLayout timeouts removed — with transform-based
        // pagination, layout is stable after the initial applyLayout. The
        // timeouts created a race: clearLayoutOverrides in doLayout() would
        // remove the page transform before notifyPagination read it.
        window.addEventListener("load", scheduleLayout)
        } catch (e) {
          try { console.log('[tb] ERROR:', e && e.message ? e.message : String(e)) } catch {}
          try { debugLog('FATAL: ' + (e && e.message ? e.message : String(e))) } catch {}
        }
      })()
    </script>
  </body>
</html>`
}
