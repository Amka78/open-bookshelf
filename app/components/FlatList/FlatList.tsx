import React from "react"
import { FlashList, FlashListProps } from "@shopify/flash-list"

export type FlatListProps = FlashListProps
export function FlatList(props: FlatListProps) {
  return <FlashList {...props} />
}
