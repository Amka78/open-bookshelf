import { api } from "@/services/api"
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
const BOOK_SIZE_MESSAGE_TYPE = "open-bookshelf:calibre-html-size"

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
  return api.getBookFileUrl(
    props.bookId,
    props.format,
    props.size,
    props.hash,
    path,
    props.libraryId,
  )
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

const isStylesheetAttribute = (
  tagName: string,
  attrName: string,
  attrs: SerializedHtmlAttribute[],
) => {
  if (tagName !== "link" || attrName !== "href") {
    return false
  }

  const relValue = attrs.find(([name]) => name.toLowerCase() === "rel")?.[1]
  if (!relValue) {
    return false
  }

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
  const response = await fetch(buildRemoteBookFileUrl(props, path), {
    headers: props.headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to load book resource: ${path}`)
  }

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
    const mimeType = getMimeTypeFromResponse(response, "text/plain")
    const text = await response.text()
    return textToDataUrl(text, mimeType)
  })()

  textDataUrlCache.set(cacheKey, request)
  return request
}

const rewriteCssUrls = async (
  cssText: string,
  currentPath: string,
  props: BookHtmlPageProps,
  stylesheetStack: Set<string>,
) => {
  const matches = Array.from(cssText.matchAll(/url\(([^)]+)\)/gi))
  if (!matches.length) {
    return cssText
  }

  let rewrittenCss = cssText

  for (const match of matches.reverse()) {
    const rawUrlValue = match[1]?.trim()
    if (!rawUrlValue) {
      continue
    }

    const unquotedValue = rawUrlValue.replace(/^['"]|['"]$/g, "")
    const resolved = resolveBookRelativePath(currentPath, unquotedValue)
    if (!resolved) {
      continue
    }

    const isStylesheet = /\.css$/i.test(stripHashAndQuery(resolved.name))
    const dataUrl = isStylesheet
      ? await loadStylesheetDataUrl(props, resolved.name, stylesheetStack)
      : await loadBinaryResourceDataUrl(props, resolved.name)

    const replacement = `url("${appendFragment(dataUrl, resolved.fragment)}")`
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

    const response = await fetchBookFileResponse(props, path)
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

    const resolved = resolveBookRelativePath(currentPath, attrValue)
    if (!resolved) {
      continue
    }

    let inlinedUrl: string
    if (tagName === "link" && attrName === "href") {
      inlinedUrl = await loadStylesheetDataUrl(props, resolved.name, new Set([currentPath]))
    } else if (tagName === "script" && attrName === "src") {
      inlinedUrl = await loadTextResourceDataUrl(props, resolved.name)
    } else {
      inlinedUrl = await loadBinaryResourceDataUrl(props, resolved.name)
    }

    attribute[1] = appendFragment(inlinedUrl, resolved.fragment)
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
  const response = await fetchBookFileResponse(props, props.pagePath)
  const rawText = await response.text()
  const parsed = JSON.parse(rawText) as SerializedHtmlDocument
  const prepared = JSON.parse(JSON.stringify(parsed)) as SerializedHtmlDocument

  await inlineSerializedNodeResources(prepared.tree, props.pagePath, props)

  return prepared
}

const buildPreparedHtmlDocument = (
  documentData: SerializedHtmlDocument,
  documentKey: string,
  scrollMode: "content" | "viewport",
) => {
  const serializedData = serializeForScriptTag(documentData)
  const escapedDocumentKey = serializeForScriptTag(documentKey)
  const escapedScrollMode = serializeForScriptTag(scrollMode)

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        background: transparent;
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
        const sizeMessageType = ${serializeForScriptTag(BOOK_SIZE_MESSAGE_TYPE)}

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

        const notifySize = () => {
          const height = Math.max(
            document.documentElement?.scrollHeight || 0,
            document.body?.scrollHeight || 0,
            root?.scrollHeight || 0,
          )
          const payload = JSON.stringify({ type: sizeMessageType, key: documentKey, height })

          if (window.ReactNativeWebView?.postMessage) {
            window.ReactNativeWebView.postMessage(payload)
          }

          if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, "*")
          }
        }

        render()
        notifySize()
        window.setTimeout(notifySize, 50)
        window.setTimeout(notifySize, 250)
        window.addEventListener("load", notifySize)
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
    )
  }, [autoHeight, documentKey, preparedDocument])

  return {
    autoHeight,
    documentKey,
    error,
    html,
    loading,
  }
}

export const calibreHtmlPageSizeMessageType = BOOK_SIZE_MESSAGE_TYPE
