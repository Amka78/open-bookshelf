import { Box, Text } from "@/components"
import { Popover, PopoverBody, PopoverContent, Pressable } from "@gluestack-ui/themed"
import { useMemo, useState } from "react"
import { Controller, type ControllerProps } from "react-hook-form"
import { InputField, type InputFieldProps } from "../InputField/InputField"

const MAX_SUGGESTIONS = 20

export type FormInputFiledProps<T> = Omit<InputFieldProps, "onChangeText"> &
  Omit<ControllerProps<T>, "render"> & {
    suggestions?: string[]
  }
export function FormInputField<T>(props: FormInputFiledProps<T>) {
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)

  const openSuggestion = () => {
    setIsSuggestionOpen((previous) => (previous ? previous : true))
  }

  const closeSuggestion = () => {
    setIsSuggestionOpen((previous) => (previous ? false : previous))
  }

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
        const rawValue = ((renderProps.field.value as string) ?? "").trim().toLowerCase()
        const candidateValues: string[] = []
        let hasExactMatch = false

        if (isSuggestionOpen) {
          for (const suggestion of normalizedSuggestions) {
            if (rawValue.length > 0 && suggestion.lowerCaseValue === rawValue) {
              hasExactMatch = true
              break
            }

            if (rawValue.length > 0 && !suggestion.lowerCaseValue.includes(rawValue)) {
              continue
            }

            candidateValues.push(suggestion.value)
            if (candidateValues.length >= MAX_SUGGESTIONS) {
              break
            }
          }
        }
        const isOpen = candidateValues.length > 0 && isSuggestionOpen && !hasExactMatch

        return (
          <Popover
            placement="bottom left"
            trigger={(triggerProps) => {
              return (
                <Box {...triggerProps} width={inputProps.width ?? "$full"}>
                  <InputField
                    {...inputProps}
                    onChangeText={(text) => {
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
                      closeSuggestion()
                    }}
                    value={(renderProps.field.value as string) ?? ""}
                    ref={renderProps.field.ref}
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
