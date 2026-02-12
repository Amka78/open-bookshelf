import type { Category } from "@/models/calibre"
import { usePalette } from "@/theme"
import { ScrollView } from "@gluestack-ui/themed"
import React from "react"

import { observer } from "mobx-react-lite"
import { LeftSideMenuItem } from "../LeftSideMenuItem/LeftSideMenuItem"

export type LeftSideMenuProps = {
  tagBrowser: Category[]
  selectedName?: string
  onNodePress: (nodeName: string) => Promise<void>
}

export const LeftSideMenu = observer((props: LeftSideMenuProps) => {
  const palette = usePalette()
  return props.tagBrowser ? (
    <ScrollView
      backgroundColor={palette.surface}
      maxWidth={"$32"}
      height={"$full"}
      borderRightWidth={1}
      borderRightColor={palette.borderSubtle}
    >
      {props.tagBrowser.map((category) => {
        return (
          <LeftSideMenuItem name={category.name} count={category.count} key={category.name}>
            {category.subCategory.map((subCategory) => {
              return (
                <LeftSideMenuItem
                  mode={"subCategory"}
                  count={subCategory.count}
                  name={subCategory.name}
                  key={subCategory.name}
                  onLastNodePress={async () => {
                    await props.onNodePress(subCategory.name)
                  }}
                  selected={subCategory.name === props.selectedName}
                >
                  {subCategory.children.map((node) => {
                    return (
                      <LeftSideMenuItem
                        mode={"node"}
                        count={node.count}
                        name={node.name}
                        key={node.name}
                        onLastNodePress={async () => {
                          await props.onNodePress(category.name)
                        }}
                        selected={node.name === props.selectedName}
                      />
                    )
                  })}
                </LeftSideMenuItem>
              )
            })}
          </LeftSideMenuItem>
        )
      })}
    </ScrollView>
  ) : undefined
})
