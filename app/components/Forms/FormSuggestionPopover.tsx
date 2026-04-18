import { Box } from "@/components/Box/Box"
import { Popover, PopoverBackdrop, PopoverBody, PopoverContent } from "@/components/Popover/Popover"
import { Pressable } from "@/components/Pressable/Pressable"
import { Text } from "@/components/Text/Text"
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility"
import { usePalette } from "@/theme"
import { Platform } from "react-native"
import type { ReactNode } from "react"
import type { DimensionValue } from "react-native"
import { resolveSuggestionPopoverPlacement } from "./formSuggestionPlacement"

type FormSuggestionPopoverProps = {
  trigger: (triggerProps: Record<string, unknown>) => ReactNode
  isOpen: boolean
  onClose: () => void
  candidates: string[]
  onSelect: (candidate: string) => void
  width?: string
  testIdPrefix: string
  backdropTestID?: string
  suggestionsTestID?: string
  candidateTestIDPrefix?: string
  optionPaddingHorizontal?: string
  optionPaddingVertical?: string
  optionMarginBottom?: string
}

export function FormSuggestionPopover(props: FormSuggestionPopoverProps) {
  const {
    trigger,
    isOpen,
    onClose,
    candidates,
    onSelect,
    width,
    testIdPrefix,
    backdropTestID,
    suggestionsTestID,
    candidateTestIDPrefix,
    optionPaddingHorizontal = "$2",
    optionPaddingVertical = "$1",
    optionMarginBottom = "$1",
  } = props
  const palette = usePalette()
  const { isKeyboardVisible } = useKeyboardVisibility()

  const popoverPlacement = resolveSuggestionPopoverPlacement(isKeyboardVisible)

  // On web, render a simple dropdown to avoid Popover focus trapping issues
  if (Platform.OS === "web") {
    return (
      <Box position="relative" flex={1}>
        {trigger({})}
        {isOpen && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={9999}
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
            {candidates.map((candidate) => (
              <Pressable
                key={`${testIdPrefix}-${candidate}`}
                testID={`${
                  candidateTestIDPrefix ?? `${testIdPrefix}-suggestion`
                }-${encodeURIComponent(candidate)}`}
                onPressIn={() => {
                  onSelect(candidate)
                }}
              >
                <Box
                  borderWidth="$1"
                  borderRadius="$sm"
                  paddingHorizontal={optionPaddingHorizontal as DimensionValue}
                  paddingVertical={optionPaddingVertical as DimensionValue}
                  marginBottom={optionMarginBottom as DimensionValue}
                >
                  <Text fontSize="$sm" isTruncated={true}>
                    {candidate}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Popover
      placement={popoverPlacement}
      shouldFlip={false}
      isKeyboardDismissable={false}
      useRNModal={true}
      trigger={trigger}
      isOpen={isOpen}
      trapFocus={false}
      focusScope={false}
      onClose={onClose}
      offset={4}
    >
      <PopoverBackdrop
        testID={backdropTestID ?? `${testIdPrefix}-backdrop`}
        onPress={() => {
          onClose()
        }}
      />
      <PopoverContent
        testID={suggestionsTestID ?? `${testIdPrefix}-suggestions`}
        minWidth={(width ?? "$full") as DimensionValue}
        width={(width ?? "$full") as DimensionValue}
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
            {candidates.map((candidate) => (
              <Pressable
                key={`${testIdPrefix}-${candidate}`}
                testID={`${
                  candidateTestIDPrefix ?? `${testIdPrefix}-suggestion`
                }-${encodeURIComponent(candidate)}`}
                onPressIn={() => {
                  onSelect(candidate)
                }}
              >
                <Box
                  borderWidth="$1"
                  borderRadius="$sm"
                  paddingHorizontal={optionPaddingHorizontal as DimensionValue}
                  paddingVertical={optionPaddingVertical as DimensionValue}
                  marginBottom={optionMarginBottom as DimensionValue}
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
}
