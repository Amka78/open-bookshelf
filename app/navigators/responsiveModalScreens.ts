import type { ModalStackParams } from "@/components/Modals/Types"
import type { AppStackParamList } from "./types"

export type ModalScreenTarget =
  | { name: "Connect"; params?: undefined }
  | { name: "CalibreRoot"; params?: undefined }
  | { name: "About"; params?: undefined }
  | { name: "BulkEdit"; params: AppStackParamList["BulkEdit"] }
  | { name: "BookDetail"; params: AppStackParamList["BookDetail"] }
  | { name: "BookEdit"; params: AppStackParamList["BookEdit"] }
  | { name: "BookConvert"; params: AppStackParamList["BookConvert"] }
  | { name: "BookOcrReview"; params: AppStackParamList["BookOcrReview"] }

type ModalScreenMapping = (params: unknown) => ModalScreenTarget

export const RESPONSIVE_MODAL_SCREENS: Partial<Record<keyof ModalStackParams, ModalScreenMapping>> =
  {
    ConnectModal: () => ({ name: "Connect" }),
    CalibreRootModal: () => ({ name: "CalibreRoot" }),
    AboutModal: () => ({ name: "About" }),
    BulkEditModal: (params) => {
      const p = params as ModalStackParams["BulkEditModal"]
      return {
        name: "BulkEdit",
        params: {
          bookIds: p.books.map((book) => book.id),
          libraryId: p.libraryId,
          onComplete: p.onComplete,
        },
      }
    },
    BookDetailModal: (params) => {
      const p = params as ModalStackParams["BookDetailModal"]
      return {
        name: "BookDetail",
        params: {
          imageUrl: p.imageUrl,
          onLinkPress: p.onLinkPress ?? (() => {}),
        },
      }
    },
    BookEditModal: (params) => {
      const p = params as ModalStackParams["BookEditModal"]
      return { name: "BookEdit", params: { imageUrl: p.imageUrl } }
    },
    BookConvertModal: (params) => {
      const p = params as ModalStackParams["BookConvertModal"]
      return { name: "BookConvert", params: { imageUrl: p.imageUrl } }
    },
    BookOcrReviewModal: (params) => {
      const p = params as ModalStackParams["BookOcrReviewModal"]
      return { name: "BookOcrReview", params: { imageUrl: p.imageUrl } }
    },
  }

export type OpenedModalItem = {
  name: string
  params?: unknown
}

/**
 * 開いているモーダルを下から順に対応する画面へ変換する。
 * 対応する画面を持たないモーダルが1つでも混ざっている場合は null。
 */
export function buildModalScreenTargets(items: OpenedModalItem[]): ModalScreenTarget[] | null {
  if (items.length === 0) return null

  const targets: ModalScreenTarget[] = []
  for (const item of items) {
    const mapping = RESPONSIVE_MODAL_SCREENS[item.name as keyof ModalStackParams]
    if (!mapping) return null
    targets.push(mapping(item.params))
  }

  return targets
}
