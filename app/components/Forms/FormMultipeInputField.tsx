import { Box, HStack, IconButton, Input, VStack } from "@/components"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form"
import { FormSuggestionPopover } from "./FormSuggestionPopover"
import { InputField, type InputFieldProps } from "../InputField/InputField"

const MAX_SUGGESTIONS = 5

export type FormMultipleInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    textToValue: string
    valueToText: string
    suggestions?: string[]
    onInputFocus?: () => void
  }
export function FormMultipleInputField<T extends FieldValues>(
  props: FormMultipleInputFiledProps<T>,
) {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null)
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
    setActiveRowIndex(null)
  }

  const scheduleCloseSuggestion = (delayMs: number) => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setIsSuggestionOpen(false)
      setActiveRowIndex(null)
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
    textToValue,
    suggestions,
    onInputFocus,
    ...inputProps
  } = props

  const normalizedSuggestions = useMemo(() => {
    const suggestionSet = new Set<string>()
    ;(suggestions ?? []).forEach((suggestion) => {
      const trimmed = typeof suggestion === "string" ? suggestion.trim() : ""
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
        const parsedSeparator = textToValue ?? ","
        const values = Array.isArray(renderProps.field.value)
          ? renderProps.field.value.map((entry) => (typeof entry === "string" ? entry : ""))
          : []
        const displayRows = values.length > 0 ? values : [""]
        const selectedValueSet = new Set(
          values.map((entry) => entry.trim()).filter((entry) => entry.length > 0),
        )
        const focusedRowValue =
          activeRowIndex !== null && activeRowIndex >= 0 && activeRowIndex < displayRows.length
            ? displayRows[activeRowIndex]
            : ""
        const currentToken = focusedRowValue.trim().toLowerCase()

        const candidateValues: string[] = []
        if (isSuggestionOpen && activeRowIndex !== null) {
          for (const suggestion of normalizedSuggestions) {
            if (selectedValueSet.has(suggestion.value)) {
              continue
            }

            if (currentToken.length > 0 && !suggestion.lowerCaseValue.includes(currentToken)) {
              continue
            }

            candidateValues.push(suggestion.value)
            if (candidateValues.length >= MAX_SUGGESTIONS) {
              break
            }
          }
        }
        const isOpen = candidateValues.length > 0 && isSuggestionOpen

        const commitRows = (nextRows: string[]) => {
          // 入力値を候補値と完全一致させる
          const normalized = nextRows.map((entry) => {
            if (typeof entry !== "string") return ""
            // 候補リストに完全一致するものがあればそちらを優先
            const match = normalizedSuggestions.find(
              (s) => s.value.trim().toLowerCase() === entry.trim().toLowerCase(),
            )
            return match ? match.value : entry
          })
          renderProps.field.onChange(normalized)
        }

        return (
          <VStack width={inputProps.width ?? "$full"}>
            {displayRows.map((rowValue, index) => (
              <HStack
                key={`${String(name)}-row-${index}`}
                alignItems="center"
                marginBottom={index === displayRows.length - 1 ? undefined : "$4"}
              >
                <FormSuggestionPopover
                  trigger={(triggerProps) => {
                    const { onPress, onPressIn, onPressOut, ...restTriggerProps } = triggerProps
                    return (
                      <Box {...restTriggerProps} flex={1}>
                        <Input width={inputProps.width ?? "$full"}>
                          <InputField
                            {...inputProps}
                            onChangeText={(text) => {
                              setActiveRowIndex(index)
                              openSuggestion()
                              const sourceRows = values.length > 0 ? [...values] : [""]

                              if (parsedSeparator === "") {
                                sourceRows[index] = text
                                commitRows(sourceRows)
                                return
                              }

                              const splitted = text
                                .split(parsedSeparator)
                                .map((entry) => entry.trim())
                                .filter(Boolean)

                              sourceRows.splice(index, 1, ...splitted)
                              commitRows(sourceRows)
                            }}
                            onFocus={() => {
                              onInputFocus?.()
                              setActiveRowIndex(index)
                              openSuggestion()
                            }}
                            onBlur={() => {
                              renderProps.field.onBlur()
                              scheduleCloseSuggestion(100)
                            }}
                            value={rowValue}
                            testID={`${inputProps.testID ?? `form-multiple-input-${String(name)}`}-row-${index}`}
                            ref={index === 0 ? renderProps.field.ref : undefined}
                          />
                        </Input>
                      </Box>
                    )
                  }}
                  isOpen={isOpen && activeRowIndex === index}
                  onClose={closeSuggestion}
                  candidates={candidateValues}
                  onSelect={(candidate) => {
                    const sourceRows = values.length > 0 ? [...values] : [""]
                    sourceRows[index] = candidate
                    commitRows(sourceRows)
                    closeSuggestion()
                  }}
                  width={inputProps.width as string | undefined}
                  testIdPrefix={`form-multiple-input-${String(name)}-${index}`}
                  optionPaddingHorizontal="$4"
                  optionPaddingVertical="$2"
                  optionMarginBottom="$2"
                />
                <IconButton
                  name="plus"
                  iconSize="sm"
                  onPress={async () => {
                    const sourceRows = values.length > 0 ? [...values] : [""]
                    sourceRows.splice(index + 1, 0, "")
                    commitRows(sourceRows)
                  }}
                />
                {displayRows.length > 1 ? (
                  <IconButton
                    name="minus"
                    iconSize="sm"
                    onPress={async () => {
                      const sourceRows = values.length > 0 ? [...values] : [""]
                      sourceRows.splice(index, 1)
                      commitRows(sourceRows)
                    }}
                  />
                ) : null}
              </HStack>
            ))}
          </VStack>
        )
      }}
    />
  )
}
