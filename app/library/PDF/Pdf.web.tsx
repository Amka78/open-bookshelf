import React, { useEffect, useRef } from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"

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

/**
 * PDF ビューアコンポーネント（Web用）
 * ネイティブなHTMLの<iframe>を使用してPDFを表示
 * BookViewerと統合して複数ページをサポート
 */
function WebPdf(props: PDFProps) {
  const { source, page = 1, style, onLoadComplete } = props
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    // 既存の iframe を削除
    if (iframeRef.current?.parentNode) {
      iframeRef.current.parentNode.removeChild(iframeRef.current)
      iframeRef.current = null
    }

    loadedRef.current = false

    // 新しい iframe を作成
    const iframe = document.createElement("iframe")

    // URLに page パラメータを追加 (1ベースのページ番号)
    const pageAnchor = page ? `#page=${page}` : ""
    iframe.src = `${source.uri}${pageAnchor}`
    iframe.style.width = "100%"
    iframe.style.height = "100%"
    iframe.style.border = "none"
    //iframe.allow = "fullscreen"

    iframe.onload = () => {
      if (!loadedRef.current) {
        loadedRef.current = true
        // PDF読み込み成功を通知
        onLoadComplete?.(1, source.uri, { width: 800, height: 1000 })
      }
    }

    iframe.onerror = () => {
      console.error("Failed to load PDF:", source.uri)
    }

    containerRef.current.appendChild(iframe)
    iframeRef.current = iframe
  }, [source.uri, page, onLoadComplete])

  return (
    <View style={[{ flex: 1, width: "100%", height: "100%" }, style]} ref={containerRef as any} />
  )
}

export function PDF(props: PDFProps) {
  return <WebPdf {...props} />
}
