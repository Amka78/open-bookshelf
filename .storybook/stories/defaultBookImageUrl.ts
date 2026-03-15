import { Image } from "react-native"

const defaultBookImageSource = require("../../assets/images/sample-image-1.png")

function resolveStorybookAssetUri(source: unknown) {
  if (typeof Image.resolveAssetSource === "function") {
    const resolvedSource = Image.resolveAssetSource(source)
    if (resolvedSource?.uri) {
      return resolvedSource.uri
    }
  }

  if (typeof source === "string") {
    return source
  }

  if (source && typeof source === "object") {
    if ("default" in source && typeof source.default === "string") {
      return source.default
    }

    if ("uri" in source && typeof source.uri === "string") {
      return source.uri
    }
  }

  return ""
}

export const defaultBookImageUrl = resolveStorybookAssetUri(defaultBookImageSource)
