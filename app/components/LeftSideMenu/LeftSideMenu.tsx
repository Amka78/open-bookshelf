import { Category } from "@/models/CalibreRootStore"
import React from "react"
import { ScrollView } from "native-base"

import { LeftSideMenuItem } from "../LeftSideMenuItem/LeftSideMenuItem"

export type LeftSideMenuProps = {
  tagBrowser: Category[]
  selectedName?: string
  onNodePress: (nodeName: string) => Promise<void>
}

export function LeftSideMenu(props: LeftSideMenuProps) {
  return (
    <ScrollView backgroundColor={"white"} maxWidth={"32"}>
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
  )
}
