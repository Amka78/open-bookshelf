/**
 * Mock data generators for BookViewer stories per format.
 *
 * Simulates the conversion API response — each format gets its own set of
 * mock page data (SVG data URLs for image-based formats, HTML strings for
 * text-based formats) so the story can verify BookViewer renders correctly
 * for every supported extension.
 */

// ============================================================
// Format classification
// ============================================================

export const IMAGE_BASED_FORMATS = ["EPUB", "CBZ", "CBR", "CB7", "CBC", "PDF"] as const
export const HTML_VIEWER_FORMATS = ["AZW3", "KF8"] as const
export const TEXT_FORMATS = ["MOBI", "FB2", "RTF", "DOCX", "TXT", "HTML", "HTMLZ"] as const
export const ALL_FORMATS = [
  ...IMAGE_BASED_FORMATS,
  ...HTML_VIEWER_FORMATS,
  ...TEXT_FORMATS,
] as const

export type Format = (typeof ALL_FORMATS)[number]

/** Human-readable labels for format selection UI */
export const FORMAT_LABELS: Record<Format, string> = {
  EPUB: "EPUB (images)",
  CBZ: "CBZ (Comic ZIP)",
  CBR: "CBR (Comic RAR)",
  CB7: "CB7 (Comic 7z)",
  CBC: "CBC (Comic folder)",
  PDF: "PDF",
  AZW3: "AZW3 (HTML viewer)",
  KF8: "KF8 (HTML viewer)",
  MOBI: "MOBI (text → HTML)",
  FB2: "FB2 (FictionBook)",
  RTF: "RTF (Rich Text)",
  DOCX: "DOCX (Word)",
  TXT: "TXT (Plain text)",
  HTML: "HTML",
  HTMLZ: "HTMLZ (zipped HTML)",
}

// ============================================================
// Mock SVGs for image-based format pages
// ============================================================

/**
 * Generate an SVG data URL that looks like a book page.
 * Each page shows its number so the play function can verify page turns.
 */
export function createMockImagePage(pageIndex: number, totalPages: number) {
  // Cycle through a few background colors so adjacent pages are distinguishable
  const colors = ["#f5f0e8", "#e8f0f5", "#f0f5e8", "#f5e8f0", "#f0e8f5"]
  const bgColor = colors[pageIndex % colors.length]
  const textColor = "#333333"

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1100' viewBox='0 0 800 1100'>
    <rect width='100%' height='100%' fill='${bgColor}'/>
    <rect x='20' y='20' width='760' height='1060' fill='none' stroke='${textColor}' stroke-width='1' opacity='0.2'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='48' fill='${textColor}'>
      Page ${pageIndex + 1}
    </text>
    <text x='50%' y='95%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='${textColor}' opacity='0.5'>
      ${pageIndex + 1} / ${totalPages}
    </text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Generate an array of mock SVG image pages.
 */
export function createMockImagePages(pageCount: number): string[] {
  return Array.from({ length: pageCount }, (_, i) => createMockImagePage(i, pageCount))
}

// ============================================================
// Mock HTML pages for text-based formats
// ============================================================

function makeParagraphs(count: number): string {
  return Array.from(
    { length: count },
    (_, i) =>
      `<p style="margin-bottom:1.2em;font-size:16px;line-height:1.6;color:#111318;">
         Chapter ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
         Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
         Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
         nisi ut aliquip ex ea commodo consequat.
       </p>`,
  ).join("\n")
}

/**
 * Generate mock HTML page content for text-based formats.
 * Each page gets a unique title so the play function can verify page turns.
 */
export function createMockHtmlPage(pageIndex: number, totalPages: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin: 2em; font-family: Georgia, serif; }
  </style>
</head>
<body>
  <h2>Page ${pageIndex + 1} of ${totalPages}</h2>
  ${makeParagraphs(Math.max(2, 6 - pageIndex))}
</body>
</html>`
}

/**
 * Generate an array of mock HTML page contents.
 */
export function createMockHtmlPages(pageCount: number): string[] {
  return Array.from({ length: pageCount }, (_, i) => createMockHtmlPage(i, pageCount))
}

// ============================================================
// Format → page data dispatch
// ============================================================

export type PageDataResult =
  | { type: "image"; uris: string[] }
  | { type: "html"; contents: string[] }

/**
 * Return mock page data appropriate for the given format.
 *
 * Image-based formats (EPUB, CBZ, CBR, CB7, CBC, PDF) return SVG data URLs.
 * HTML-viewer formats (AZW3, KF8) and text formats (MOBI, FB2, …) return
 * inline HTML strings rendered via TextBookSpine's sourceHtml prop.
 */
export function createFormatPageData(format: string, pageCount = 6): PageDataResult {
  const normalizedFormat = format.toUpperCase()

  if ((IMAGE_BASED_FORMATS as readonly string[]).includes(normalizedFormat)) {
    return { type: "image", uris: createMockImagePages(pageCount) }
  }

  // All text/HTML-based formats
  return { type: "html", contents: createMockHtmlPages(pageCount) }
}

/**
 * Return the performanceMode that BookViewer should use for a given format.
 */
export function resolvePerformanceMode(format: string): BookViewerPerformanceMode {
  const normalizedFormat = format.toUpperCase()
  if (normalizedFormat === "PDF") return "web-pdf"
  return "default"
}

type BookViewerPerformanceMode = "default" | "android-pdf" | "web-pdf" | "pdf-single-page"

/**
 * Whether this format would use TextBookViewer (HTML spine rendering) in the real app.
 */
export function usesTextViewer(format: string): boolean {
  const normalizedFormat = format.toUpperCase()
  return (
    (HTML_VIEWER_FORMATS as readonly string[]).includes(normalizedFormat) ||
    (TEXT_FORMATS as readonly string[]).includes(normalizedFormat)
  )
}

/**
 * Human-readable description of the format's rendering pipeline.
 */
export function formatDescription(format: string): string {
  const normalizedFormat = format.toUpperCase()
  if (usesTextViewer(normalizedFormat)) {
    return "Calibre converts to XHTML spine → BookViewer renders via BookHtmlPage (or TextBookViewer)"
  }
  if (normalizedFormat === "PDF") {
    return "Calibre returns a single PDF file → BookViewer with pdf-single-page mode"
  }
  return "Calibre pre-renders to JPEG images → BookViewer displays via BookPage"
}
