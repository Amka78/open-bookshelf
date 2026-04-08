import { i18n } from "@/i18n"
import { format } from "date-fns"
import { arSA as ar } from "date-fns/locale/ar-SA"
import { enUS as en } from "date-fns/locale/en-US"
import { ko } from "date-fns/locale/ko"

type Options = Parameters<typeof format>[2]

const getLocale = () => {
  const locale = i18n.locale.split("-")[0]
  return locale === "ar" ? ar : locale === "ko" ? ko : en
}

export const formatDate = (date: Date, dateFormat?: string, options?: Options) => {
  const locale = getLocale()
  const dateOptions = {
    ...options,
    locale,
  }
  return format(date, dateFormat ?? "MMM dd, yyyy", dateOptions)
}
