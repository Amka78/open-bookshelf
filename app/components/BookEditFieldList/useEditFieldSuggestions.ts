import type { Category, Metadata } from "@/models/calibre"
import { lowerCaseToCamelCase } from "@/utils/convert"
import { useMemo } from "react"

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
  const suggestionMap = useMemo(() => {
    const mappedSuggestions = new Map<string, string[]>()

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
        mappedSuggestions.set(metadataLabel, Array.from(suggestions))
      }
    })

    return mappedSuggestions
  }, [tagBrowser])

  const languageCodeSuggestions = useMemo(() => {
    const langNames = metaData?.langNames

    if (!langNames) {
      return undefined
    }

    return Array.from(langNames.keys())
  }, [metaData?.langNames])

  return {
    suggestionMap,
    languageCodeSuggestions,
  }
}
