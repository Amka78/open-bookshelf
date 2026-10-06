import { Box, HStack, IconButton, InputField, Input, Text } from "@/components"
import { usePalette } from "@/theme"
import { Pressable } from "@gluestack-ui/themed"
import { useState } from "react"
import { Platform, StyleSheet } from "react-native"

export type TagInputProps = {
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  testID?: string
  suggestions?: string[]
  separator?: RegExp
  disabled?: boolean
  showCopyPaste?: boolean
  onBlur?: () => void
}

const DEFAULT_SEPARATOR = /[,;、]/

export function TagInput({
  value,
  onChange,
  placeholder,
  testID = "tag-input",
  suggestions = [],
  separator = DEFAULT_SEPARATOR,
  disabled = false,
  showCopyPaste = false,
  onBlur,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const palette = usePalette()

  const filteredSuggestions = suggestions.filter((suggestion) => {
    if (value.includes(suggestion)) return false
    if (!inputValue.trim()) return true
    return suggestion.toLowerCase().includes(inputValue.toLowerCase())
  })

  const showSuggestions = isFocused && inputValue.trim() && filteredSuggestions.length > 0

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue("")
  }

  const removeTag = (index: number) => {
    const next = [...value]
    next.splice(index, 1)
    onChange(next)
  }

  const startEditing = (index: number) => {
    if (disabled) return
    setEditingIndex(index)
    setEditingValue(value[index])
  }

  const commitEditing = () => {
    if (editingIndex === null) return
    const trimmed = editingValue.trim()
    if (trimmed && trimmed !== value[editingIndex]) {
      const next = [...value]
      next[editingIndex] = trimmed
      onChange(next)
    }
    setEditingIndex(null)
    setEditingValue("")
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditingValue("")
  }

  const handleEditKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      event.preventDefault()
      commitEditing()
    } else if (event.key === "Escape") {
      cancelEditing()
    }
  }

  const handleCopy = async () => {
    if (value.length === 0) return
    const text = value.join(", ")
    if (Platform.OS === "web" && navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
  }

  const handlePaste = async () => {
    if (Platform.OS === "web" && navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText()
        const parts = text
          .split(separator)
          .map((part) => part.trim())
          .filter(Boolean)
        const newTags = parts.filter((tag) => !value.includes(tag))
        if (newTags.length > 0) {
          onChange([...value, ...newTags])
        }
      } catch {
        // Clipboard access denied
      }
    }
  }

  const handleInputChange = (text: string) => {
    if (separator.test(text)) {
      const parts = text
        .split(separator)
        .map((part) => part.trim())
        .filter(Boolean)
      if (parts.length > 0) {
        // If the text ends with a separator, all parts are tags
        // Otherwise, the last part is still being typed
        const endsWithSeparator = separator.test(text[text.length - 1])
        if (endsWithSeparator) {
          const newTags = parts.filter((tag) => !value.includes(tag))
          onChange([...value, ...newTags])
          setInputValue("")
        } else {
          const lastPart = parts[parts.length - 1]
          const newTags = parts.slice(0, -1).filter((tag) => !value.includes(tag))
          onChange([...value, ...newTags])
          setInputValue(lastPart)
        }
      } else {
        setInputValue("")
      }
    } else {
      setInputValue(text)
    }
  }

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      event.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (event.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (inputValue.trim()) {
      addTag(inputValue)
    }
    onBlur?.()
  }

  return (
    <Box style={styles.container} testID={testID}>
      <HStack style={styles.tagContainer} flexWrap="wrap" alignItems="center">
        {value.map((tag, index) => (
          <Box
            key={tag}
            style={[
              styles.tag,
              { backgroundColor: palette.backgroundLight, borderColor: palette.border },
              editingIndex === index ? { borderColor: palette.primary } : undefined,
            ]}
            testID={`${testID}-tag-${index}`}
          >
            {editingIndex === index ? (
              <Input size="sm" style={styles.editInput}>
                <InputField
                  value={editingValue}
                  onChangeText={setEditingValue}
                  onBlur={commitEditing}
                  onKeyDown={Platform.OS === "web" ? handleEditKeyDown : undefined}
                  testID={`${testID}-tag-${index}-edit`}
                  autoFocus
                />
              </Input>
            ) : (
              <>
                <Pressable
                  onPress={() => startEditing(index)}
                  style={styles.tagTextWrapper}
                  testID={`${testID}-tag-${index}-text`}
                >
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </Pressable>
                {!disabled && (
                  <IconButton
                    name="close-circle"
                    iconSize="sm"
                    onPress={() => removeTag(index)}
                    testID={`${testID}-tag-${index}-remove`}
                    style={styles.removeButton}
                  />
                )}
              </>
            )}
          </Box>
        ))}
        <Box style={styles.inputWrapper} flex={1}>
          <Input size="sm">
            <InputField
              value={inputValue}
              onChangeText={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={Platform.OS === "web" ? handleKeyDown : undefined}
              placeholder={value.length === 0 ? placeholder : ""}
              testID={`${testID}-input`}
              disabled={disabled}
            />
          </Input>
        </Box>
      </HStack>
      {showCopyPaste && !disabled && (
        <Box style={styles.actionButtonsContainer}>
          <IconButton
            name="content-copy"
            iconSize="sm"
            onPress={handleCopy}
            testID={`${testID}-copy`}
            disabled={value.length === 0}
          />
          <IconButton
            name="content-paste"
            iconSize="sm"
            onPress={handlePaste}
            testID={`${testID}-paste`}
          />
        </Box>
      )}
      {showSuggestions && (
        <Box
          style={[
            styles.suggestionsContainer,
            { backgroundColor: palette.background, borderColor: palette.border },
          ]}
          testID={`${testID}-suggestions`}
        >
          {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
            <Box
              key={suggestion}
              style={styles.suggestionItem}
              onPress={() => {
                addTag(suggestion)
                setIsFocused(false)
              }}
              testID={`${testID}-suggestion-${index}`}
            >
              <Text>{suggestion}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  tagContainer: {
    alignItems: "center",
    gap: 4,
    minHeight: 32,
    paddingRight: 60,
  },
  tag: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagTextWrapper: {
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  tagText: {
    fontSize: 12,
    marginRight: 4,
  },
  editInput: {
    borderWidth: 0,
    minWidth: 60,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  removeButton: {
    marginLeft: 2,
  },
  inputWrapper: {
    minWidth: 100,
  },
  actionButtonsContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 56,
  },
  suggestionsContainer: {
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
    position: "absolute",
    top: "100%",
    width: "100%",
    zIndex: 10,
  },
  suggestionItem: {
    cursor: Platform.OS === "web" ? "pointer" : undefined,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
})
