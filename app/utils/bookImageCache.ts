import { api } from "@/services/api"
import { Directory, File, Paths } from "expo-file-system"
import { Platform } from "react-native"

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

type CacheBookFileInput = {
  bookId: number
  format: string
  libraryId: string
  baseUrl: string
  headers?: Record<string, string>
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
        await File.downloadFileAsync(url, targetFile, {
          headers: input.headers,
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
    await File.downloadFileAsync(downloadUrl, targetFile, {
      headers: input.headers,
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
