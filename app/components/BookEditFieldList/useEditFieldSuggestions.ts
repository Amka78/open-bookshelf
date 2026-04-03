import type { Category, Metadata } from "@/models/calibre"
import { lowerCaseToCamelCase } from "@/utils/convert"

type UseEditFieldSuggestionsParams = {
  tagBrowser?: Category[]
  metaData?: Metadata
}

type UseEditFieldSuggestionsResult = {
  suggestionMap: Map<string, string[]>
  languageCodeSuggestions?: string[]
}

export function useEditFieldSuggestions({
  tagBrowser,
  metaData,
}: UseEditFieldSuggestionsParams): UseEditFieldSuggestionsResult {
  const suggestionMap = new Map<string, string[]>()

  tagBrowser?.forEach((category) => {
    const metadataLabel = lowerCaseToCamelCase(category.category)
    const suggestions = new Set<string>()

    category.subCategory.forEach((subCategory) => {
      subCategory.children.forEach((node) => {
        if (node.name) {
          suggestions.add(node.name)
        }
      })
    })

    if (suggestions.size > 0) {
      suggestionMap.set(metadataLabel, Array.from(suggestions))
    }
  })

  const langNames = metaData?.langNames

  const languageCodeSuggestions =
    // 言語コードではなく言語名を候補として返す
    langNames ? Array.from(langNames.values()) : undefined

  return {
    suggestionMap,
    languageCodeSuggestions,
  }
}
