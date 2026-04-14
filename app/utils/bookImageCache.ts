import { api } from "@/services/api"
import { Directory, File, Paths } from "expo-file-system"
import { Platform } from "react-native"
import type { HtmlFileType, ImageFileType } from "@/services/api/api.types"

type CacheBookImagesInput = {
  bookId: number
  format: string
  libraryId: string
  baseUrl: string
  size: number
  hash: number
  pathList: string[]
}

type CacheBookFileInput = {
  bookId: number
  format: string
  libraryId: string
  baseUrl: string
}

type CacheComicImagesInput = {
  bookId: number
  format: string
  libraryId: string
  baseUrl: string
  size: number
  hash: number
  pathList: string[]
  fileMetadata?: Record<string, ImageFileType | HtmlFileType> | null
  maxCacheSize?: number // Maximum total cache size in bytes
}

const getRequiredDirectoryUri = (directory: string | null, label: string) => {
  if (!directory) {
    throw new Error(`${label} is unavailable`)
  }

  return directory.endsWith("/") ? directory : `${directory}/`
}

const getCacheRoot = () => {
  return getRequiredDirectoryUri(Paths.cache?.uri ?? null, "Cache directory")
}

const normalizePath = (path: string) => {
  if (!path) return ""
  return path.startsWith("/") ? path.slice(1) : path
}

const getBookImageCacheDir = (bookId: number, format: string) => {
  return new Directory(getCacheRoot(), "book-images", `${bookId}`, format)
}

const getBookFileCacheDir = (bookId: number, format: string) => {
  return new Directory(getCacheRoot(), "book-files", `${bookId}`, format)
}

export const buildBookImageUrl = (
  baseUrl: string,
  bookId: number,
  format: string,
  size: number,
  hash: number,
  path: string,
  libraryId: string,
) => {
  return api.getBookFileUrl(bookId, format, size, hash, path, libraryId, baseUrl)
}

export const buildBookDownloadUrl = (
  baseUrl: string,
  format: string,
  bookId: number,
  libraryId: string,
) => {
  return `${baseUrl}/get/${encodeURIComponent(format)}/${bookId}/${libraryId}`
}

export const isRemoteBookImagePath = (path?: string) => {
  return Boolean(path && (path.startsWith("http://") || path.startsWith("https://")))
}

/**
 * Detect the cover image path from a CBZ file list.
 * Priority:
 * 1. raster_cover_name from manifest
 * 2. File named "cover" (any extension)
 * 3. First image in the list
 */
export function detectCoverImagePath(
  pathList: string[],
  rasterCoverName?: string | null,
): string | null {
  if (pathList.length === 0) return null

  // Priority 1: Use raster_cover_name from manifest
  if (rasterCoverName && pathList.includes(rasterCoverName)) {
    return rasterCoverName
  }

  // Priority 2: Look for file named "cover" (case-insensitive)
  const coverPath = pathList.find((path) => {
    const filename = path.split("/").pop()?.toLowerCase() || ""
    return filename.startsWith("cover") && /\.(jpe?g|png|gif|webp|bmp)$/i.test(filename)
  })
  if (coverPath) return coverPath

  // Priority 3: Return first image
  return pathList[0] ?? null
}

/**
 * Cache comic images with size-based priority.
 * 
 * For large comics, we prioritize caching:
 * 1. Cover image first (for quick preview)
 * 2. First N images (for immediate reading)
 * 3. Remaining images in background
 * 
 * This improves perceived performance by showing the cover quickly.
 */
export async function cacheComicImages(
  input: CacheComicImagesInput,
): Promise<{ cachedList: string[]; coverPath: string | null }> {
  if (Platform.OS === "web") {
    const coverPath = detectCoverImagePath(input.pathList)
    return {
      cachedList: input.pathList.map((value) =>
        buildBookImageUrl(
          input.baseUrl,
          input.bookId,
          input.format,
          input.size,
          input.hash,
          value,
          input.libraryId,
        ),
      ),
      coverPath,
    }
  }

  const cacheDir = getBookImageCacheDir(input.bookId, input.format)
  cacheDir.create({ idempotent: true, intermediates: true })

  const coverPath = detectCoverImagePath(input.pathList)
  
  // Calculate file sizes for priority ordering if metadata is available
  const pathWithSize = input.pathList.map((path) => ({
    path,
    size: input.fileMetadata?.[path]?.size ?? 0,
  }))

  // Sort by priority: cover first, then by position (for reading order)
  const prioritizedPaths = [...pathWithSize].sort((a, b) => {
    const aIsCover = a.path === coverPath
    const bIsCover = b.path === coverPath
    if (aIsCover && !bIsCover) return -1
    if (!aIsCover && bIsCover) return 1
    return 0
  })

  // Cache all images, but cover is downloaded first
  const cachedMap = new Map<string, string>()

  await Promise.all(
    prioritizedPaths.map(async ({ path }) => {
      const normalizedPath = normalizePath(path)
      const targetFile = new File(cacheDir, normalizedPath)

      targetFile.parentDirectory.create({ idempotent: true, intermediates: true })

      if (!targetFile.exists) {
        const url = buildBookImageUrl(
          input.baseUrl,
          input.bookId,
          input.format,
          input.size,
          input.hash,
          path,
          input.libraryId,
        )
        await api.downloadFileWithAuth(url, targetFile, {
          idempotent: true,
        })
      }

      cachedMap.set(path, targetFile.uri)
    }),
  )

  // Return in original order (not priority order)
  const cachedList = input.pathList.map((path) => cachedMap.get(path)!)

  return { cachedList, coverPath }
}

