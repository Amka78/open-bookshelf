import { Button, Icon, RootContainer, Text, Heading } from "@/components"
import React, { ErrorInfo } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"

export interface ErrorDetailsProps {
  error: Error
  errorInfo: ErrorInfo
  onReset(): void
}

export function ErrorDetails(props: ErrorDetailsProps) {
  return (
    <RootContainer>
      <Heading tx={"errorScreen.title"} />

      <ScrollView>
        <Text style={$errorContent} weight="bold" text={`${props.error}`.trim()} />
        <Text
          selectable
          style={$errorBacktrace}
          text={`${props.errorInfo.componentStack}`.trim()}
        />
      </ScrollView>

      <Button onPress={props.onReset} tx="errorScreen.reset" />
    </RootContainer>
  )
}

const $topSection: ViewStyle = {
  flex: 1,
  alignItems: "center",
}

const $heading: TextStyle = {
  //color: colors.error,
  //marginBottom: spacing.medium,
}

const $errorSection: ViewStyle = {
  flex: 2,
  //backgroundColor: colors.separator,
  //marginVertical: spacing.medium,
  borderRadius: 6,
}

const $errorSectionContentContainer: ViewStyle = {
  //padding: spacing.medium,
}

const $errorContent: TextStyle = {
  //color: colors.error,
}

const $errorBacktrace: TextStyle = {
  //marginTop: spacing.medium,
  //color: colors.textDim,
}

const $resetButton: ViewStyle = {
  //backgroundColor: colors.error,
  //paddingHorizontal: spacing.huge,
}
