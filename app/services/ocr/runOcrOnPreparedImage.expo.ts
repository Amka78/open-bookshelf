import { ExpoGoOcrUnavailableError } from "./errors"
import type { RawOcrResult } from "./ocr.types"

export async function runOcrOnPreparedImage(
  _source: string,
  _languages: string[],
): Promise<RawOcrResult> {
  throw new ExpoGoOcrUnavailableError()
}