export async function cacheBookImages(input: CacheBookImagesInput): Promise<string[]> {
  if (Platform.OS === "web") {
    return input.pathList.map((value) => {
      return buildBookImageUrl(
        input.baseUrl,
        input.bookId,
        input.format,
        input.size,
        input.hash,
        value,
        input.libraryId,
      )
    })
  }

  const cacheDir = getBookImageCacheDir(input.bookId, input.format)

  cacheDir.create({ idempotent: true, intermediates: true })

  const cachedList = await Promise.all(
    input.pathList.map(async (value) => {
      const normalizedPath = normalizePath(value)
      const targetFile = new File(cacheDir, normalizedPath)

      targetFile.parentDirectory.create({ idempotent: true, intermediates: true })

      if (!targetFile.exists) {
        const url = buildBookImageUrl(
          input.baseUrl,
          input.bookId,
          input.format,
          input.size,
          input.hash,
          value,
          input.libraryId,
        )
        await api.downloadFileWithAuth(url, targetFile, {
          idempotent: true,
        })
      }

      return targetFile.uri
    }),
  )

  return cachedList
}

export async function cacheBookFile(input: CacheBookFileInput): Promise<string> {
  const downloadUrl = buildBookDownloadUrl(
    input.baseUrl,
    input.format,
    input.bookId,
    input.libraryId,
  )

  if (Platform.OS === "web") {
    return downloadUrl
  }

  const cacheDir = getBookFileCacheDir(input.bookId, input.format)
  cacheDir.create({ idempotent: true, intermediates: true })

  const targetFile = new File(cacheDir, `${input.bookId}.${input.format.toLowerCase()}`)
  if (!targetFile.exists) {
    await api.downloadFileWithAuth(downloadUrl, targetFile, {
      idempotent: true,
    })
  }

  return targetFile.uri
}

export async function deleteCachedBookImages(pathList: string[]): Promise<void> {
  if (Platform.OS === "web") {
    return
  }

  const localPathList = Array.from(
    new Set(pathList.filter((path) => path && !isRemoteBookImagePath(path))),
  )

  await Promise.all(
    localPathList.map(async (path) => {
      const file = new File(path)

      if (file.exists) {
        file.delete()
      }
    }),
  )
}

/**
 * Verify that all cached image files for a book exist on disk.
 * Returns which paths are missing.
 */
export async function verifyCachedBookImages(cachedPaths: string[]): Promise<{
  allExist: boolean
  missingIndices: number[]
}> {
  if (Platform.OS === "web") {
    // Web always uses remote URLs, so we consider them "existing"
    return { allExist: true, missingIndices: [] }
  }

  const missingIndices: number[] = []

  for (let i = 0; i < cachedPaths.length; i++) {
    const path = cachedPaths[i]
    if (isRemoteBookImagePath(path)) continue // Skip remote URLs

    const file = new File(path)
    if (!file.exists) {
      missingIndices.push(i)
    }
  }

  return {
    allExist: missingIndices.length === 0,
    missingIndices,
  }
}

/**
 * Re-download missing image files for a book.
 * Returns the updated list of cached paths (with newly downloaded paths).
 */
export async function reCacheMissingImages(input: {
  bookId: number
  format: string
  libraryId: string
  baseUrl: string
  size: number
  hash: number
  cachedPaths: string[]
  missingIndices: number[]
}): Promise<string[]> {
  if (input.missingIndices.length === 0) {
    return input.cachedPaths
  }

  if (Platform.OS === "web") {
    // Web uses remote URLs, so nothing to re-cache
    return input.cachedPaths
  }

  const cacheDir = getBookImageCacheDir(input.bookId, input.format)
  cacheDir.create({ idempotent: true, intermediates: true })

  const updatedPaths = [...input.cachedPaths]

  await Promise.all(
    input.missingIndices.map(async (index) => {
      const originalPath = updatedPaths[index]
      // Extract the relative path from the cached URI
      // Format: file:///.../book-images/{bookId}/{format}/{relativePath}
      const cacheDirPrefix = `${cacheDir.uri}`
      const relativePath = originalPath.replace(cacheDirPrefix, "")

      const targetFile = new File(cacheDir, relativePath)
      targetFile.parentDirectory.create({ idempotent: true, intermediates: true })

      const url = buildBookImageUrl(
        input.baseUrl,
        input.bookId,
        input.format,
        input.size,
        input.hash,
        relativePath,
        input.libraryId,
      )

      await api.downloadFileWithAuth(url, targetFile, { idempotent: true })
      updatedPaths[index] = targetFile.uri
    }),
  )

  return updatedPaths
}

