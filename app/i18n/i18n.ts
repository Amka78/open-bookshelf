import * as Localization from "expo-localization"
import { I18n } from "i18n-js"
import { I18nManager } from "react-native"

import ar from "./ar"
// if English isn't your default language, move Translations to the appropriate language file.
import en, { type Translations } from "./en"
import ja from "./ja"
import ko from "./ko"

const [deviceLocale] = Localization.getLocales()
const locale = deviceLocale?.languageTag ?? "en"

/**
 * we need always include "*-US" for some valid language codes because when you change the system language,
 * the language code is the suffixed with "-US". i.e. if a device is set to English ("en"),
 * if you change to another language and then return to English language code is now "en-US".
 */
export const i18n = new I18n({ ar, en, "en-US": en, ja, "ja-JP": ja, ko })

i18n.enableFallback = true
i18n.locale = locale

// handle RTL languages
export const isRTL = deviceLocale?.textDirection === "rtl"
I18nManager.allowRTL(isRTL)
I18nManager.forceRTL(isRTL)

/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `['${TKey}']` | `.${TKey}`
  >
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<TValue, Text extends string> = TValue extends any[]
  ? Text
  : TValue extends object
    ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
    : Text
