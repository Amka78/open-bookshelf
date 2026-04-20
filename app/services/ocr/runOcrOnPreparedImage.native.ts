import TextRecognition, { TextRecognitionScript } from "@react-native-ml-kit/text-recognition"
import type { RawOcrResult } from "./ocr.types"

function resolveNativeScript(languages: string[]) {
  if (languages.includes("jpn")) {
    return TextRecognitionScript.JAPANESE
  }

  if (languages.includes("kor")) {
    return TextRecognitionScript.KOREAN
  }

  if (languages.includes("chi")) {
    return TextRecognitionScript.CHINESE
  }

  if (languages.includes("hin")) {
    return TextRecognitionScript.DEVANAGARI
  }

  return TextRecognitionScript.LATIN
}

export async function runOcrOnPreparedImage(
  source: string,
  languages: string[],
): Promise<RawOcrResult> {
  const result = await TextRecognition.recognize(source, resolveNativeScript(languages))

  return {
    text: result.text,
    lines: result.blocks.flatMap((block) => block.lines.map((line) => ({ text: line.text }))),
  }
}
