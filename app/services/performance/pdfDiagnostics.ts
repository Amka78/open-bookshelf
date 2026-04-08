/**
 * PDF パフォーマンス診断ツール
 * ブラウザコンソールで使用可能な診断機能を提供
 */

export interface PDFMetrics {
  pageNumber: number
  renderStartTime: number
  layoutCompleteTime?: number
  totalRenderTime?: number
  pageType: "singlePage" | "leftPage" | "rightPage"
  width: number
  height?: number
}

export interface PDFDiagnostics {
  isEnabled: boolean
  metrics: PDFMetrics[]
  pageTransitions: Array<{ from: number; to: number; timestamp: number; duration: number }>
  startMonitoring: () => void
  stopMonitoring: () => void
  logMetric: (metric: PDFMetrics) => void
  logPageTransition: (from: number, to: number) => void
  printSummary: () => void
  clearMetrics: () => void
}

declare global {
  interface Window {
    __pdfDiagnostics?: PDFDiagnostics
  }
}

let lastMetricKey = ""
let lastMetricTimestamp = 0

const diagnostics: PDFDiagnostics = {
  isEnabled: true,
  metrics: [],
  pageTransitions: [],

  startMonitoring() {
    this.isEnabled = true
    console.log("[PDF-Diagnostics] Monitoring started")
  },

  stopMonitoring() {
    this.isEnabled = false
    console.log("[PDF-Diagnostics] Monitoring stopped")
  },

  logMetric(metric: PDFMetrics) {
    if (!this.isEnabled) return

    const metricKey = `${metric.pageNumber}:${metric.pageType}:${Math.round(metric.width)}`
    const now = performance.now()
    if (metricKey === lastMetricKey && now - lastMetricTimestamp < 120) {
      return
    }
    lastMetricKey = metricKey
    lastMetricTimestamp = now

    this.metrics.push(metric)
    const layoutTime = metric.layoutCompleteTime
      ? (metric.layoutCompleteTime - metric.renderStartTime).toFixed(2)
      : "pending"

    console.log(
      `[PDF-Metric] Page ${metric.pageNumber} (${metric.pageType}): ` +
        `${layoutTime}ms | ${metric.width}x${metric.height ?? "?"}px`,
    )
  },

  logPageTransition(from: number, to: number) {
    if (!this.isEnabled) return

    performance.now()
    const direction = to > from ? "→" : "←"
    console.log(`[PDF-Transition] Page ${from} ${direction} ${to}`)
  },

  printSummary() {
    if (!this.metrics.length) {
      console.log("[PDF-Diagnostics] No metrics recorded")
      return
    }

    console.group("[PDF-Diagnostics Summary]")

    // ページレンダリング統計
    const renderTimes = this.metrics
      .filter((m) => m.totalRenderTime !== undefined)
      .map((m) => m.totalRenderTime as number)

    if (renderTimes.length > 0) {
      const avg = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
      const max = Math.max(...renderTimes)
      const min = Math.min(...renderTimes)

      console.log(
        `Render Times: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`,
      )
    }

    // ページサイズ の確認
    const uniqueSizes = new Map<string, number>()
    this.metrics.forEach((m) => {
      const key = `${m.width}x${m.height ?? "?"}`
      uniqueSizes.set(key, (uniqueSizes.get(key) ?? 0) + 1)
    })

    console.log("Page Dimensions:", Object.fromEntries(uniqueSizes))

    // ページ遷移情報
    if (this.pageTransitions.length > 0) {
      const avgTransitionTime =
        this.pageTransitions.reduce((sum, t) => sum + t.duration, 0) / this.pageTransitions.length
      console.log(
        `Page Transitions: count=${this.pageTransitions.length}, ` +
          `avgTime=${avgTransitionTime.toFixed(2)}ms`,
      )
    }

    console.groupEnd()
  },

  clearMetrics() {
    this.metrics = []
    this.pageTransitions = []
    console.log("[PDF-Diagnostics] Metrics cleared")
  },
}

// グローバルに露出（ブラウザコンソール用）
if (typeof window !== "undefined") {
  window.__pdfDiagnostics = diagnostics
}

export default diagnostics
