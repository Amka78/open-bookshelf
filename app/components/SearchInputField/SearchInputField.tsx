import { Box } from "@/components/Box/Box"
import { FormSuggestionPopover } from "@/components/Forms/FormSuggestionPopover"
import { InputField } from "@/components/InputField/InputField"
import type { MessageKey } from "@/i18n"
import { useEffect, useRef, useState } from "react"
import type { TextInput as RNTextInput } from "react-native"

const MAX_SUGGESTIONS = 8

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

  const isOpen = isSuggestionOpen && candidates.length > 0

  return (
    <FormSuggestionPopover
      trigger={(triggerProps) => {
        const { onPress: _op, onPressIn: _opi, onPressOut: _opo, ...restProps } = triggerProps
        return (
          <Box {...restProps} width={width ?? "$full"}>
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
              size={size as never}
              textAlign="left"
              testID={testID ?? "search-input-field"}
              autoFocus={autoFocus}
              ref={(ref) => {
                inputRef.current = ref as unknown as RNTextInput | null
              }}
            />
          </Box>
        )
      }}
      isOpen={isOpen}
      onClose={() => setIsSuggestionOpen(false)}
      candidates={candidates}
      onSelect={(candidate) => {
        const newValue = `${prefix}${candidate} `
        onChangeText(newValue)
        setIsSuggestionOpen(false)
        // Return focus to the input after selection
        inputRef.current?.focus()
      }}
      width={typeof width === "string" ? width : undefined}
      testIdPrefix="search-input"
    />
  )
}
