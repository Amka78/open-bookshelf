import { usePalette } from "@/theme"
import { observer } from "mobx-react-lite"

import { Box } from "@/components"
import { LeftSideMenuContent, type LeftSideMenuContentProps } from "./LeftSideMenuContent"

export type {
  CalibreFieldOperator,
  QueryOperator,
} from "./leftSideMenuQuery"
export {
  buildItemKey,
  buildTagQuery,
  nextCalibreOperator,
  normalizeCategoryKey,
  normalizeTagQuery,
  parseTagQuery,
} from "./leftSideMenuQuery"

/** デスクトップのサイドバー幅。$48(192px) では日本語のカテゴリ名が窮屈だったため広げた。 */
export const LEFT_SIDE_MENU_WIDTH = 240

export type LeftSideMenuProps = LeftSideMenuContentProps

/**
 * 大画面用のサイドバー容器。内容は LeftSideMenuContent を参照し、
 * ここでは幅・背景・右境界線だけを持つ。
 */
export const LeftSideMenu = observer((props: LeftSideMenuProps) => {
  const palette = usePalette()

  if (!props.tagBrowser) {
    return null
  }

  return (
    <Box
      width={LEFT_SIDE_MENU_WIDTH}
      flexShrink={0}
      height={"$full"}
      backgroundColor={palette.surface}
      borderRightWidth={1}
      borderRightColor={palette.borderSubtle}
    >
      <LeftSideMenuContent {...props} />
    </Box>
  )
})

/**
 * モバイル用の全画面容器。サイドバーと違い幅を固定せず、
 * 背景だけを持たせる（境界線は不要）。
 */
export const LeftSideMenuScreen = observer((props: LeftSideMenuProps) => {
  const palette = usePalette()

  if (!props.tagBrowser) {
    return null
  }

  return (
    <Box flex={1} width={"$full"} backgroundColor={palette.surface}>
      <LeftSideMenuContent {...props} />
    </Box>
  )
})
