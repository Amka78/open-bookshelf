import { Box } from "@/components/Box/Box"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form"
import { FormSuggestionPopover } from "./FormSuggestionPopover"
import { InputField, type InputFieldProps } from "../InputField/InputField"

const MAX_SUGGESTIONS = 5

export type FormInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    suggestions?: string[]
  }

export function FormInputField<T extends FieldValues>(props: FormInputFiledProps<T>) {
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
        const testIdPrefix = `form-input-${String(name)}`

        return (
          <FormSuggestionPopover
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
            onClose={closeSuggestion}
            candidates={candidateValues}
            onSelect={(candidate) => {
              renderProps.field.onChange(candidate)
              closeSuggestion()
            }}
            width={inputProps.width as string | undefined}
            testIdPrefix={testIdPrefix}
            backdropTestID={`form-input-backdrop-${String(name)}`}
            suggestionsTestID={`form-input-suggestions-${String(name)}`}
            candidateTestIDPrefix={`form-input-suggestion-${String(name)}`}
          />
        )
      }}
    />
  )
}

