import type { MessageKey } from "@/i18n"
import { useStores } from "@/models"
import { ReadingHistoryModel } from "@/models/calibre"
import type { ViewerOpenRequest } from "@/navigators/types"
import {
  cacheBookFile,
  cacheBookImages,
  reCacheMissingImages,
  verifyCachedBookImages,
} from "@/utils/bookImageCache"
import { isCalibreHtmlViewerFormat, isCalibreSerializedHtmlPath } from "@/utils/calibreHtmlViewer"
import { isNetworkAvailable } from "@/utils/network"

type Stores = ReturnType<typeof useStores>

export type ViewerPreparationStep =
  | "viewerPreparation.preparing"
  | "viewerPreparation.checkingCache"
  | "viewerPreparation.cachingPdf"
  | "viewerPreparation.converting"
  | "viewerPreparation.cachingImages"
  | "viewerPreparation.verifyingCache"
  | "viewerPreparation.recachingMissingFiles"

export type PrepareViewerSessionParams = {
  request: ViewerOpenRequest
  calibreRootStore: Stores["calibreRootStore"]
  settingStore: Stores["settingStore"]
  onProgress?: (messageTx: ViewerPreparationStep) => void
}

function reportProgress(
  onProgress: PrepareViewerSessionParams["onProgress"],
  messageTx: ViewerPreparationStep,
) {
  onProgress?.(messageTx)
}

function resolveSelectedLibraryAndBook(
  calibreRootStore: Stores["calibreRootStore"],
  request: ViewerOpenRequest,
) {
  if (calibreRootStore.selectedLibrary?.id !== request.libraryId) {
    if (calibreRootStore.libraryMap?.has(request.libraryId)) {
      calibreRootStore.setLibrary(request.libraryId)
    }
  }

  const selectedLibrary = calibreRootStore.selectedLibrary

  if (!selectedLibrary || selectedLibrary.id !== request.libraryId) {
    throw new Error("Selected library could not be prepared for viewing")
  }

  if (selectedLibrary.selectedBook?.id !== request.bookId) {
    selectedLibrary.setBook?.(request.bookId)
  }

  const selectedBook = selectedLibrary.selectedBook

  if (!selectedBook || selectedBook.id !== request.bookId) {
    throw new Error("Book could not be prepared for viewing")
  }

  return { selectedBook, selectedLibrary }
}

