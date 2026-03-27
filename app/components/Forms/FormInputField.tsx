import { Box } from "@/components/Box/Box"
import { Pressable } from "@/components/Pressable/Pressable"
import {
  Popover,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
} from "@/components/Popover/Popover"
import { Text } from "@/components/Text/Text"
import { usePalette } from "@/theme"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form"
import { InputField, type InputFieldProps } from "../InputField/InputField"

const MAX_SUGGESTIONS = 5

export type FormInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    suggestions?: string[]
  }

export function FormInputField<T extends FieldValues>(props: FormInputFiledProps<T>) {
  const palette = usePalette()
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openSuggestion = () => {
    clearCloseTimer()
    setIsSuggestionOpen((previous) => (previous ? previous : true))
  }

  const closeSuggestion = () => {
    clearCloseTimer()
    setIsSuggestionOpen((previous) => (previous ? false : previous))
  }

  const scheduleCloseSuggestion = (delayMs: number) => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setIsSuggestionOpen(false)
    }, delayMs)
  }

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [])

  const {
    control,
    name,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
    suggestions,
    ...inputProps
  } = props

  const normalizedSuggestions = useMemo(() => {
    const suggestionSet = new Set<string>()
    ;(suggestions ?? []).forEach((suggestion) => {
      const trimmed = suggestion?.trim()
      if (trimmed) {
        suggestionSet.add(trimmed)
      }
    })

    return Array.from(suggestionSet).map((value) => ({
      value,
      lowerCaseValue: value.toLowerCase(),
    }))
  }, [suggestions])

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      disabled={disabled}
      render={(renderProps) => {
        const fieldValue = renderProps.field.value
        const textValue = fieldValue == null ? "" : String(fieldValue)
        const inputTestID = inputProps.testID ?? `form-input-${String(name)}`
        const rawValue = textValue.trim().toLowerCase()
        const candidateValues: string[] = []

        if (isSuggestionOpen) {
          for (const suggestion of normalizedSuggestions) {
            if (rawValue.length > 0 && !suggestion.lowerCaseValue.includes(rawValue)) {
              continue
            }

            candidateValues.push(suggestion.value)
            if (candidateValues.length >= MAX_SUGGESTIONS) {
              break
            }
          }
        }

        const isOpen = candidateValues.length > 0 && isSuggestionOpen

        return (
          <Popover
            placement="bottom left"
            shouldFlip={false}
            isKeyboardDismissable={false}
            trigger={(triggerProps) => {
              const { onPress, onPressIn, onPressOut, ...restTriggerProps } = triggerProps
              return (
                <Box {...restTriggerProps} width={inputProps.width ?? "$full"}>
                  <InputField
                    {...inputProps}
                    onChangeText={(text) => {
                      openSuggestion()
                      if (text !== "") {
                        renderProps.field.onChange(text)
                      } else {
                        renderProps.field.onChange(null)
                      }
                    }}
                    onFocus={() => {
                      openSuggestion()
                    }}
                    onBlur={() => {
                      renderProps.field.onBlur()
                      scheduleCloseSuggestion(100)
                    }}
                    value={textValue}
                    ref={renderProps.field.ref}
                    testID={inputTestID}
                  />
                </Box>
              )
            }}
            isOpen={isOpen}
            trapFocus={false}
            focusScope={false}
            onClose={closeSuggestion}
            offset={4}
          >
            <PopoverBackdrop
              testID={`form-input-backdrop-${String(name)}`}
              onPress={() => {
                closeSuggestion()
              }}
            />
            <PopoverContent
              testID={`form-input-suggestions-${String(name)}`}
              minWidth={inputProps.width ?? "$full"}
              width={inputProps.width ?? "$full"}
            >
              <PopoverBody>
                <Box
                  backgroundColor={palette.surface}
                  borderWidth="$1"
                  borderColor={palette.borderStrong}
                  borderRadius="$sm"
                  padding="$1"
                  shadowColor={palette.accent}
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.15}
                  shadowRadius={4}
                >
                  {candidateValues.map((candidate) => (
                    <Pressable
                      key={`${String(name)}-${candidate}`}
                      testID={`form-input-suggestion-${String(name)}-${encodeURIComponent(candidate)}`}
                      onPress={() => {
                        renderProps.field.onChange(candidate)
                        closeSuggestion()
                      }}
                    >
                      <Box
                        borderWidth="$1"
                        borderRadius="$sm"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        marginBottom="$1"
                      >
                        <Text fontSize="$sm" isTruncated={true}>
                          {candidate}
                        </Text>
                      </Box>
                    </Pressable>
                  ))}
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )
      }}
    />
  )
}

