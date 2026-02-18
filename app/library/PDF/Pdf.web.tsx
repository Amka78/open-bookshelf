import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"

import * as pdfjs from "pdfjs-dist/legacy/build/pdf"
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs"

export type PDFSource = {
  uri: string
  headers?: Record<string, string>
  cache?: boolean
}

export type PDFProps = {
  source: PDFSource
  page?: number
  singlePage?: boolean
  enablePaging?: boolean
  trustAllCerts?: boolean
  style?: StyleProp<ViewStyle>
  onLoadComplete?: (
    numberOfPages: number,
    path?: string,
    size?: { width: number; height: number },
  ) => void
} & Record<string, unknown>

type PdfDocument = {
  numPages: number
  getPage: (pageNumber: number) => Promise<any>
}
const pdfDocCache = new Map<string, Promise<PdfDocument>>()

if (!pdfjs.GlobalWorkerOptions?.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

const workerModule = pdfjsWorker as {
  WorkerMessageHandler?: unknown
  default?: { WorkerMessageHandler?: unknown }
}
const workerMessageHandler =
  workerModule.WorkerMessageHandler ?? workerModule.default?.WorkerMessageHandler

const sharedWorker = workerMessageHandler
  ? { WorkerMessageHandler: workerMessageHandler }
  : undefined

if (sharedWorker) {
  if (typeof globalThis !== "undefined") {
    ;(globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = sharedWorker
  }
  if (typeof window !== "undefined") {
    ;(window as { pdfjsWorker?: unknown }).pdfjsWorker = sharedWorker
  }
}

const normalizeHeaders = (headers?: Record<string, string>) => {
  if (!headers) return ""
  return Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}`)
    .join("|")
}

const getCacheKey = (source: PDFSource) => {
  return `${source.uri}|${normalizeHeaders(source.headers)}`
}

const loadPdfDocument = async (source: PDFSource) => {
  const cacheKey = getCacheKey(source)
  const cached = pdfDocCache.get(cacheKey)
  if (cached) return cached

  const docPromise = (async () => {
    const response = await fetch(source.uri, { headers: source.headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`)
    }
    const data = await response.arrayBuffer()
    return pdfjs.getDocument({ data, disableWorker: true }).promise
  })()

  pdfDocCache.set(cacheKey, docPromise)
  return docPromise
}

function WebPdf(props: PDFProps) {
  const { source, page = 1, style, onLoadComplete } = props
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const loadRef = useRef(false)

  const onLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const next = event.nativeEvent.layout
      if (!layout || next.width !== layout.width || next.height !== layout.height) {
        setLayout({ width: next.width, height: next.height })
      }
    },
    [layout],
  )

  const cacheKey = useMemo(() => getCacheKey(source), [source.uri, source.headers])

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      if (!canvasRef.current || !layout) return
      const doc = await loadPdfDocument(source)
      if (cancelled) return
      const currentPage = Math.min(Math.max(page, 1), doc.numPages)
      const pdfPage = await doc.getPage(currentPage)
      if (cancelled) return
      const viewport = pdfPage.getViewport({ scale: 1 })
      const scale = Math.min(
        layout.width / viewport.width || 1,
        layout.height / viewport.height || 1,
      )
      const scaledViewport = pdfPage.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      await pdfPage.render({ canvasContext: context, viewport: scaledViewport }).promise
      if (!loadRef.current) {
        loadRef.current = true
        onLoadComplete?.(doc.numPages, source.uri, {
          width: viewport.width,
          height: viewport.height,
        })
      }
    }

    render().catch((error) => {
      console.error("WebPdf render error", error)
    })

    return () => {
      cancelled = true
    }
  }, [cacheKey, layout, onLoadComplete, page, source])

  return (
    <View onLayout={onLayout} style={[styles.webContainer, style]}>
      {React.createElement("canvas", {
        ref: (node: HTMLCanvasElement | null) => {
          canvasRef.current = node
        },
        style: styles.webCanvas,
      })}
    </View>
  )
}

export function PDF(props: PDFProps) {
  return <WebPdf {...props} />
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  webCanvas: {
    width: "100%",
    height: "100%",
    display: "block",
  },
})
