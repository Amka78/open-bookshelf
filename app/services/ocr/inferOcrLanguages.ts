const OCR_LANGUAGE_ALIASES: Record<string, string> = {
  ar: "ara",
  ara: "ara",
  arabic: "ara",
  en: "eng",
  eng: "eng",
  english: "eng",
  hi: "hin",
  hin: "hin",
  hindi: "hin",
  ja: "jpn",
  japanese: "jpn",
  jpn: "jpn",
  ko: "kor",
  korean: "kor",
  kor: "kor",
  zh: "chi",
  chi: "chi",
  chinese: "chi",
}

export function inferOcrLanguages(languages: string[]): string[] {
  const resolved = languages
    .map((language) => OCR_LANGUAGE_ALIASES[String(language ?? "").trim().toLowerCase()])
    .filter(Boolean)

  if (resolved.length > 0) {
    return Array.from(new Set(resolved))
  }

  return ["eng"]
}
