import { HStack, IconButton, Text, TooltipIconButton } from "@/components"
import { usePalette } from "@/theme"
import { ViewerMenu, type ViewerMenuProps } from "../ViewerMenu/ViewerMenu"

export type ViewerHeaderProps = ViewerMenuProps & {
  visible: boolean
  onLeftArrowPress?: () => void
  title: string
  autoPageTurning: boolean
  onToggleAutoPageTurning?: () => void
}

export function ViewerHeader(props: ViewerHeaderProps) {
  const palette = usePalette()

  return props.visible ? (
    <>
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
          <Text
            testID="viewer-header-title"
            marginLeft={"$3"}
            fontSize={"$lg"}
            isTruncated={true}
            color={palette.textPrimary}
          >
            {props.title}
          </Text>
        </HStack>
        <HStack justifyContent={"flex-end"} marginRight={"$4"}>
          {props.onShowToc ? (
            <TooltipIconButton
              name="table-of-contents"
              iconSize="md-"
              testID="viewer-toc-button"
              tooltipTx="toc.title"
              onPress={props.onShowToc}
            />
          ) : null}
          {props.onAddBookmark ? (
            <TooltipIconButton
              name="bookmark-plus-outline"
              iconSize="md-"
              testID="viewer-bookmark-button"
              tooltipTx="viewerMenu.addBookmark"
              onPress={props.onAddBookmark}
            />
          ) : null}
          <ViewerMenu
            pageDirection={props.pageDirection}
            readingStyle={props.readingStyle}
            onSelectReadingStyle={props.onSelectReadingStyle}
            onSelectPageDirection={props.onSelectPageDirection}
            onSelectCurrentPageAsCover={props.onSelectCurrentPageAsCover}
            onSelectLeftPageAsCover={props.onSelectLeftPageAsCover}
            onSelectRightPageAsCover={props.onSelectRightPageAsCover}
            autoPageTurning={props.autoPageTurning}
            onToggleAutoPageTurning={props.onToggleAutoPageTurning}
            onToggleAnnotationPanel={props.onToggleAnnotationPanel}
            onShowReadingSettings={props.onShowReadingSettings}
          />
        </HStack>
      </HStack>
    </>
  ) : null
}
