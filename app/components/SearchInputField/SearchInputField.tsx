import { Box } from "@/components/Box/Box"
import { FormSuggestionPopover } from "@/components/Forms/FormSuggestionPopover"
import { IconButton } from "@/components/IconButton/IconButton"
import { InputField } from "@/components/InputField/InputField"
import type { MessageKey } from "@/i18n"
import { HStack, Input } from "@gluestack-ui/themed"
import { useEffect, useRef, useState } from "react"
import type { TextInput as RNTextInput } from "react-native"

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
  width?: number | string
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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<RNTextInput | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const scheduleClose = () => {
    if (closeTimerRef.current != null) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setIsSuggestionOpen(false)
    }, 120)
  }

  const cancelClose = () => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const { prefix, token } = getCurrentToken(value)
  const lowerToken = token.toLowerCase()

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
                <Input variant="underlined" size={size as never ?? "lg"}>
                  <InputField
                    value={value}
                    onChangeText={(text) => {
                      cancelClose()
                      setIsSuggestionOpen(true)
                      onChangeText(text)
                    }}
                    onFocus={() => {
                      cancelClose()
                      setIsSuggestionOpen(true)
                    }}
                    onBlur={scheduleClose}
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
            const newValue = `${prefix}${candidate} `
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
