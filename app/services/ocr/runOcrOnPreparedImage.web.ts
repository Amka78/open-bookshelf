import { createWorker } from "tesseract.js"
import type { RawOcrResult } from "./ocr.types"

const DEFAULT_LANGUAGES = ["eng"]

export async function runOcrOnPreparedImage(
  source: string,
  languages: string[],
): Promise<RawOcrResult> {
  const worker = await createWorker(languages.length > 0 ? languages : DEFAULT_LANGUAGES)

  try {
    const result = await worker.recognize(source)
    const lines = (result.data.blocks ?? []).flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.map((line) => ({
          text: line.text,
          confidence: line.confidence,
        })),
      ),
    )

    return {
      text: result.data.text,
      lines,
    }
  } finally {
    await worker.terminate()
  }
}
