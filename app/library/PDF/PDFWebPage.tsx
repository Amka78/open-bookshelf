import React, { useCallback } from "react"
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native"
import { WebView, type WebViewMessageEvent } from "react-native-webview"
import { PDF_IIFE_BUNDLE, WORKER_IIFE_BUNDLE } from "./pdfjsBundle"

export interface PDFWebPageProps {
  uri: string
  pageNumber: number
  headers?: Record<string, string>
  pdfBase64?: string
  style?: StyleProp<ViewStyle>
  onTotalPages?: (total: number) => void
  onError?: (message: string) => void
}

function buildPageHtml(
  uri: string,
  pageNumber: number,
  headers?: Record<string, string>,
  pdfBase64?: string,
): string {
  const uriJson = JSON.stringify(uri)
  const headersJson = JSON.stringify(headers ?? {})
  const pdfBase64Json = JSON.stringify(pdfBase64 ?? null)
  const workerBundleJson = JSON.stringify(WORKER_IIFE_BUNDLE)
  const pdfBundle = PDF_IIFE_BUNDLE.replaceAll("</script>", "<\\/script>")

  return (
    "<!DOCTYPE html>" +
    "<html><head>" +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
    "<style>" +
    "* { margin: 0; padding: 0; box-sizing: border-box; }" +
    "html, body {" +
    "  width: 100%; height: 100%;" +
    "  background: #fff;" +
    "  display: flex;" +
    "  justify-content: center;" +
    "  align-items: center;" +
    "  overflow: hidden;" +
    "}" +
    "canvas { display: block; max-width: 100%; }" +
    "#error { display: none; padding: 16px; color: #b00020; font-size: 12px; word-break: break-word; }" +
    "</style></head><body>" +
    '<canvas id="pdf-canvas"></canvas>' +
    '<div id="error"></div>' +
    "<script>" +
    "window.addEventListener('error', function(event) {" +
    "  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: String(event.message || event.error || 'Unknown error') }));" +
    "});" +
    "window.addEventListener('unhandledrejection', function(event) {" +
    "  var reason = event && event.reason ? String(event.reason) : 'Unhandled promise rejection';" +
    "  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: reason }));" +
    "});" +
    "</script>" +
    "<script>" +
    pdfBundle +
    "</script>" +
    "<script>" +
    "(function() {" +
    "  var workerCode = " +
    workerBundleJson +
    ";" +
    "  globalThis.pdfjsWorker = { WorkerMessageHandler: globalThis.WorkerMessageHandler };" +
    "  try { globalThis.Worker = undefined; } catch (_ignored) {}" +
    "  var url = " +
    uriJson +
    ";" +
    "  var pdfBase64 = " +
    pdfBase64Json +
    ";" +
    "  var pageNum = " +
    String(pageNumber) +
    ";" +
    "  var httpHeaders = " +
    headersJson +
    ";" +
    "  var dpr = window.devicePixelRatio || 1;" +
    "  var errorEl = document.getElementById('error');" +
    "  function showError(message) {" +
    "    errorEl.style.display = 'block';" +
    "    errorEl.textContent = message;" +
    "    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: message }));" +
    "  }" +
    "  function decodeBase64(base64) {" +
    "    var binary = atob(base64);" +
    "    var bytes = new Uint8Array(binary.length);" +
    "    for (var index = 0; index < binary.length; index += 1) {" +
    "      bytes[index] = binary.charCodeAt(index);" +
    "    }" +
    "    return bytes;" +
    "  }" +
    "  try {" +
    "    eval(workerCode);" +
    "    globalThis.pdfjsWorker = { WorkerMessageHandler: globalThis.WorkerMessageHandler };" +
    "    if (!globalThis.pdfjsLib || typeof globalThis.pdfjsLib.getDocument !== 'function') {" +
    "      showError('pdfjs bundle did not initialize correctly');" +
    "      return;" +
    "    }" +
    "    var documentSource = pdfBase64" +
    "      ? { data: decodeBase64(pdfBase64) }" +
    "      : { url: url, httpHeaders: httpHeaders, withCredentials: false, rangeChunkSize: 524288 };" +
    "    globalThis.pdfjsLib.getDocument(documentSource).promise.then(function(pdf) {" +
    "      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'totalPages', totalPages: pdf.numPages }));" +
    "      return pdf.getPage(pageNum);" +
    "    }).then(function(page) {" +
    "      var availWidth = window.innerWidth;" +
    "      var availHeight = window.innerHeight;" +
    "      var baseViewport = page.getViewport({ scale: 1 });" +
    "      var scale = Math.min(availWidth / baseViewport.width, availHeight / baseViewport.height);" +
    "      var viewport = page.getViewport({ scale: scale });" +
    "      var canvas = document.getElementById('pdf-canvas');" +
    "      var ctx = canvas.getContext('2d');" +
    "      canvas.width = Math.max(1, Math.floor(viewport.width * dpr));" +
    "      canvas.height = Math.max(1, Math.floor(viewport.height * dpr));" +
    "      canvas.style.width = viewport.width + 'px';" +
    "      canvas.style.height = viewport.height + 'px';" +
    "      ctx.scale(dpr, dpr);" +
    "      return page.render({ canvasContext: ctx, viewport: viewport }).promise;" +
    "    }).catch(function(err) {" +
    "      showError(String(err));" +
    "    });" +
    "  } catch (err) {" +
    "    showError(String(err));" +
    "  }" +
    "})();" +
    "</script>" +
    "</body></html>"
  )
}

export function PDFWebPage({
  uri,
  pageNumber,
  headers,
  pdfBase64,
  style,
  onTotalPages,
  onError,
}: PDFWebPageProps) {
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data)
        if (msg.type === "totalPages") {
          onTotalPages?.(msg.totalPages)
        } else if (msg.type === "error") {
          onError?.(msg.message)
        }
      } catch {}
    },
    [onError, onTotalPages],
  )

  const html = buildPageHtml(uri, pageNumber, headers, pdfBase64)

  return (
    <WebView
      source={{ html, baseUrl: "https://localhost/" }}
      style={[styles.webview, style]}
      onMessage={handleMessage}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      mixedContentMode="always"
      originWhitelist={["*"]}
      javaScriptEnabled={true}
    />
  )
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: "white",
  },
})
