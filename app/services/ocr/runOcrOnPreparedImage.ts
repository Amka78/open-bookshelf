import { Platform } from "react-native"

export async function runOcrOnPreparedImage(source: string, languages: string[]) {
  if (Platform.OS === "web") {
    const { runOcrOnPreparedImage: runOcrOnPreparedImageWeb } = await import(
      "./runOcrOnPreparedImage.web"
    )
    return runOcrOnPreparedImageWeb(source, languages)
  }

  const { runOcrOnPreparedImage: runOcrOnPreparedImageNative } = await import(
    "./runOcrOnPreparedImage.native"
  )
  return runOcrOnPreparedImageNative(source, languages)
}
