import { api } from "@/services/api"
import { logger } from "@/utils/logger"
import { useEffect, useMemo, useState } from "react"

export type BookHtmlPageProps = {
  libraryId: string
  bookId: number
  format: string
  size: number
  hash: number
  pagePath: string
  headers?: Record<string, string>
  availableWidth?: number
  availableHeight?: number
  onLongPress?: () => void
  themeMode?: "light" | "dark"
  themeTextColor?: string
  themeLinkColor?: string
  themeFallbackBackgroundColor?: string
}

type SerializedHtmlAttribute = [string, string, number?]

type SerializedHtmlNode = {
  n?: string
  a?: SerializedHtmlAttribute[]
  c?: Array<SerializedHtmlNode | string>
  x?: string
  l?: string
  s?: number
}

type SerializedHtmlDocument = {
  tree: SerializedHtmlNode
  ns_map: string[]
}

type BookResourceDescriptor = {
  fragment?: string
  name: string
}

type UseCalibreHtmlDocumentResult = {
  autoHeight: boolean
  documentKey: string
  error: string | null
  html: string | null
  loading: boolean
}

const DUMMY_ORIGIN = "https://open-bookshelf.local/"
const BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
const BASE64_INDEX = new Map(Array.from(BASE64_TABLE).map((char, index) => [char, index]))
const CALIBRE_VIRTUAL_RESOURCE_PATTERN = /(?:^|\/)[^/|?#]+\|([^|]+)\|$/
const CALIBRE_VIRTUAL_RESOURCE_TOKEN_PATTERN = /[^/|?#]+\|([^|]+)\|/g
export const calibreHtmlPageSizeMessageType = "open-bookshelf:calibre-html-size"
export const calibreHtmlPageInteractionMessageType = "open-bookshelf:calibre-html-interaction"
export const calibreHtmlPageLongPressAction = "long-press"

const preparedPageCache = new Map<string, Promise<SerializedHtmlDocument>>()
const resourceDataUrlCache = new Map<string, Promise<string>>()
const stylesheetDataUrlCache = new Map<string, Promise<string>>()
const textDataUrlCache = new Map<string, Promise<string>>()

const resourceAttrNames = new Set(["src", "href", "poster", "data"])

const stripHashAndQuery = (value: string) => {
  return value.split(/[?#]/, 1)[0] ?? value
}

const buildBookCachePrefix = (props: BookHtmlPageProps) => {
  return [props.libraryId, props.bookId, props.format, props.size, props.hash].join(":")
}

const buildPageCacheKey = (props: BookHtmlPageProps) => {
  return `${buildBookCachePrefix(props)}:${props.pagePath}`
}

const buildRemoteBookFileUrl = (props: BookHtmlPageProps, path: string) => {
  const url = api.getBookFileUrl(
    props.bookId,
    props.format,
    props.size,
    props.hash,
    path,
    props.libraryId,
  )
  logger.debug("Built book file URL", { url, path })
  return url
}

const serializeForScriptTag = (value: unknown) => {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

const getMimeTypeFromResponse = (response: Response, fallback = "application/octet-stream") => {
  const contentType = response.headers.get("content-type")?.trim()
  return contentType ? contentType.split(";", 1)[0] : fallback
}

const textToDataUrl = (text: string, mimeType: string) => {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(text)}`
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let base64 = ""

  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index] ?? 0
    const byte2 = bytes[index + 1] ?? 0
    const byte3 = bytes[index + 2] ?? 0
    const triplet = (byte1 << 16) | (byte2 << 8) | byte3

    base64 += BASE64_TABLE[(triplet >> 18) & 0x3f]
    base64 += BASE64_TABLE[(triplet >> 12) & 0x3f]
    base64 += index + 1 < bytes.length ? BASE64_TABLE[(triplet >> 6) & 0x3f] : "="
    base64 += index + 2 < bytes.length ? BASE64_TABLE[triplet & 0x3f] : "="
  }

  return base64
}

const appendFragment = (dataUrl: string, fragment?: string) => {
  return fragment ? `${dataUrl}#${fragment}` : dataUrl
}

const decodeBase64ToBytes = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, "")
  if (!normalized) {
    return new Uint8Array(0)
  }

  const bytes: number[] = []
  let buffer = 0
  let bitCount = 0

  for (const char of normalized) {
    if (char === "=") {
      break
    }

    const nextValue = BASE64_INDEX.get(char)
    if (nextValue === undefined) {
      return undefined
    }

    buffer = (buffer << 6) | nextValue
    bitCount += 6

    while (bitCount >= 8) {
      bitCount -= 8
      bytes.push((buffer >> bitCount) & 0xff)
    }
  }

  return new Uint8Array(bytes)
}

const decodeBase64Utf8 = (value: string) => {
  const bytes = decodeBase64ToBytes(value)
  if (!bytes) {
    return undefined
  }

  if (typeof TextDecoder !== "undefined") {
    try {
      return new TextDecoder("utf-8").decode(bytes)
    } catch {
      // Fall back to a simple byte-to-char conversion below.
    }
  }

  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
}

const decodeCalibreVirtualizedResource = (encodedValue: string) => {
  const [encodedName, fragment] = encodedValue.split("#", 2)
  if (!encodedName) {
    return undefined
  }

  const decodedName = decodeBase64Utf8(encodedName)
  if (!decodedName) {
    return undefined
  }

  return {
    name: decodeURIComponent(decodedName),
    fragment: fragment || undefined,
  }
}

const resolveCalibreVirtualizedPath = (rawValue: string): BookResourceDescriptor | undefined => {
  const match = rawValue.trim().match(CALIBRE_VIRTUAL_RESOURCE_PATTERN)
  if (!match) {
    return undefined
  }

  return decodeCalibreVirtualizedResource(match[1])
}

const replaceCalibreVirtualizedTokens = (rawValue: string) => {
  let changed = false

  const replacedValue = rawValue.replace(
    CALIBRE_VIRTUAL_RESOURCE_TOKEN_PATTERN,
    (match, encodedValue: string) => {
      const decoded = decodeCalibreVirtualizedResource(encodedValue)
      if (!decoded) {
        return match
      }

      changed = true
      return decoded.fragment ? `${decoded.name}#${decoded.fragment}` : decoded.name
    },
  )

  return changed ? replacedValue : undefined
}

const createDescriptorFromValue = (value: string): BookResourceDescriptor | undefined => {
  if (shouldIgnoreResourceValue(value)) {
    return undefined
  }

  const [pathWithQuery, fragment] = value.split("#", 2)
  const [name] = pathWithQuery.split("?", 1)
  const normalizedName = decodeURIComponent(name.replace(/^\//, ""))
  if (!normalizedName) {
    return undefined
  }

  return {
    name: normalizedName,
    fragment: fragment || undefined,
  }
}

const resolveRelativeDescriptor = (basePath: string, rawValue: string) => {
  if (shouldIgnoreResourceValue(rawValue)) {
    return undefined
  }

  try {
    const baseUrl = new URL(basePath, DUMMY_ORIGIN)
    const resolved = new URL(rawValue, baseUrl)
    return {
      name: decodeURIComponent(resolved.pathname.replace(/^\//, "")),
      fragment: resolved.hash ? resolved.hash.slice(1) : undefined,
    }
  } catch {
    return undefined
  }
}

const resolveBookRelativePathCandidates = (basePath: string, rawValue: string) => {
  const candidates: BookResourceDescriptor[] = []
  const seen = new Set<string>()

  const addCandidate = (candidate: BookResourceDescriptor | undefined) => {
    if (!candidate?.name) {
      return
    }

    const candidateKey = `${candidate.name}#${candidate.fragment ?? ""}`
    if (seen.has(candidateKey)) {
      return
    }

    seen.add(candidateKey)
    candidates.push(candidate)
  }

  const replacedVirtualizedValue = replaceCalibreVirtualizedTokens(rawValue)

  addCandidate(resolveCalibreVirtualizedPath(rawValue))

  if (replacedVirtualizedValue) {
    addCandidate(createDescriptorFromValue(replacedVirtualizedValue))
    addCandidate(resolveRelativeDescriptor(basePath, replacedVirtualizedValue))
  }

  addCandidate(resolveRelativeDescriptor(basePath, rawValue))

  return candidates
}

const loadResolvedResource = async (
  candidates: BookResourceDescriptor[],
  loader: (path: string) => Promise<string>,
) => {
  let lastError: unknown

  for (const candidate of candidates) {
    try {
      const dataUrl = await loader(candidate.name)
      return {
        dataUrl,
        fragment: candidate.fragment,
        path: candidate.name,
      }
    } catch (error) {
      lastError = error
      logger.debug("Failed resource candidate", {
        candidate: candidate.name,
        fragment: candidate.fragment,
      })
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error("Failed to resolve book resource")
}

const shouldIgnoreResourceValue = (value: string) => {
  const normalized = value.trim()

  return (
    !normalized ||
    normalized.startsWith("#") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("javascript:") ||
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:") ||
    normalized.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(normalized)
  )
}

const resolveBookRelativePath = (
  basePath: string,
  rawValue: string,
): BookResourceDescriptor | undefined => {
  return resolveBookRelativePathCandidates(basePath, rawValue)[0]
}

const isStylesheetAttribute = (
  tagName: string,
  attrName: string,
  attrs: SerializedHtmlAttribute[],
) => {
  if (tagName !== "link" || attrName !== "href") {
    return false
  }

  const typeValue = attrs.find(([name]) => name.toLowerCase() === "type")?.[1]
  if ((typeValue?.toLowerCase() ?? "text/css") !== "text/css") {
    return false
  }

  const relValue = attrs.find(([name]) => name.toLowerCase() === "rel")?.[1] ?? "stylesheet"

  return relValue
    .split(/\s+/)
    .map((value) => value.toLowerCase())
    .includes("stylesheet")
}

const shouldInlineResourceAttribute = (
  tagName: string,
  attrName: string,
  attrs: SerializedHtmlAttribute[],
) => {
  if (!resourceAttrNames.has(attrName)) {
    return false
  }

  if (attrName === "href") {
    return tagName === "image" || isStylesheetAttribute(tagName, attrName, attrs)
  }

  if (attrName === "data") {
    return tagName === "object"
  }

  return true
}

const fetchBookFileResponse = async (props: BookHtmlPageProps, path: string) => {
  logger.debug("Fetching book resource", {
    path,
    bookId: props.bookId,
    libraryId: props.libraryId,
    format: props.format,
  })
  const response = await fetch(buildRemoteBookFileUrl(props, path), {
    headers: props.headers,
  })

  if (!response.ok) {
    logger.error("Failed to fetch book resource", { path, status: response.status })
    throw new Error(`Failed to load book resource: ${path}`)
  }

  logger.debug("Fetched book resource", { path, status: response.status })

  return response
}

const loadBinaryResourceDataUrl = async (props: BookHtmlPageProps, path: string) => {
  const cacheKey = `asset:${buildBookCachePrefix(props)}:${path}`
  const cached = resourceDataUrlCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const request = (async () => {
    const response = await fetchBookFileResponse(props, path)
    const mimeType = getMimeTypeFromResponse(response)
    const buffer = await response.arrayBuffer()
    return `data:${mimeType};base64,${arrayBufferToBase64(buffer)}`
  })()

  resourceDataUrlCache.set(cacheKey, request)
  return request
}

const loadTextResourceDataUrl = async (props: BookHtmlPageProps, path: string) => {
  const cacheKey = `text:${buildBookCachePrefix(props)}:${path}`
  const cached = textDataUrlCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const request = (async () => {
    const response = await fetchBookFileResponse(props, path)
    logger.debug("Loaded text resource", { path, status: response.status })
    const mimeType = getMimeTypeFromResponse(response, "text/plain")
    const text = await response.text()
    return textToDataUrl(text, mimeType)
  })()

  textDataUrlCache.set(cacheKey, request)
  return request
}

const rewriteCssReference = async (
  rawValue: string,
  currentPath: string,
  props: BookHtmlPageProps,
  stylesheetStack: Set<string>,
  asStylesheet = false,
) => {
  const unquotedValue = rawValue.trim().replace(/^['"]|['"]$/g, "")
  const resolvedCandidates = resolveBookRelativePathCandidates(currentPath, unquotedValue)
  if (!resolvedCandidates.length) {
    return undefined
  }

  const loadedResource = await loadResolvedResource(resolvedCandidates, (path) => {
    return asStylesheet || /\.css$/i.test(stripHashAndQuery(path))
      ? loadStylesheetDataUrl(props, path, stylesheetStack)
      : loadBinaryResourceDataUrl(props, path)
  })

  return appendFragment(loadedResource.dataUrl, loadedResource.fragment)
}

const rewriteCssImportRules = async (
  cssText: string,
  currentPath: string,
  props: BookHtmlPageProps,
  stylesheetStack: Set<string>,
) => {
  let rewrittenCss = cssText

  const urlImportMatches = Array.from(
    rewrittenCss.matchAll(/@import\s+url\(\s*(['"]?)([^'")]+)\1\s*\)([^;]*);/gi),
  )

  for (const match of urlImportMatches.reverse()) {
    const rawUrlValue = match[2]?.trim()
    if (!rawUrlValue) {
      continue
    }

    const rewrittenImportUrl = await rewriteCssReference(
      rawUrlValue,
      currentPath,
      props,
      stylesheetStack,
      true,
    )
    if (!rewrittenImportUrl) {
      continue
    }

    const trailingQuery = match[3] ?? ""
    const replacement = `@import url("${rewrittenImportUrl}")${trailingQuery};`
    rewrittenCss =
      rewrittenCss.slice(0, match.index ?? 0) +
      replacement +
      rewrittenCss.slice((match.index ?? 0) + match[0].length)
  }

  const stringImportMatches = Array.from(
    rewrittenCss.matchAll(/@import\s+(['"])([^'"]+)\1([^;]*);/gi),
  )

  for (const match of stringImportMatches.reverse()) {
    const rawUrlValue = match[2]?.trim()
    if (!rawUrlValue) {
      continue
    }

    const rewrittenImportUrl = await rewriteCssReference(
      rawUrlValue,
      currentPath,
      props,
      stylesheetStack,
      true,
    )
    if (!rewrittenImportUrl) {
      continue
    }

    const trailingQuery = match[3] ?? ""
    const replacement = `@import url("${rewrittenImportUrl}")${trailingQuery};`
    rewrittenCss =
      rewrittenCss.slice(0, match.index ?? 0) +
      replacement +
      rewrittenCss.slice((match.index ?? 0) + match[0].length)
  }

  return rewrittenCss
}

const rewriteCssUrls = async (
  cssText: string,
  currentPath: string,
  props: BookHtmlPageProps,
  stylesheetStack: Set<string>,
) => {
  let rewrittenCss = await rewriteCssImportRules(cssText, currentPath, props, stylesheetStack)

  const matches = Array.from(rewrittenCss.matchAll(/url\(([^)]+)\)/gi))
  if (!matches.length) {
    return rewrittenCss
  }

  for (const match of matches.reverse()) {
    const rawUrlValue = match[1]?.trim()
    if (!rawUrlValue) {
      continue
    }

    const rewrittenUrl = await rewriteCssReference(rawUrlValue, currentPath, props, stylesheetStack)
    if (!rewrittenUrl) {
      continue
    }

    const replacement = `url("${rewrittenUrl}")`
    rewrittenCss =
      rewrittenCss.slice(0, match.index ?? 0) +
      replacement +
      rewrittenCss.slice((match.index ?? 0) + match[0].length)
  }

  return rewrittenCss
}

const loadStylesheetDataUrl = async (
  props: BookHtmlPageProps,
  path: string,
  parentStack: Set<string>,
) => {
  const cacheKey = `css:${buildBookCachePrefix(props)}:${path}`
  const cached = stylesheetDataUrlCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const request = (async () => {
    if (parentStack.has(path)) {
      return textToDataUrl("", "text/css")
    }
    logger.debug("Loading stylesheet", { path })
    const response = await fetchBookFileResponse(props, path)
    logger.debug("Loaded stylesheet", { path, status: response.status })
    const mimeType = getMimeTypeFromResponse(response, "text/css")
    const text = await response.text()
    const rewritten = await rewriteCssUrls(text, path, props, new Set([...parentStack, path]))
    return textToDataUrl(rewritten, mimeType)
  })()

  stylesheetDataUrlCache.set(cacheKey, request)
  return request
}

const inlineSerializedNodeResources = async (
  node: SerializedHtmlNode | string,
  currentPath: string,
  props: BookHtmlPageProps,
) => {
  if (!node || typeof node === "string") {
    return
  }

  const tagName = node.n?.toLowerCase() ?? ""
  const attributes = node.a ?? []

  if (tagName === "link" && !isStylesheetAttribute(tagName, "href", attributes)) {
    node.a = attributes.filter(([name]) => name.toLowerCase() !== "href")
  }

  for (const attribute of attributes) {
    const attrName = attribute[0]?.toLowerCase()
    const attrValue = attribute[1]

    if (!attrName || typeof attrValue !== "string") {
      continue
    }

    if (attrName === "style") {
      attribute[1] = await rewriteCssUrls(attrValue, currentPath, props, new Set([currentPath]))
      continue
    }

    if (!shouldInlineResourceAttribute(tagName, attrName, attributes)) {
      continue
    }

    const resolvedCandidates = resolveBookRelativePathCandidates(currentPath, attrValue)
    if (!resolvedCandidates.length) {
      continue
    }

    let inlinedUrl: string
    let inlinedFragment: string | undefined
    if (tagName === "link" && attrName === "href") {
      const loadedResource = await loadResolvedResource(resolvedCandidates, (path) => {
        return loadStylesheetDataUrl(props, path, new Set([currentPath]))
      })
      inlinedUrl = loadedResource.dataUrl
      inlinedFragment = loadedResource.fragment
    } else if (tagName === "script" && attrName === "src") {
      const loadedResource = await loadResolvedResource(resolvedCandidates, (path) => {
        return loadTextResourceDataUrl(props, path)
      })
      inlinedUrl = loadedResource.dataUrl
      inlinedFragment = loadedResource.fragment
    } else {
      const loadedResource = await loadResolvedResource(resolvedCandidates, (path) => {
        return loadBinaryResourceDataUrl(props, path)
      })
      inlinedUrl = loadedResource.dataUrl
      inlinedFragment = loadedResource.fragment
    }

    attribute[1] = appendFragment(inlinedUrl, inlinedFragment)
  }

  if (tagName === "style" && typeof node.x === "string") {
    node.x = await rewriteCssUrls(node.x, currentPath, props, new Set([currentPath]))
  }

  if (Array.isArray(node.c)) {
    for (const child of node.c) {
      await inlineSerializedNodeResources(child, currentPath, props)
    }
  }
}

const prepareSerializedHtmlDocument = async (props: BookHtmlPageProps) => {
  logger.debug("Preparing book page", { pagePath: props.pagePath })
  const response = await fetchBookFileResponse(props, props.pagePath)

  logger.debug("Loaded page resource", { path: props.pagePath, status: response.status })
  const rawText = await response.text()

  const parsed = JSON.parse(rawText) as SerializedHtmlDocument
  const prepared = JSON.parse(JSON.stringify(parsed)) as SerializedHtmlDocument
  logger.debug("Fetched page content", { rawText: rawText, parsed: parsed, prepared: prepared })

  await inlineSerializedNodeResources(prepared.tree, props.pagePath, props)

  return prepared
}

const buildPreparedHtmlDocument = (
  documentData: SerializedHtmlDocument,
  documentKey: string,
  scrollMode: "content" | "viewport",
  appearance: {
    themeMode: "light" | "dark"
    textColor: string
    linkColor: string
    fallbackBackgroundColor: string
  },
) => {
  const serializedData = serializeForScriptTag(documentData)
  const escapedDocumentKey = serializeForScriptTag(documentKey)
  const escapedScrollMode = serializeForScriptTag(scrollMode)
  const escapedThemeMode = serializeForScriptTag(appearance.themeMode)
  const escapedTextColor = serializeForScriptTag(appearance.textColor)
  const escapedLinkColor = serializeForScriptTag(appearance.linkColor)
  const escapedFallbackBackgroundColor = serializeForScriptTag(appearance.fallbackBackgroundColor)

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
      }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        background: transparent;
        color: var(--obs-text-color);
      }
      body.obs-viewport {
        height: 100vh;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
      body.obs-content {
        overflow: hidden;
      }
      #obs-root {
        width: 100%;
      }
      body.obs-dark {
        color: var(--obs-text-color);
      }
      body.obs-dark a,
      body.obs-dark a * {
        color: var(--obs-link-color);
      }
      img, svg, video, canvas, iframe {
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="obs-root"></div>
    <script id="obs-serialized-data" type="application/json">${serializedData}</script>
    <script>
      ;(() => {
        const serializedData = JSON.parse(document.getElementById("obs-serialized-data")?.textContent || "{}")
        const documentKey = ${escapedDocumentKey}
        const scrollMode = ${escapedScrollMode}
        const nsMap = Array.isArray(serializedData.ns_map) ? serializedData.ns_map : []
        const root = document.getElementById("obs-root")
        const headMark = "data-obs-head"
        const sizeMessageType = ${serializeForScriptTag(calibreHtmlPageSizeMessageType)}
        const interactionMessageType = ${serializeForScriptTag(
          calibreHtmlPageInteractionMessageType,
        )}
        const longPressAction = ${serializeForScriptTag(calibreHtmlPageLongPressAction)}
        const themeMode = ${escapedThemeMode}
        const themeTextColor = ${escapedTextColor}
        const themeLinkColor = ${escapedLinkColor}
        const themeFallbackBackgroundColor = ${escapedFallbackBackgroundColor}
        const longPressDelayMs = 450
        const longPressMoveThresholdPx = 10

        const removeMarkedHeadNodes = () => {
          const nodes = document.head.querySelectorAll("[" + headMark + '="1"]')
          for (const node of nodes) {
            node.parentNode?.removeChild(node)
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
                // Fallback to regular attributes below.
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
            element.setAttribute(headMark, "1")
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

        const renderBodyNode = (bodyNode) => {
          if (!root) {
            return
          }

          root.replaceChildren()
          applyAttributes(bodyNode, document.body)

          if (bodyNode?.x) {
            root.appendChild(document.createTextNode(bodyNode.x))
          }

          if (Array.isArray(bodyNode?.c)) {
            for (const child of bodyNode.c) {
              appendNode(child, root, false)
            }
          }
        }

        const render = () => {
          const htmlNode = serializedData?.tree
          if (!htmlNode) {
            return
          }

          document.body.classList.remove("obs-content", "obs-viewport")
          document.body.classList.add(scrollMode === "viewport" ? "obs-viewport" : "obs-content")
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
          document.body.classList.add(scrollMode === "viewport" ? "obs-viewport" : "obs-content")
        }

        const postPayload = (payload) => {
          const message = JSON.stringify(payload)

          if (window.ReactNativeWebView?.postMessage) {
            window.ReactNativeWebView.postMessage(message)
          }

          if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*")
          }
        }

        const notifySize = () => {
          const height = Math.max(
            document.documentElement?.scrollHeight || 0,
            document.body?.scrollHeight || 0,
            root?.scrollHeight || 0,
          )

          postPayload({ type: sizeMessageType, key: documentKey, height })
        }

        const parseCssColor = (value) => {
          if (typeof value !== "string") {
            return null
          }

          const normalized = value.trim().toLowerCase()
          if (!normalized || normalized === "transparent") {
            return null
          }

          const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/)
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

          const hexMatch = normalized.match(/^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i)
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

        const getFallbackBackgroundColor = () => {
          return parseCssColor(themeFallbackBackgroundColor)
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

          return getFallbackBackgroundColor()
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

          const candidates = [document.body]
          if (root) {
            candidates.push(...Array.from(root.querySelectorAll("*")))
          }

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

        const installLongPressHandler = () => {
          let activePointerId = null
          let longPressTimer = 0
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
            startX = x
            startY = y
            activePointerId = pointerId
            longPressTimer = window.setTimeout(() => {
              longPressTimer = 0
              preventContextMenuUntil = Date.now() + 1000
              postPayload({
                type: interactionMessageType,
                key: documentKey,
                action: longPressAction,
              })
            }, longPressDelayMs)
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
              () => {
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

            document.addEventListener(
              "mousedown",
              (event) => {
                if (event.button !== 0) {
                  return
                }

                beginLongPress(event.clientX || 0, event.clientY || 0, null)
              },
              true,
            )

            document.addEventListener(
              "mousemove",
              (event) => {
                updateLongPress(event.clientX || 0, event.clientY || 0, null)
              },
              true,
            )

            document.addEventListener(
              "mouseup",
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

        render()
        applyThemeOverrides()
        installLongPressHandler()
        notifySize()
        window.setTimeout(() => {
          applyThemeOverrides()
          notifySize()
        }, 50)
        window.setTimeout(() => {
          applyThemeOverrides()
          notifySize()
        }, 250)
        window.addEventListener("load", () => {
          applyThemeOverrides()
          notifySize()
        })
        window.addEventListener("resize", notifySize)

        if (window.ResizeObserver && root) {
          const observer = new ResizeObserver(() => notifySize())
          observer.observe(root)
        }
      })()
    </script>
  </body>
</html>`
}

const loadPreparedPage = (props: BookHtmlPageProps) => {
  logger.debug("Loading book page", {
    pagePath: props.pagePath,
    bookId: props.bookId,
    libraryId: props.libraryId,
    format: props.format,
    size: props.size,
    hash: props.hash,
  })
  const cacheKey = buildPageCacheKey(props)
  const cached = preparedPageCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const request = prepareSerializedHtmlDocument(props)
  preparedPageCache.set(cacheKey, request)
  return request
}

export const useCalibreHtmlDocument = (props: BookHtmlPageProps): UseCalibreHtmlDocumentResult => {
  const [preparedDocument, setPreparedDocument] = useState<SerializedHtmlDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { bookId, format, hash, headers, libraryId, pagePath, size } = props
  const headersKey = JSON.stringify(headers ?? {})
  const stableHeaders = useMemo(
    () => (headersKey ? (JSON.parse(headersKey) as Record<string, string>) : undefined),
    [headersKey],
  )
  const documentKey = buildPageCacheKey({
    libraryId,
    bookId,
    format,
    size,
    hash,
    pagePath,
    headers: stableHeaders,
  })
  const autoHeight = typeof props.availableHeight !== "number"

  useEffect(() => {
    let cancelled = false

    const requestProps: BookHtmlPageProps = {
      libraryId,
      bookId,
      format,
      size,
      hash,
      pagePath,
      headers: stableHeaders,
    }

    setLoading(true)
    setError(null)

    loadPreparedPage(requestProps)
      .then((result) => {
        if (cancelled) {
          return
        }

        setPreparedDocument(result)
        setLoading(false)
      })
      .catch((loadError) => {
        if (cancelled) {
          return
        }

        setPreparedDocument(null)
        setError(loadError instanceof Error ? loadError.message : "Failed to load book page")
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [bookId, format, hash, libraryId, pagePath, size, stableHeaders])

  const html = useMemo(() => {
    if (!preparedDocument) {
      return null
    }

    return buildPreparedHtmlDocument(
      preparedDocument,
      documentKey,
      autoHeight ? "content" : "viewport",
      {
        themeMode: props.themeMode ?? "light",
        textColor: props.themeTextColor ?? "#111318",
        linkColor: props.themeLinkColor ?? props.themeTextColor ?? "#111318",
        fallbackBackgroundColor: props.themeFallbackBackgroundColor ?? "#ffffff",
      },
    )
  }, [
    autoHeight,
    documentKey,
    preparedDocument,
    props.themeFallbackBackgroundColor,
    props.themeLinkColor,
    props.themeMode,
    props.themeTextColor,
  ])

  return {
    autoHeight,
    documentKey,
    error,
    html,
    loading,
  }
}
