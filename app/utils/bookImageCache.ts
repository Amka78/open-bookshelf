import * as FileSystem from "expo-file-system"
import { api } from "@/services/api"

type CacheBookImagesInput = {
  bookId: number
  format: string
  libraryId: string
  baseUrl: string
  size: number
  hash: number
  pathList: string[]
  headers?: Record<string, string>
}

const CACHE_ROOT = FileSystem.cacheDirectory ?? FileSystem.documentDirectory

const normalizePath = (path: string) => {
  if (!path) return ""
  return path.startsWith("/") ? path.slice(1) : path
}

const getBookImageCacheDir = (bookId: number, format: string) => {
  if (!CACHE_ROOT) return null
  return `${CACHE_ROOT}book-images/${bookId}/${format}/`
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

export const isRemoteBookImagePath = (path?: string) => {
  return Boolean(path && (path.startsWith("http://") || path.startsWith("https://")))
}

export async function cacheBookImages(input: CacheBookImagesInput): Promise<string[]> {
  const cacheDir = getBookImageCacheDir(input.bookId, input.format)
  if (!cacheDir) {
    return input.pathList.map((value) =>
      buildBookImageUrl(
        input.baseUrl,
        input.bookId,
        input.format,
        input.size,
        input.hash,
        value,
        input.libraryId,
      ),
    )
  }

  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true })

  const cachedList = await Promise.all(
    input.pathList.map(async (value) => {
      const normalizedPath = normalizePath(value)
      const targetPath = `${cacheDir}${normalizedPath}`
      const targetDir = targetPath.slice(0, targetPath.lastIndexOf("/") + 1)

      if (targetDir) {
        await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true })
      }

      const info = await FileSystem.getInfoAsync(targetPath)
      if (!info.exists) {
        const url = buildBookImageUrl(
          input.baseUrl,
          input.bookId,
          input.format,
          input.size,
          input.hash,
          value,
          input.libraryId,
        )
        await FileSystem.downloadAsync(url, targetPath, {
          headers: input.headers,
        })
      }

      return targetPath
    }),
  )

  return cachedList
}

export async function deleteCachedBookImages(pathList: string[]): Promise<void> {
  const localPathList = Array.from(
    new Set(pathList.filter((path) => path && !isRemoteBookImagePath(path))),
  )

  await Promise.all(
    localPathList.map(async (path) => {
      await FileSystem.deleteAsync(path, { idempotent: true })
    }),
  )
}
