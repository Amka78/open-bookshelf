const HTML_VIEWER_FORMATS = new Set(["AZW3", "KF8"])

const SERIALIZED_HTML_PATH_PATTERN = /\.(xhtml?|shtml?|html?)$/i

const stripQueryAndHash = (value: string) => {
  return value.split(/[?#]/, 1)[0] ?? value
}

export const isCalibreHtmlViewerFormat = (format?: string | null) => {
  if (!format) {
    return false
  }

  const normalized = format.toUpperCase()
  // Handle AZW3, KF8, and KF8:joint (joint MOBI/KF8 hybrid files)
  return HTML_VIEWER_FORMATS.has(normalized) || normalized.startsWith("KF8:")
}

export const isCalibreSerializedHtmlPath = (path?: string | null) => {
  if (!path) {
    return false
  }

  return SERIALIZED_HTML_PATH_PATTERN.test(stripQueryAndHash(path))
}
