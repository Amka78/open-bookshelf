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
  documentData,
  documentKey,
  initialPage,
  leadingBlankPage,
  pageDirection,
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
        overflow: auto;
        overscroll-behavior: contain;
        word-break: normal;
        overflow-wrap: break-word;
      }
      body.obs-paginated {
        height: 100vh !important;
        max-height: 100vh !important;
      }
      body.obs-paginated > * {
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
      ;(() => {
        const serializedData = JSON.parse(document.getElementById("obs-serialized-data")?.textContent || "{}")
        const documentKey = ${escapedDocumentKey}
        const nsMap = Array.isArray(serializedData.ns_map) ? serializedData.ns_map : []
        const helperSelector = '[data-obs-helper="1"]'
        const anchor = document.getElementById("obs-body-anchor")
        const paginationMessageType = ${serializeForScriptTag(textBookViewerPaginationMessageType)}
        const interactionMessageType = ${serializeForScriptTag(textBookViewerInteractionMessageType)}
        const selectionMessageType = ${serializeForScriptTag(textBookViewerSelectionMessageType)}
        const commandMessageType = ${serializeForScriptTag(textBookViewerCommandMessageType)}
        const tapAction = ${serializeForScriptTag(textBookViewerTapAction)}
        const longPressAction = ${serializeForScriptTag(textBookViewerLongPressAction)}
        const themeMode = ${escapedThemeMode}
        const themeTextColor = ${escapedTextColor}
        const themeLinkColor = ${escapedLinkColor}
        const initialThemeFallbackBackgroundColor = ${escapedFallbackBackgroundColor}
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
        }
        let currentAnchor = null
        let scheduledLayoutFrame = 0

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

        const normalizeFirstColumnElements = () => {
          const bodyChildren = Array.from(document.querySelectorAll("body > *")).filter(
            (element) => !element.matches(helperSelector),
          )

          if (bodyChildren.length === 1) {
            bodyChildren[0].style.setProperty("height", "auto", "important")
            bodyChildren[0].style.setProperty("min-height", "0", "important")
            bodyChildren[0].style.setProperty("max-height", "none", "important")
          }

          const first = firstElementChild(document.body)
          if (!first || first.matches(helperSelector)) {
            return
          }

          first.style.setProperty("break-before", "avoid", "important")
          if (first.tagName.toLowerCase() !== "div") {
            return
          }

          const nestedFirst = firstElementChild(first)
          if (nestedFirst && !hasStartText(first)) {
            nestedFirst.style.setProperty("break-before", "avoid", "important")
          }
        }

        const renderBodyNode = (bodyNode) => {
          clearRenderedBodyNodes()
          document.body.removeAttribute("style")
          applyAttributes(bodyNode, document.body)

          const fragment = document.createDocumentFragment()

          if (bodyNode?.x) {
            fragment.appendChild(document.createTextNode(bodyNode.x))
          }

          if (Array.isArray(bodyNode?.c)) {
            for (const child of bodyNode.c) {
              appendNode(child, fragment, false)
            }
          }

          if (anchor) {
            document.body.insertBefore(fragment, anchor)
          } else {
            document.body.appendChild(fragment)
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
        }

        const getSpreadPageCount = () => {
          return viewerState.readingStyle === "facingPage" ||
            viewerState.readingStyle === "facingPageWithTitle"
            ? 2
            : 1
        }

        const getLayoutDirectionState = () => {
          const computedBodyStyle = window.getComputedStyle(document.body)
          const computedHtmlStyle = window.getComputedStyle(document.documentElement)
          const writingMode = (
            computedBodyStyle.getPropertyValue("writing-mode") ||
            computedBodyStyle.writingMode ||
            computedHtmlStyle.getPropertyValue("writing-mode") ||
            computedHtmlStyle.writingMode ||
            ""
          ).trim().toLowerCase()
          const verticalRl = writingMode === "vertical-rl"
          const verticalLr = writingMode === "vertical-lr"
          const vertical = verticalRl || verticalLr
          const rtl = verticalRl || computedBodyStyle.direction === "rtl"

          return {
            isVerticalWriting: vertical,
            ltr: verticalLr || !rtl,
            rtl,
            writingMode,
          }
        }

        const getScrollInlineOffset = () => {
          return layoutState.isVerticalWriting ? window.scrollY || 0 : window.scrollX || 0
        }

        const getInlineExtent = (isVertical) => {
          return isVertical
            ? Math.max(
                document.documentElement?.scrollHeight || 0,
                document.body?.scrollHeight || 0,
              )
            : Math.max(
                document.documentElement?.scrollWidth || 0,
                document.body?.scrollWidth || 0,
              )
        }

        const getBlockExtent = () => {
          return Math.max(
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
            const totalPages = Math.max(1, Math.ceil(getBlockExtent() / blockViewportSize))
            return {
              blockPageSize: blockViewportSize,
              inlinePageSize: inlineViewportSize,
              isPaginated,
              isVerticalWriting,
              physicalPageCount: totalPages,
              spreadPageCount: 1,
            }
          }

          const pageInlineSize = Math.max(1, inlineViewportSize / spreadPageCount)
          const internalPageCount = Math.max(1, Math.ceil(getInlineExtent(isVerticalWriting) / pageInlineSize))
          const physicalPageCount = Math.max(
            1,
            internalPageCount - (viewerState.leadingBlankPage ? 1 : 0),
          )

          return {
            blockPageSize: blockViewportSize,
            inlinePageSize: pageInlineSize,
            isPaginated,
            isVerticalWriting,
            physicalPageCount,
            spreadPageCount,
          }
        }

        const getCurrentPhysicalPage = () => {
          if (layoutState.isPaginated) {
            const internalPage = Math.max(
              0,
              Math.round(getScrollInlineOffset() / layoutState.inlinePageSize),
            )
            if (viewerState.leadingBlankPage) {
              return internalPage === 0 ? 0 : Math.max(0, internalPage - 1)
            }

            return internalPage
          }

          return Math.max(
            0,
            Math.round((window.scrollY || 0) / layoutState.blockPageSize),
          )
        }

        const notifyPagination = () => {
          layoutState = computePageMetrics()
          const currentPage = Math.max(
            0,
            Math.min(getCurrentPhysicalPage(), layoutState.physicalPageCount - 1),
          )
          viewerState.currentPage = currentPage

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
          const { isVerticalWriting, rtl } = getLayoutDirectionState()
          const viewportWidth = Math.max(1, window.innerWidth || 1)
          const viewportHeight = Math.max(1, window.innerHeight || 1)
          const inlineViewportSize = Math.max(
            1,
            isVerticalWriting ? viewportHeight : viewportWidth,
          )
          const pageInlineSize = Math.max(1, Math.floor(inlineViewportSize / spreadPageCount))

          clearLayoutOverrides()
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
            applyImportantStyle(document.body, "-webkit-column-gap", "0px")
            applyImportantStyle(document.body, "column-gap", "0px")
            applyImportantStyle(document.body, "-webkit-column-width", pageInlineSize + "px")
            applyImportantStyle(document.body, "column-width", pageInlineSize + "px")
            applyImportantStyle(document.body, "column-fill", "auto")
            applyImportantStyle(document.body, "column-rule", "0px inset transparent")

            if (isVerticalWriting) {
              applyImportantStyle(document.body, "overflow-x", "hidden")
              applyImportantStyle(document.body, "overflow-y", "auto")
            } else {
              applyImportantStyle(document.body, "overflow-x", "auto")
              applyImportantStyle(document.body, "overflow-y", "hidden")
            }
          } else {
            applyImportantStyle(document.body, "overflow-x", "hidden")
            applyImportantStyle(document.body, "overflow-y", "auto")
          }

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
            const offset = internalPage * layoutState.inlinePageSize
            if (layoutState.isVerticalWriting) {
              window.scrollTo({ top: offset, left: 0, behavior: "auto" })
            } else {
              window.scrollTo({ left: offset, top: 0, behavior: "auto" })
            }
          } else {
            const offset = safePage * layoutState.blockPageSize
            window.scrollTo({ top: offset, left: 0, behavior: "auto" })
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

        const handleCommand = (payload) => {
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

          window.addEventListener("scroll", schedulePaginationUpdate, { passive: true })
          window.addEventListener("resize", schedulePaginationUpdate)

          if (window.ResizeObserver) {
            const observer = new ResizeObserver(() => schedulePaginationUpdate())
            observer.observe(document.body)
          }

          for (const image of Array.from(document.images)) {
            image.addEventListener("load", schedulePaginationUpdate, { once: true })
          }
        }

        render()
        applyLayout()
        applyHighlights()
        installStylesheetAndFontObservers()
        installCommandHandler()
        installLongPressHandler()
        installSelectionHandler()
        installPaginationObserver()
        scrollToPhysicalPage(viewerState.currentPage)
        window.setTimeout(scheduleLayout, 50)
        window.setTimeout(scheduleLayout, 250)
        window.setTimeout(scheduleLayout, 1000)
        window.addEventListener("load", scheduleLayout)
      })()
    </script>
  </body>
</html>`
}
