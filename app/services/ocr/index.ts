import { parseOcrToMetadata } from "./parseOcrToMetadata"
import { prepareOcrImage } from "./prepareOcrImage"
import { runOcrOnPreparedImage } from "./runOcrOnPreparedImage"
import { inferOcrLanguages } from "./inferOcrLanguages"

export type { OcrFieldEntry, OcrMappedField, OcrMappedMetadata, OcrResult } from "./ocr.types"

export async function recognizeCover(params: { imageUrl: string; languages: string[] }) {
  const preparedImage = await prepareOcrImage(params.imageUrl)

  try {
    const rawResult = await runOcrOnPreparedImage(
      preparedImage.source,
      inferOcrLanguages(params.languages),
    )
    return parseOcrToMetadata(rawResult)
  } finally {
    preparedImage.cleanup()
  }
}
