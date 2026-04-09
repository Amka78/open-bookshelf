/**
 * PDF — Expo Go 互換バリアント
 *
 * react-native-pdf は Expo Go の SDK に含まれないため、
 * WebView + pdfjs-dist を使った PDFWebPage に差し替える。
 * USE_EXPO_GO=true で起動した場合にのみ metro resolver によって選択される。
 *
 * このファイルは react-native-pdf の ComponentProps から実際に使われている
 * propsのサブセットのみを定義し、型の互換性を保つ。
 */
import type { StyleProp, ViewStyle } from "react-native"
import { PDFWebPage } from "./PDFWebPage"

/** react-native-pdf の Source 型の互換サブセット */
type PDFSource = {
  uri: string
  headers?: Record<string, string>
  cache?: boolean
}

/**
 * PDFViewerScreen が渡す react-native-pdf の props サブセット。
 * Expo Go では未対応のプロパティは silent に無視される。
 */
export type PDFProps = {
  source: PDFSource
  page?: number
  style?: StyleProp<ViewStyle>
  /** react-native-pdf 互換: (numberOfPages, filePath, pageSize) */
  onLoadComplete?: (
    numberOfPages: number,
    filePath: string,
    size?: { width: number; height: number },
  ) => void
  onError?: (error: unknown) => void
  // Expo Go では使用されないが型の互換性のために保持
  trustAllCerts?: boolean
  enablePaging?: boolean
  scrollEnabled?: boolean
  singlePage?: boolean
}

export function PDF({ source, page = 1, style, onLoadComplete, onError }: PDFProps) {
  const handleTotalPages = (totalPages: number) => {
    onLoadComplete?.(totalPages, source.uri, undefined)
  }

  const handleError = (message: string) => {
    onError?.(new Error(message))
  }

  return (
    <PDFWebPage
      uri={source.uri}
      pageNumber={page}
      headers={source.headers}
      style={style as StyleProp<ViewStyle>}
      onTotalPages={handleTotalPages}
      onError={handleError}
    />
  )
}
