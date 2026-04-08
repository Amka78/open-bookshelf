import { Box } from "@/components/Box/Box"
import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { RootContainer } from "@/components/RootContainer/RootContainer"
import { Text } from "@/components/Text/Text"
import { VStack } from "@/components/VStack/VStack"
import React, { type ErrorInfo } from "react"
import { ScrollView, type TextStyle, type ViewStyle } from "react-native"

export interface ErrorDetailsProps {
  error: Error
  errorInfo: ErrorInfo
  onReset(): void
}

export function ErrorDetails(props: ErrorDetailsProps) {
  return (
    <RootContainer testID="error-details-container">
      <VStack flex={1} width="$full" testID="error-details-content">
        <Heading tx={"errorScreen.title"} />

        <Box flex={1} minHeight={0} testID="error-details-scroll-wrapper">
          <ScrollView contentContainerStyle={$errorSectionContentContainer}>
            <Text style={[$errorContent, { fontWeight: "bold" }]}>{`${props.error}`.trim()}</Text>
            <Text selectable style={$errorBacktrace}>
              {`${props.errorInfo.componentStack}`.trim()}
            </Text>
          </ScrollView>
        </Box>

        <Button
          onPress={props.onReset}
          tx="errorScreen.reset"
          testID="error-reset-button"
          width="$full"
          alignSelf="stretch"
        />
      </VStack>
    </RootContainer>
  )
}

const $errorSectionContentContainer: ViewStyle = {
  paddingBottom: 12,
}

const $errorContent: TextStyle = {
  //color: colors.error,
}

const $errorBacktrace: TextStyle = {
  //marginTop: spacing.medium,
  //color: colors.textDim,
}


