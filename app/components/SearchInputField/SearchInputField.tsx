import { Box } from "@/components/Box/Box"
import { FormSuggestionPopover } from "@/components/Forms/FormSuggestionPopover"
import { IconButton } from "@/components/IconButton/IconButton"
import { InputField } from "@/components/InputField/InputField"
import type { MessageKey } from "@/i18n"
import { HStack, Input } from "@gluestack-ui/themed"
import { useCallback, useEffect, useRef, useState } from "react"
import type { DimensionValue, TextInput as RNTextInput } from "react-native"

const MAX_SUGGESTIONS = 8
const SAVED_SEARCH_PREFIX = "🔖 "
const RECENT_SEARCH_PREFIX = "🕐 "

/** Extract the token currently being typed (the segment after the last whitespace). */
function getCurrentToken(text: string): { prefix: string; token: string } {
  const lastSpace = text.lastIndexOf(" ")
  return lastSpace < 0
    ? { prefix: "", token: text }
    : { prefix: text.slice(0, lastSpace + 1), token: text.slice(lastSpace + 1) }
}

type Props = {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: (text: string) => void
  /** List of suggestion strings shown in the dropdown. */
  suggestions?: string[]
  placeholder?: string
  placeholderTx?: MessageKey
  size?: string
  width?: DimensionValue | "$full"
  testID?: string
  autoFocus?: boolean
  savedSearches?: Array<{ name: string; query: string }>
  onSaveSearch?: (name: string, query: string) => void
  onLoadSearch?: (query: string) => void
  recentSearches?: string[]
}

/**
 * Controlled search input with a suggestion dropdown.
 * Unlike FormInputField this does NOT require react-hook-form.
 */
