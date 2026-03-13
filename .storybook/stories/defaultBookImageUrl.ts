import { Image } from "react-native"

export const defaultBookImageUrl = Image.resolveAssetSource(
  require("../../assets/images/sample-image-1.png"),
).uri
