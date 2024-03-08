import React, { type ReactElement } from "react"
import {
  type StyleProp,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewStyle,
} from "react-native"
import { Text, type TextProps } from "../components/Text/Text"

export interface ListItemProps extends TouchableOpacityProps {
  /**
   * How tall the list item should be.
   * Default: 56
   */
  height?: number
  /**
   * Whether to show the top separator.
   * Default: false
   */
  topSeparator?: boolean
  /**
   * Whether to show the bottom separator.
   * Default: false
   */
  bottomSeparator?: boolean
  /**
   * Text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"]
  /**
   * Children components.
   */
  children?: TextProps["children"]
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * Optional text style override.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the Text component.
   */
  TextProps?: TextProps
  /**
   * Optional View container style override.
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * Optional TouchableOpacity style override.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional tint color for the left icon
   */
  leftIconColor?: string
  /**
   * An optional tint color for the right icon
   */
  rightIconColor?: string
  /**
   * Right action custom ReactElement.
   * Overrides `rightIcon`.
   */
  RightComponent?: ReactElement
  /**
   * Left action custom ReactElement.
   * Overrides `leftIcon`.
   */
  LeftComponent?: ReactElement
}

interface ListItemActionProps {
  iconColor?: string
  Component?: ReactElement
  size: number
  side: "left" | "right"
}

/**
 * A styled row component that can be used in FlatList, SectionList, or by itself.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-ListItem.md)
 */
export function ListItem(props: ListItemProps) {
  const {
    bottomSeparator,
    children,
    height = 56,
    LeftComponent,
    leftIconColor,
    RightComponent,
    rightIconColor,
    style,
    text,
    TextProps,
    topSeparator,
    tx,
    txOptions,
    textStyle: $textStyleOverride,
    containerStyle: $containerStyleOverride,
    ...TouchableOpacityProps
  } = props

  const $textStyles = [$textStyle, $textStyleOverride, TextProps?.style]

  const $containerStyles = [
    topSeparator && $separatorTop,
    bottomSeparator && $separatorBottom,
    $containerStyleOverride,
  ]

  const $touchableStyles = [$touchableStyle, { minHeight: height }, style]

  return (
    <View style={$containerStyles}>
      <TouchableOpacity {...TouchableOpacityProps} style={$touchableStyles}>
        <ListItemAction
          side="left"
          size={height}
          iconColor={leftIconColor}
          Component={LeftComponent}
        />

        <Text {...TextProps} tx={tx} text={text} txOptions={txOptions} style={$textStyles}>
          {children}
        </Text>

        <ListItemAction
          side="right"
          size={height}
          iconColor={rightIconColor}
          Component={RightComponent}
        />
      </TouchableOpacity>
    </View>
  )
}

function ListItemAction(props: ListItemActionProps) {
  const { Component, iconColor, size, side } = props

  const $iconContainerStyles = [$iconContainer]

  if (Component) return Component

  return null
}

const $separatorTop: ViewStyle = {
  borderTopWidth: 1,
  borderTopColor: "#D7CEC9",
}

const $separatorBottom: ViewStyle = {
  borderBottomWidth: 1,
  borderBottomColor: "#D7CEC9",
}

const $textStyle: TextStyle = {
  paddingVertical: 8,
  alignSelf: "center",
  flexGrow: 1,
  flexShrink: 1,
}

const $touchableStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
}

const $iconContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  flexGrow: 0,
}
const $iconContainerLeft: ViewStyle = {
  marginEnd: 16,
}

const $iconContainerRight: ViewStyle = {
  marginStart: 16,
}
