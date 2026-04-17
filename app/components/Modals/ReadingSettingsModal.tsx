import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { IconButton } from "@/components/IconButton/IconButton"
import { Input } from "@/components/Input/Input"
import { Text } from "@/components/Text/Text"
import { useStores } from "@/models"
import { usePalette } from "@/theme"
import { HStack, InputField, Pressable, VStack } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type ReadingSettingsModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  "ReadingSettingsModal"
>

type ViewerTheme = "default" | "sepia" | "dark"

export const ReadingSettingsModal = observer((props: ReadingSettingsModalProps) => {
  const { settingStore } = useStores()
  const palette = usePalette()

  const fontSize = settingStore.viewerFontSizePt
  const theme = settingStore.viewerTheme
  const [intervalInput, setIntervalInput] = useState(
    String(props.modal.params.autoPageTurnIntervalMs),
  )
  const intervalMs = Number(intervalInput)
  const isInvalidInterval = !Number.isFinite(intervalMs) || intervalMs < 100

  const themeLabels = {
    default: "readingSettings.themeDefault",
    sepia: "readingSettings.themeSepia",
    dark: "readingSettings.themeDark",
  } as const

  type ThemeKey = keyof typeof themeLabels

  const themes: Array<{ value: ViewerTheme; txKey: ThemeKey }> = [
    { value: "default", txKey: "default" },
    { value: "sepia", txKey: "sepia" },
    { value: "dark", txKey: "dark" },
  ]

  return (
    <Root>
      <Header>
        <Heading tx="readingSettings.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <VStack space="lg" padding="$2">
          <VStack space="sm">
            <Text tx="readingSettings.fontSize" fontWeight="$bold" />
            <HStack alignItems="center" space="md">
              <IconButton
                name="minus"
                iconSize="md-"
                onPress={() => settingStore.setViewerFontSizePt(fontSize - 1)}
                testID="reading-settings-font-decrease"
              />
              <Text minWidth={48} textAlign="center">{`${fontSize}pt`}</Text>
              <IconButton
                name="plus"
                iconSize="md-"
                onPress={() => settingStore.setViewerFontSizePt(fontSize + 1)}
                testID="reading-settings-font-increase"
              />
            </HStack>
          </VStack>

          <VStack space="sm">
            <Text tx="readingSettings.theme" fontWeight="$bold" />
            <HStack space="sm">
              {themes.map(({ value, txKey }) => {
                const isSelected = theme === value
                return (
                  <Pressable
                    key={value}
                    onPress={() => settingStore.setViewerTheme(value)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: isSelected ? palette.textPrimary : palette.borderSubtle,
                      backgroundColor: isSelected ? palette.surfaceStrong : "transparent",
                    }}
                    testID={`reading-settings-theme-${value}`}
                  >
                    <Text
                      tx={themeLabels[txKey]}
                      color={isSelected ? palette.textPrimary : palette.textSecondary}
                    />
                  </Pressable>
                )
              })}
            </HStack>
          </VStack>

          <VStack space="sm">
            <Text tx="readingSettings.autoPageTurnInterval" fontWeight="$bold" />
            <Input>
              <InputField
                value={intervalInput}
                onChangeText={setIntervalInput}
                keyboardType="number-pad"
                inputMode="numeric"
                testID="reading-settings-auto-page-interval"
              />
            </Input>
            <Text tx="modal.viewerHeaderAutoPageTurn.minIntervalHelp" fontSize="$sm" />
          </VStack>
        </VStack>
      </Body>
      <Footer>
        <Button
          onPress={() => {
            if (isInvalidInterval) return
            props.modal.params.onAutoPageTurnIntervalChange?.(Math.floor(intervalMs))
            props.modal.closeModal()
          }}
          tx="common.ok"
          isDisabled={isInvalidInterval}
        />
      </Footer>
    </Root>
  )
})
