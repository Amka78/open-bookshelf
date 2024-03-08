import i18n from "i18n-js"
import type { TxKeyPath } from "./i18n"

export type MessageKey =
  | TxKeyPath
  | { key: TxKeyPath; restParam?: (TxKeyPath | { key: TxKeyPath | string; translate: boolean })[] }
/**
 * Translates text.
 *
 * @param key The i18n key.
 * @param options The i18n options.
 * @returns The translated text.
 *
 * @example
 * Translations:
 *
 * ```en.ts
 * {
 *  "hello": "Hello, {{name}}!"
 * }
 * ```
 *
 * Usage:
 * ```ts
 * import { translate } from "i18n-js"
 *
 * translate("common.ok", { name: "world" })
 * // => "Hello world!"
 * ```
 */
export function translate(message: MessageKey, options?: i18n.TranslateOptions) {
  let currentLocaleValue = null

  if (typeof message === "string") {
    currentLocaleValue = i18n.t(message, options)
  } else if (typeof message !== "undefined") {
    currentLocaleValue = i18n.t(message.key, options)
    if (currentLocaleValue && message.restParam) {
      for (let i = 0; message.restParam.length > i; i++) {
        let settingValue

        if (typeof message.restParam[i] === "string") {
          const key = message.restParam[i] as string
          settingValue = i18n.t(key, options)
        } else {
          const object = message.restParam[i] as { key: string; translate: boolean }
          if (object.translate) {
            settingValue = i18n.t(object.key, options)
          } else {
            settingValue = object.key
          }
        }
        currentLocaleValue = currentLocaleValue.replace("{" + i + "}", settingValue)
      }
    }
  }
  return currentLocaleValue
}
