import { Platform } from "react-native"

/**
 * Reads a file (File object or URI string) and returns a base64 data URL.
 * Web uses FileReader, native uses expo-file-system.
 */
export async function fileToDataUrl(file: File | string): Promise<string> {
  if (typeof file !== "string") {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  if (Platform.OS === "web") {
    const response = await fetch(file)
    const blob = await response.blob()
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  // Native: use expo-file-system to read URI as base64
  const { readAsStringAsync } = await import("expo-file-system")
  const base64 = await readAsStringAsync(file, { encoding: "base64" })
  const ext = file.split(".").pop()?.toLowerCase() ?? ""
  const mimeMap: Record<string, string> = {
    epub: "application/epub+zip",
    pdf: "application/pdf",
    mobi: "application/x-mobipocket-ebook",
    azw3: "application/x-mobi8-ebook",
    azw: "application/x-mobipocket-ebook",
    cbz: "application/x-cbz",
    cbr: "application/x-cbr",
    txt: "text/plain",
    rtf: "application/rtf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fb2: "application/x-fictionbook+xml",
    lit: "application/x-ms-reader",
    lrf: "application/x-sony-bbeb",
    djvu: "image/vnd.djvu",
  }
  const mime = mimeMap[ext] ?? "application/octet-stream"
  return `data:${mime};base64,${base64}`
}
