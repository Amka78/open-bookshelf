export class ExpoGoOcrUnavailableError extends Error {
  constructor() {
    super("Cover OCR is not available in Expo Go.")
    this.name = "ExpoGoOcrUnavailableError"
  }
}
