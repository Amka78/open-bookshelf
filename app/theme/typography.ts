// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"

const notoSerifRegular = require("@expo-google-fonts/noto-serif-jp/NotoSerifJP_400Regular.ttf")
const notoSerifBold = require("@expo-google-fonts/noto-serif-jp/NotoSerifJP_700Bold.ttf")
const spaceGroteskRegular = require("@expo-google-fonts/space-grotesk/SpaceGrotesk_400Regular.ttf")
const spaceGroteskBold = require("@expo-google-fonts/space-grotesk/SpaceGrotesk_700Bold.ttf")

export const customFontsToLoad = {
  notoSerifRegular,
  notoSerifMedium: notoSerifRegular,
  notoSerifSemiBold: notoSerifBold,
  notoSerifBold,
  spaceGroteskLight: spaceGroteskRegular,
  spaceGroteskRegular,
  spaceGroteskMedium: spaceGroteskRegular,
  spaceGroteskSemiBold: spaceGroteskBold,
  spaceGroteskBold,
}

const fonts = {
  notoSerifJP: {
    // Cross-platform Google font for news-like tone.
    normal: "notoSerifRegular",
    medium: "notoSerifMedium",
    semiBold: "notoSerifSemiBold",
    bold: "notoSerifBold",
  },
  spaceGrotesk: {
    // Cross-platform Google font.
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.notoSerifJP,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.spaceGrotesk,
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