export function SearchInputField({
  value,
  onChangeText,
  onSubmit,
  suggestions = [],
  placeholder,
  placeholderTx,
  size,
  width,
  testID,
  autoFocus,
  savedSearches,
  onSaveSearch,
  onLoadSearch,
  recentSearches,
}: Props) {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const inputRef = useRef<RNTextInput | null>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearBlurTimeout = useCallback(() => {
    if (!blurTimeoutRef.current) return
    clearTimeout(blurTimeoutRef.current)
    blurTimeoutRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      clearBlurTimeout()
    }
  }, [clearBlurTimeout])

  const { prefix, token } = getCurrentToken(value)
  const lowerToken = token.toLowerCase()

  // Filter suggestions by prefix match, preserving the original order.
  // The order should be: metadata names → boolean operators → metadata with operators.
  // This enables staged autocomplete:
  // 1. First shows metadata names (e.g., "title", "author")
  // 2. Then shows boolean operators (e.g., "AND", "OR", "NOT")
  // 3. Finally shows metadata with operators (e.g., "title:=", "author:=")
  const candidates: string[] = []
  if (isSuggestionOpen && suggestions.length > 0 && lowerToken.length > 0) {
    for (const s of suggestions) {
      if (s.toLowerCase().startsWith(lowerToken)) {
        candidates.push(s)
        if (candidates.length >= MAX_SUGGESTIONS) break
      }
    }
  }

  // Show saved searches when focused with no active autocomplete candidates
  const savedSearchCandidates: string[] = []
  if (isSuggestionOpen && candidates.length === 0 && savedSearches && savedSearches.length > 0) {
    for (const s of savedSearches) {
      savedSearchCandidates.push(`${SAVED_SEARCH_PREFIX}${s.name}`)
    }
  }

  // Show recent searches when focused, input is empty, and no other candidates
  const recentSearchCandidates: string[] = []
  if (
    isSuggestionOpen &&
    candidates.length === 0 &&
    savedSearchCandidates.length === 0 &&
    recentSearches &&
    recentSearches.length > 0 &&
    lowerToken.length === 0
  ) {
    for (const s of recentSearches) {
      recentSearchCandidates.push(`${RECENT_SEARCH_PREFIX}${s}`)
    }
  }

  const activeCandidates =
    candidates.length > 0
      ? candidates
      : savedSearchCandidates.length > 0
        ? savedSearchCandidates
        : recentSearchCandidates
  const isOpen = isSuggestionOpen && activeCandidates.length > 0

  const getChangedText = (
    event: unknown,
  ): string | undefined => {
    if (!event || typeof event !== "object") return undefined

    const target =
      "target" in event && event.target && typeof event.target === "object" ? event.target : undefined
    if (target && "value" in target && typeof target.value === "string") {
      return target.value
    }

    const nativeEvent =
      "nativeEvent" in event && event.nativeEvent && typeof event.nativeEvent === "object"
        ? event.nativeEvent
        : undefined
    if (nativeEvent && "text" in nativeEvent && typeof nativeEvent.text === "string") {
      return nativeEvent.text
    }

    return undefined
  }

  const handleSaveSearch = () => {
    if (onSaveSearch && value.trim().length > 0) {
      onSaveSearch(value.trim(), value.trim())
    }
  }

  const showSaveButton = Boolean(onSaveSearch)
  const isSaved = Boolean(savedSearches?.find((s) => s.name === value.trim()))

  return (
    <HStack width={width ?? "$full"} alignItems="center" space="xs">
      <Box flex={1}>
        <FormSuggestionPopover
          trigger={(triggerProps) => {
            const { onPress: _op, onPressIn: _opi, onPressOut: _opo, ...restProps } = triggerProps
            return (
              <Box {...restProps} flex={1}>
                <Input variant="underlined" size={(size as never) ?? "lg"}>
                  <InputField
                    value={value}
                    onChange={(e) => {
                      // Web: ensure text value is updated on every change including backspace
                      const text = getChangedText(e)
                      if (typeof text === "string" && text !== value) {
                        setIsSuggestionOpen(true)
                        onChangeText(text)
                      }
                    }}
                    onFocus={() => {
                      clearBlurTimeout()
                      setIsSuggestionOpen(true)
                    }}
                    onBlur={() => {
                      clearBlurTimeout()
                      blurTimeoutRef.current = setTimeout(() => {
                        setIsSuggestionOpen(false)
                        blurTimeoutRef.current = null
                      }, 0)
                    }}
                    onSubmitEditing={() => onSubmit?.(value)}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    placeholder={placeholder}
                    placeholderTx={placeholderTx}
                    textAlign="left"
                    testID={testID ?? "search-input-field"}
                    autoFocus={autoFocus}
                    ref={(ref) => {
                      inputRef.current = ref as unknown as RNTextInput | null
                    }}
                  />
                </Input>
              </Box>
            )
          }}
          isOpen={isOpen}
          onClose={() => setIsSuggestionOpen(false)}
          candidates={activeCandidates}
          onSelect={(candidate) => {
            clearBlurTimeout()
            if (candidate.startsWith(SAVED_SEARCH_PREFIX) && onLoadSearch) {
              const name = candidate.slice(SAVED_SEARCH_PREFIX.length)
              const saved = savedSearches?.find((s) => s.name === name)
              if (saved) {
                onLoadSearch(saved.query)
                setIsSuggestionOpen(false)
              }
              return
            }
            if (candidate.startsWith(RECENT_SEARCH_PREFIX)) {
              const query = candidate.slice(RECENT_SEARCH_PREFIX.length)
              onChangeText(query)
              onSubmit?.(query)
              setIsSuggestionOpen(false)
              return
            }

            // Check if this is a metadata name (without operator suffix)
            // If so, append ":" to allow the user to choose an operator from suggestions
            const isMetadataName =
              !candidate.includes(":") &&
              !["AND", "OR", "NOT"].includes(candidate)
            const suffix = isMetadataName ? ":" : " "
            const newValue = `${prefix}${candidate}${suffix}`
            onChangeText(newValue)
            setIsSuggestionOpen(false)
            inputRef.current?.focus()
          }}
          width="100%"
          testIdPrefix="search-input"
        />
      </Box>
      {showSaveButton && (
        <IconButton
          name={isSaved ? "bookmark" : "bookmark-plus-outline"}
          iconSize="md-"
          labelTx="searchBar.saveSearch"
          onPress={handleSaveSearch}
          testID="search-input-save-button"
        />
      )}
    </HStack>
  )
}
