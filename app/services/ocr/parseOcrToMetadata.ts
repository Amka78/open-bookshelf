import type { OcrFieldEntry, OcrMappedMetadata, OcrResult, RawOcrLine, RawOcrResult } from "./ocr.types"

const PUBLISHER_PATTERN = /\b(press|publishing|publisher|books|editions?|media|house)\b/i
const SERIES_PATTERN =
  /^(.*?)(?:\s*[:\-]\s*)?(?:book|volume|vol\.?)\s+(\d+)\b|^(.*?)\s+#\s?(\d+)\b/i
const NON_LATIN_LANGUAGE_PATTERNS: Array<{ code: "ar" | "ja" | "ko"; pattern: RegExp }> = [
  { code: "ja", pattern: /[\u3040-\u30ff]/u },
  { code: "ko", pattern: /[\uac00-\ud7af]/u },
  { code: "ar", pattern: /[\u0600-\u06ff]/u },
]

function normalizeLine(text: string) {
  return text.replace(/\s+/gu, " ").trim()
}

function dedupeLines(lines: RawOcrLine[]) {
  const seen = new Set<string>()
  return lines
    .map((line) => ({
      text: normalizeLine(line.text),
      confidence: line.confidence,
    }))
    .filter((line) => {
      if (!line.text || seen.has(line.text)) {
        return false
      }
      seen.add(line.text)
      return true
    })
}

function splitPeople(text: string) {
  return text
    .split(/\s*(?:,|&|\band\b)\s*/iu)
    .map((entry) => normalizeLine(entry))
    .filter(Boolean)
}

function extractIsbn(text: string) {
  const matches = Array.from(
    text.matchAll(/(?:ISBN(?:-1[03])?:?\s*)?((?:97[89][\s-]?)?(?:[\dXx][\s-]?){9,16})/gu),
  )

  for (const match of matches) {
    const normalized = match[1].replace(/[^\dXx]/gu, "").toUpperCase()
    if (normalized.length === 10 || normalized.length === 13) {
      return normalized
    }
  }

  return undefined
}

function pickPublisher(lines: RawOcrLine[]) {
  return lines.find((line) => PUBLISHER_PATTERN.test(line.text) && line.text.length <= 60)
}

function pickSeries(lines: RawOcrLine[]) {
  for (const line of lines) {
    const match = line.text.match(SERIES_PATTERN)
    if (!match) continue

    const seriesName = normalizeLine(match[1] || match[3] || "")
    const seriesIndex = Number(match[2] || match[4])
    if (!seriesName || Number.isNaN(seriesIndex)) continue

    return {
      line,
      seriesName,
      seriesIndex,
    }
  }

  return undefined
}

function pickAuthor(lines: RawOcrLine[]) {
  const byLine = lines.find((line) => /^by\s+/iu.test(line.text))
  if (byLine) {
    const authors = splitPeople(byLine.text.replace(/^by\s+/iu, ""))
    if (authors.length > 0) {
      return { authors, line: byLine }
    }
  }

  return undefined
}

function pickTitle(lines: RawOcrLine[]) {
  const ignoredPatterns = [/^isbn/iu, /^by\s+/iu, PUBLISHER_PATTERN, SERIES_PATTERN]
  return lines.find((line) => {
    if (line.text.length > 80) return false
    return ignoredPatterns.every((pattern) => !pattern.test(line.text))
  })
}

function detectNonLatinLanguages(text: string) {
  return NON_LATIN_LANGUAGE_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(
    ({ code }) => code,
  )
}

function pushFieldEntry(
  entries: OcrFieldEntry[],
  field: OcrFieldEntry["field"],
  value: OcrFieldEntry["value"],
  sourceText?: string,
  confidence?: number,
) {
  entries.push({
    field,
    value,
    sourceText,
    confidence,
  })
}

export function parseOcrToMetadata(rawResult: RawOcrResult): OcrResult {
  const lines = dedupeLines(rawResult.lines)
  const fullText = rawResult.text.trim() || lines.map((line) => line.text).join("\n")
  const fieldEntries: OcrFieldEntry[] = []
  const mappedMetadata: OcrMappedMetadata = {}

  const titleLine = pickTitle(lines)
  if (titleLine) {
    mappedMetadata.title = titleLine.text
    pushFieldEntry(fieldEntries, "title", titleLine.text, titleLine.text, titleLine.confidence)
  }

  const authorCandidate = pickAuthor(lines)
  if (authorCandidate) {
    mappedMetadata.authors = authorCandidate.authors
    pushFieldEntry(
      fieldEntries,
      "authors",
      authorCandidate.authors,
      authorCandidate.line.text,
      authorCandidate.line.confidence,
    )
  }

  const seriesCandidate = pickSeries(lines)
  if (seriesCandidate) {
    mappedMetadata.series = seriesCandidate.seriesName
    mappedMetadata.seriesIndex = seriesCandidate.seriesIndex
    pushFieldEntry(
      fieldEntries,
      "series",
      seriesCandidate.seriesName,
      seriesCandidate.line.text,
      seriesCandidate.line.confidence,
    )
    pushFieldEntry(
      fieldEntries,
      "seriesIndex",
      seriesCandidate.seriesIndex,
      seriesCandidate.line.text,
      seriesCandidate.line.confidence,
    )
  }

  const publisherLine = pickPublisher(lines)
  if (publisherLine) {
    mappedMetadata.publisher = publisherLine.text
    pushFieldEntry(
      fieldEntries,
      "publisher",
      publisherLine.text,
      publisherLine.text,
      publisherLine.confidence,
    )
  }

  const isbn = extractIsbn([fullText, ...lines.map((line) => line.text)].join("\n"))
  if (isbn) {
    mappedMetadata.identifiers = { isbn }
    pushFieldEntry(fieldEntries, "identifiers", { isbn }, isbn)
  }

  const languages = detectNonLatinLanguages([fullText, ...lines.map((line) => line.text)].join("\n"))
  if (languages.length > 0) {
    mappedMetadata.languages = languages
    pushFieldEntry(fieldEntries, "languages", languages, languages.join(", "))
  }

  return {
    text: rawResult.text,
    lines: lines.map((line) => line.text),
    mappedMetadata,
    fieldEntries,
  }
}
