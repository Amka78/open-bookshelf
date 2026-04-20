import { Platform } from "react-native"

export async function prepareOcrImage(imageUrl: string) {
  if (Platform.OS === "web") {
    const { prepareOcrImage: prepareOcrImageWeb } = await import("./prepareOcrImage.web")
    return prepareOcrImageWeb(imageUrl)
  }

  const { prepareOcrImage: prepareOcrImageNative } = await import("./prepareOcrImage.native")
  return prepareOcrImageNative(imageUrl)
}
