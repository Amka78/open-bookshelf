import { Box } from "@/components/Box/Box"
import { Popover, PopoverBackdrop, PopoverBody, PopoverContent } from "@/components/Popover/Popover"
import { Pressable } from "@/components/Pressable/Pressable"
import { Text } from "@/components/Text/Text"
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility"
import { usePalette } from "@/theme"
import { createPortal } from "react-dom"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Platform } from "react-native"
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

type WebAnchorElement = {
  getBoundingClientRect: () => DOMRect
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
  const webTriggerRef = useRef<WebAnchorElement | null>(null)
  const [webAnchorRect, setWebAnchorRect] = useState<DOMRect | null>(null)

  const popoverPlacement = resolveSuggestionPopoverPlacement(isKeyboardVisible)

  useEffect(() => {
    if (Platform.OS !== "web" || !isOpen) {
      if (webAnchorRect !== null) {
        setWebAnchorRect(null)
      }
      return undefined
    }

    const updateAnchorRect = () => {
      const rect = webTriggerRef.current?.getBoundingClientRect()
      setWebAnchorRect(rect ?? null)
    }

    updateAnchorRect()

    if (typeof window === "undefined") {
      return undefined
    }

    window.addEventListener("resize", updateAnchorRect)
    window.addEventListener("scroll", updateAnchorRect, true)

    return () => {
      window.removeEventListener("resize", updateAnchorRect)
      window.removeEventListener("scroll", updateAnchorRect, true)
    }
  }, [isOpen])

  // On web, render a simple dropdown to avoid Popover focus trapping issues
  if (Platform.OS === "web") {
    const suggestions =
      isOpen && webAnchorRect && typeof document !== "undefined"
        ? createPortal(
            <div
              data-testid={suggestionsTestID ?? `${testIdPrefix}-suggestions`}
              style={{
                position: "fixed",
                top: webAnchorRect.bottom + 4,
                left: webAnchorRect.left,
                width: webAnchorRect.width,
                zIndex: 9999,
                backgroundColor: palette.surface,
                border: `1px solid ${palette.borderStrong}`,
                borderRadius: 4,
                padding: 4,
                boxShadow: `0 2px 8px ${palette.accent}`,
              }}
            >
              {candidates.map((candidate) => (
                <Pressable
                  key={`${testIdPrefix}-${candidate}`}
                  testID={`${
                    candidateTestIDPrefix ?? `${testIdPrefix}-suggestion`
                  }-${encodeURIComponent(candidate)}`}
                  onPress={() => {
                    onSelect(candidate)
                  }}
                >
                  <div
                    style={{
                      border: `1px solid ${palette.borderStrong}`,
                      borderRadius: 4,
                      marginBottom: 4,
                      padding: 6,
                    }}
                  >
                    <Text fontSize="$sm" isTruncated={true}>
                      {candidate}
                    </Text>
                  </div>
                </Pressable>
              ))}
            </div>,
            document.body,
          )
        : null

    return (
      <>
        <div
          ref={(element) => {
            webTriggerRef.current = element
          }}
          style={{ position: "relative", flex: 1 }}
        >
          {trigger({})}
        </div>
        {suggestions}
      </>
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
