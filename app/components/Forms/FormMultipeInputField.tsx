import { Box, HStack, IconButton, Input, Text, VStack } from "@/components"
import { Popover, PopoverBody, PopoverContent, Pressable } from "@gluestack-ui/themed"
import { useMemo, useState } from "react"
import { Controller, type ControllerProps } from "react-hook-form"
import { InputField, type InputFieldProps } from "../InputField/InputField"

const MAX_SUGGESTIONS = 20

export type FormMultipleInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    textToValue: string
    valueToText: string
    suggestions?: string[]
  }
export function FormMultipleInputField<T>(props: FormMultipleInputFiledProps<T>) {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null)

  const openSuggestion = () => {
    setIsSuggestionOpen((previous) => (previous ? previous : true))
  }

  const closeSuggestion = () => {
    setIsSuggestionOpen((previous) => (previous ? false : previous))
    setActiveRowIndex(null)
  }

  const {
    control,
    name,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
    textToValue,
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
        let hasExactMatch = false
        if (isSuggestionOpen && activeRowIndex !== null) {
          for (const suggestion of normalizedSuggestions) {
            if (currentToken.length > 0 && suggestion.lowerCaseValue === currentToken) {
              hasExactMatch = true
              break
            }

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
        const isOpen = candidateValues.length > 0 && isSuggestionOpen && !hasExactMatch

        const commitRows = (nextRows: string[]) => {
          const normalized = nextRows.map((entry) => (typeof entry === "string" ? entry : ""))
          renderProps.field.onChange(normalized)
        }

        return (
          <VStack width={inputProps.width ?? "$full"}>
            {displayRows.map((rowValue, index) => (
              <HStack
                key={`${String(name)}-row-${index}`}
                alignItems="center"
                marginBottom={index === displayRows.length - 1 ? undefined : "sm"}
              >
                <Popover
                  placement="bottom left"
                  trigger={(triggerProps) => {
                    return (
                      <Box {...triggerProps} flex={1}>
                        <Input width={inputProps.width ?? "$full"}>
                          <InputField
                            {...inputProps}
                            onChangeText={(text) => {
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
                              setActiveRowIndex(index)
                              openSuggestion()
                            }}
                            onBlur={() => {
                              renderProps.field.onBlur()
                              closeSuggestion()
                            }}
                            value={rowValue}
                            ref={index === 0 ? renderProps.field.ref : undefined}
                          />
                        </Input>
                      </Box>
                    )
                  }}
                  isOpen={isOpen && activeRowIndex === index}
                  trapFocus={false}
                  focusScope={false}
                  onClose={closeSuggestion}
                  offset={4}
                >
                  <PopoverContent
                    minWidth={inputProps.width ?? "$full"}
                    width={inputProps.width ?? "$full"}
                  >
                    <PopoverBody>
                      <Box>
                        {candidateValues.map((candidate) => (
                          <Pressable
                            key={`${String(name)}-${candidate}`}
                            onPress={() => {
                              const sourceRows = values.length > 0 ? [...values] : [""]
                              sourceRows[index] = candidate
                              commitRows(sourceRows)
                              closeSuggestion()
                            }}
                          >
                            <Box
                              borderWidth="$1"
                              borderRadius="$sm"
                              paddingHorizontal="sm"
                              paddingVertical="xs"
                              marginBottom="xs"
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