export async function prepareViewerSession({
  request,
  calibreRootStore,
  settingStore,
  onProgress,
}: PrepareViewerSessionParams) {
  reportProgress(onProgress, "viewerPreparation.preparing")

  const { selectedBook, selectedLibrary } = resolveSelectedLibraryAndBook(
    calibreRootStore,
    request,
  )
  const { format } = request

  selectedBook.metaData.setProp("selectedFormat", format)

  const history = calibreRootStore.readingHistories.find((value) => {
    return (
      value.libraryId === selectedLibrary.id &&
      value.bookId === selectedBook.id &&
      value.format === format
    )
  })

  if (format === "PDF") {
    reportProgress(onProgress, "viewerPreparation.cachingPdf")

    const cachedPdfPath = await cacheBookFile({
      bookId: selectedBook.id,
      format,
      libraryId: selectedLibrary.id,
      baseUrl: settingStore.api.baseUrl,
    })

    if (history) {
      if (history.cachedPath.length !== 1 || history.cachedPath[0] !== cachedPdfPath) {
        history.setCachePath([cachedPdfPath])
      }
    } else {
      const historyModel = ReadingHistoryModel.create({
        bookId: selectedBook.id,
        currentPage: 0,
        libraryId: selectedLibrary.id,
        cachedPath: [cachedPdfPath],
        format,
      })
      calibreRootStore.addReadingHistory(historyModel)
    }

    return
  }

  const isHtmlViewerFormat = isCalibreHtmlViewerFormat(format)

  if (isHtmlViewerFormat && selectedBook.path.length === 0) {
    reportProgress(onProgress, "viewerPreparation.converting")
    await selectedBook.convert(format, selectedLibrary.id, async () => {})
  }

  if (history) {
    reportProgress(onProgress, "viewerPreparation.checkingCache")

    const cachedPaths: string[] = history.cachedPath?.length ? history.cachedPath.slice() : []
    const hasCachedPaths = cachedPaths.length > 0
    const needsSourcePathResolution = !hasCachedPaths && selectedBook.path.length === 0

    if (needsSourcePathResolution) {
      reportProgress(onProgress, "viewerPreparation.converting")
      await selectedBook.convert(format, selectedLibrary.id, async () => {})
    }

    if (!hasCachedPaths && selectedBook.path.length === 0) {
      throw new Error("Book content could not be prepared for viewing")
    }

    const firstPath = cachedPaths[0] ?? selectedBook.path[0] ?? ""
    const isImageBasedFormat = !isHtmlViewerFormat && !isCalibreSerializedHtmlPath(firstPath)

    if (!hasCachedPaths && isImageBasedFormat) {
      const online = await isNetworkAvailable()

      if (!online) {
        throw new Error(
          "This book is not cached and you are offline. Please connect to the internet to read.",
        )
      }

      reportProgress(onProgress, "viewerPreparation.cachingImages")

      const size = selectedBook.metaData?.formatSizes.get(format) ?? 0
      const hash = selectedBook.hash ?? history.bookHash ?? 0
      const updatedPaths = await cacheBookImages({
        bookId: selectedBook.id,
        format,
        libraryId: selectedLibrary.id,
        baseUrl: settingStore.api.baseUrl,
        size,
        hash,
        pathList: selectedBook.path.slice(),
      })

      history.setCachePath(updatedPaths)
      history.setCacheVerified(true)
    } else if (hasCachedPaths && isImageBasedFormat) {
      reportProgress(onProgress, "viewerPreparation.verifyingCache")

      const { allExist, missingIndices } = await verifyCachedBookImages(cachedPaths)

      if (!allExist) {
        const online = await isNetworkAvailable()

        if (!online) {
          throw new Error(
            "This book is not fully cached and you are offline. Please connect to the internet to read.",
          )
        }

        reportProgress(onProgress, "viewerPreparation.recachingMissingFiles")

        const hash = selectedBook.hash ?? history.bookHash ?? 0
        const size = selectedBook.metaData?.formatSizes.get(format) ?? 0
        const updatedPaths = await reCacheMissingImages({
          bookId: selectedBook.id,
          format,
          libraryId: selectedLibrary.id,
          baseUrl: settingStore.api.baseUrl,
          size,
          hash,
          cachedPaths: history.cachedPath.slice(),
          missingIndices,
        })

        history.setCachePath(updatedPaths)
        history.setCacheVerified(true)
      } else {
        history.setCacheVerified(true)
      }
    }

    return
  }

  reportProgress(onProgress, "viewerPreparation.converting")

  await selectedBook.convert(format, selectedLibrary.id, async (comicMetadata) => {
    const size = selectedBook.metaData?.formatSizes.get(format) ?? 0
    const hash = selectedBook.hash ?? 0
    const pathsAreHtml =
      selectedBook.path.length > 0 && isCalibreSerializedHtmlPath(selectedBook.path[0])
    const bookImageList =
      isHtmlViewerFormat || pathsAreHtml
        ? selectedBook.path.slice()
        : await (async () => {
            reportProgress(onProgress, "viewerPreparation.cachingImages")

            return cacheBookImages({
              bookId: selectedBook.id,
              format,
              libraryId: selectedLibrary.id,
              baseUrl: settingStore.api.baseUrl,
              size,
              hash,
              pathList: selectedBook.path.slice(),
            })
          })()

    const historyModel = ReadingHistoryModel.create({
      bookId: selectedBook.id,
      currentPage: 0,
      libraryId: selectedLibrary.id,
      cachedPath: bookImageList,
      format,
      serverPosFrac: selectedBook.manifestServerPosFrac ?? null,
      serverEpoch: selectedBook.manifestServerEpoch ?? null,
      isComic: comicMetadata?.isComic ?? null,
      rasterCoverName: comicMetadata?.rasterCoverName ?? null,
      totalLength: comicMetadata?.totalLength ?? null,
      fileMetadataJson: comicMetadata?.fileMetadata ? JSON.stringify(comicMetadata.fileMetadata) : null,
      bookHash: hash,
      cacheVerified: true,
    })
    calibreRootStore.addReadingHistory(historyModel)
  })
}

export function getViewerPreparationLabel(step: ViewerPreparationStep): MessageKey {
  return step
}
