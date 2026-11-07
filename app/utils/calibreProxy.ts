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

  // Web 開発（dev:web）や、プロキシを別ホストで動かす静的ビルドでは
  // EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN をビルド時に埋め込む。
  // ネイティブで 127.0.0.1 を指してしまう事故を避けるため web に限定する。
  const configuredProxyOrigin = process.env.EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN
  if (Platform.OS === "web" && configuredProxyOrigin) {
    return configuredProxyOrigin.trim().replace(/\/+$/, "")
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

const ABSOLUTE_HTTP_URL = /^https?:\/\//i
const ANY_URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i
const SPECIAL_URL_SCHEME = /^(?:data|blob|file):/i

/**
 * 上流の URL を WebView から見たプロキシ URL に変換する。
 * - 相対パスは元のベース URL 配下としてプロキシする
 * - 絶対 URL は元のベースと同じオリジンのときだけプロキシする
 * - すでにプロキシ URL、data/blob/file、外部ホストはそのまま返す
 */
export function toCalibreRequestUrl(baseUrl: string | null | undefined, target: string): string {
  if (!target || !baseUrl) return target
  if (SPECIAL_URL_SCHEME.test(target)) return target
  if (ANY_URL_SCHEME.test(target) && !ABSOLUTE_HTTP_URL.test(target)) return target

  const proxyOrigin = getCalibreProxyOrigin()
  if (proxyOrigin && target.startsWith(`${proxyOrigin}${PROXY_PATH}`)) return target

  if (!ABSOLUTE_HTTP_URL.test(target) && !target.startsWith("//")) {
    const normalizedBase = normalizeBaseUrl(baseUrl)
    const path = target.startsWith("/") ? target : `/${target}`
    const proxyBase = buildCalibreProxyBase(normalizedBase)

    return proxyBase ? `${proxyBase}${path}` : `${normalizedBase}${path}`
  }

  let targetUrl: URL
  let base: URL
  try {
    targetUrl = new URL(target, baseUrl)
    base = new URL(baseUrl)
  } catch {
    return target
  }

  if (targetUrl.origin !== base.origin) return target

  // ベース URL 配下の絶対 URL は、Digest 認証の uri 計算に使える
  // ベース単位のプロキシ URL へ寄せる。
  const normalizedBase = normalizeBaseUrl(baseUrl)
  if (targetUrl.href === normalizedBase || targetUrl.href.startsWith(`${normalizedBase}/`)) {
    const baseProxy = buildCalibreProxyBase(normalizedBase)
    if (baseProxy) {
      return `${baseProxy}${targetUrl.href.slice(normalizedBase.length)}`
    }
  }

  const originProxy = buildCalibreProxyBase(`${targetUrl.protocol}//${targetUrl.host}`)
  if (!originProxy) return target

  return `${originProxy}${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
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
  // ベース URL のパス外（例: OPDS の絶対 URL）をプロキシした場合も
  // エンコードされたベースを取り出して上流 URL に戻せるようにする。
  const proxyOrigin = getCalibreProxyOrigin()
  if (proxyOrigin && url.startsWith(`${proxyOrigin}${PROXY_PATH}`)) {
    const rest = url.slice(`${proxyOrigin}${PROXY_PATH}`.length)
    const slashIndex = rest.indexOf("/")
    const encodedBase = slashIndex === -1 ? rest : rest.slice(0, slashIndex)
    const path = slashIndex === -1 ? "/" : rest.slice(slashIndex)
    try {
      return `${decodeURIComponent(encodedBase).replace(/\/+$/, "")}${path}`
    } catch {
      return url
    }
  }

  if (!proxyBase || !originalBase) return url
  if (!url.startsWith(proxyBase)) return url

  return `${originalBase}${url.slice(proxyBase.length)}`
}
