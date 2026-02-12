import { HStack, IconButton, Text } from "@/components"
import { usePalette } from "@/theme"
import { ViewerMenu, type ViewerMenuProps } from "../ViewerMenu/ViewerMenu"

export type ViewerHeaderProps = ViewerMenuProps & {
  visible: boolean
  onLeftArrowPress?: () => void
  title: string
}

export function ViewerHeader(props: ViewerHeaderProps) {
  const palette = usePalette()
  return props.visible ? (
    <HStack
      height={50}
      backgroundColor={palette.surfaceStrong}
      position={"absolute"}
      top={0}
      left={0}
      right={0}
      zIndex={1}
      style={{ borderBottomWidth: 1, borderBottomColor: palette.borderSubtle }}
    >
      <HStack flex={1} justifyContent={"flex-start"} marginLeft={"$4"}>
        <IconButton name="arrow-left" onPress={props.onLeftArrowPress} iconSize="md-" />
        <Text marginLeft={"$3"} fontSize={"$lg"} isTruncated={true} color={palette.textPrimary}>
          {props.title}
        </Text>
      </HStack>
      <HStack justifyContent={"flex-end"} marginRight={"$4"}>
        <ViewerMenu
          pageDirection={props.pageDirection}
          readingStyle={props.readingStyle}
          onSelectReadingStyle={props.onSelectReadingStyle}
          onSelectPageDirection={props.onSelectPageDirection}
        />
      </HStack>
    </HStack>
  ) : null
}
