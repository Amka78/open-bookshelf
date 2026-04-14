import type { HtmlFileType, ImageFileType } from "@/services/api/api.types"

/**
 * Build an ordered list of image file paths from CBZ file metadata.
 * 
 * This is more efficient than parsing XHTML DOM because:
 * 1. Uses pre-computed files metadata (no DOM parsing)
 * 2. Applies natural filename sorting for proper page order
 * 3. Can prioritize raster_cover_name if available
 * 
 * @param files - File metadata map from Calibre manifest
 * @param rasterCoverName - Optional cover image filename from manifest
 * @returns Ordered array of image file paths
 */
export function buildComicImageList(
  files: Record<string, ImageFileType | HtmlFileType>,
  rasterCoverName?: string | null,
): string[] {
  // Extract only image files (not HTML/XHTML wrappers)
  const imagePaths = Object.entries(files)
    .filter(([_, metadata]) => !metadata.is_html && metadata.mimetype?.startsWith("image/"))
    .map(([path]) => path)

  // Sort using natural filename ordering
  imagePaths.sort(naturalCompare)

  // If we have a raster cover name and it's not already first, move it to front
  if (rasterCoverName && imagePaths.includes(rasterCoverName)) {
    const coverIndex = imagePaths.indexOf(rasterCoverName)
    if (coverIndex > 0) {
      imagePaths.splice(coverIndex, 1)
      imagePaths.unshift(rasterCoverName)
    }
  }

  return imagePaths
}

/**
 * Natural string comparison for sorting filenames.
 * Handles numeric sequences properly (e.g., "page2" < "page10")
 */
function naturalCompare(a: string, b: string): number {
  const aParts = splitNumeric(a)
  const bParts = splitNumeric(b)
  const len = Math.min(aParts.length, bParts.length)

  for (let i = 0; i < len; i++) {
    const aPart = aParts[i]
    const bPart = bParts[i]

    // If both parts are numeric, compare as numbers
    const aIsNum = /^\d+$/.test(aPart)
    const bIsNum = /^\d+$/.test(bPart)

    if (aIsNum && bIsNum) {
      const aNum = parseInt(aPart, 10)
      const bNum = parseInt(bPart, 10)
      if (aNum !== bNum) return aNum - bNum
    } else {
      // Otherwise compare as strings
      if (aPart !== bPart) return aPart < bPart ? -1 : 1
    }
  }

  // If all compared parts are equal, shorter string comes first
  return a.length - b.length
}

/**
 * Split a string into alternating text and numeric segments.
 * e.g., "page001.jpg" -> ["page", "001", ".jpg"]
 */
function splitNumeric(str: string): string[] {
  const parts: string[] = []
  let current = ""
  let isNumeric: boolean | null = null

  for (const char of str) {
    const charIsNum = /\d/.test(char)

    if (isNumeric === null) {
      isNumeric = charIsNum
    }

    if (charIsNum === isNumeric) {
      current += char
    } else {
      if (current) parts.push(current)
      current = char
      isNumeric = charIsNum
    }
  }

  if (current) parts.push(current)
  return parts
}
