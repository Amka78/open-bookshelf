import { FlashList as Origin, FlashListProps } from "@shopify/flash-list"
import { Spinner } from "native-base"
import React, { useState } from "react"

export type FlatListProps<T> = FlashListProps<T>
export function FlatList<T>(props: FlatListProps<T>) {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  return (
    <Origin
      {...props}
      onMomentumScrollBegin={() => {
        setLoading(true)
      }}
      onEndReached={() => {
        setLoading(false)

        if (props.onEndReached) {
          props.onEndReached()
        }
      }}
      onRefresh={() => {
        if (props.onRefresh) {
          setRefreshing(true)
          props.onRefresh()
        }
        setRefreshing(false)
      }}
      refreshing={refreshing}
      ListFooterComponent={loading && <Spinner />}
    />
  )
}
