/**
 * Electrobun の同梱 Web バンドルは 127.0.0.1 の Bun サーバーから配信される。
 * Calibre へのリクエストをそのサーバーの /__calibre/ 以下へ通すことで、
 * WebView から見たオリジンを同一にして CORS を回避する。
 * Web 開発時も同じ経路を別プロセスのローカルプロキシで使える。
 */
import { Platform } from "react-native"

const PROXY_PATH = "/__calibre/"

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "")
}

/**
 * プロキシのオリジン。Electrobun のメインプロセスが preload で注入する。
 * 同梱バンドルを 127.0.0.1 で配信している場合は location.origin でも一致する。
 */
export function getCalibreProxyOrigin(): string | null {
  if (typeof window === "undefined") return null

  const injected = window.__ELECTROBUN_PROXY_ORIGIN
  if (injected) return injected.replace(/\/+$/, "")

  // Web リリース（Docker）では nginx が同一オリジンに /__calibre/ を提供する。
  if (window.__CALIBRE_WEB_PROXY__ === true && window.location?.origin) {
    return window.location.origin
  }

  // Web 開発時は Metro とは別に起動したプロキシ（scripts/calibreProxyDevServer.ts）を使う。
  // ネイティブで 127.0.0.1 を指してしまう事故を避けるため web に限定する。
  const devProxyOrigin = process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN
  if (__DEV__ && Platform.OS === "web" && devProxyOrigin) {
    return devProxyOrigin.trim().replace(/\/+$/, "")
  }

  if (window.__ELECTROBUN__ === true && window.location?.hostname === "127.0.0.1") {
    return window.location.origin
  }

  return null
}

/**
 * Calibre のベース URL を、同一オリジンのプロキシ URL に変換する。
 * Electrobun 以外（Web / ネイティブ）では null を返し、元の URL をそのまま使う。
 */
export function buildCalibreProxyBase(baseUrl: string): string | null {
  const origin = getCalibreProxyOrigin()
  const normalized = normalizeBaseUrl(baseUrl)
  if (!origin || !normalized) return null

  return `${origin}${PROXY_PATH}${encodeURIComponent(normalized)}`
}

/**
 * 画像やファイル URL を組み立てるときのベース URL。
 * Electrobun ではプロキシ URL、それ以外では元の URL を返す。
 */
export function getCalibreRequestBase(baseUrl: string): string {
  const normalized = normalizeBaseUrl(baseUrl)
  return buildCalibreProxyBase(normalized) ?? normalized
}

/**
 * プロキシ URL を上流の URL に戻す。Digest 認証の uri は上流のパスで
 * 計算する必要があるため、Authorization を作る前にこれを通す。
 */
export function toCalibreUpstreamUrl(
  url: string,
  proxyBase: string | null,
  originalBase: string | null,
): string {
  if (!proxyBase || !originalBase) return url
  if (!url.startsWith(proxyBase)) return url

  return `${originalBase}${url.slice(proxyBase.length)}`
}
