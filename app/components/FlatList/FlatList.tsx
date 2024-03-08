import { Center, Spinner } from "@gluestack-ui/themed"
import { type FlashListProps, FlashList as Origin } from "@shopify/flash-list"
import React, { useState } from "react"
import { LabeledSpinner } from "../LabeledSpinner/LabeledSpinner"

export type FlatListProps<T> = FlashListProps<T> & {
  preparing?: boolean
}
export function FlatList<T>({ preparing = false, ...restProps }: FlatListProps<T>) {
  const props = { preparing, ...restProps }
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  return !preparing ? (
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
  ) : (
    <Center flex={1}>
      <LabeledSpinner labelDirection="vertical" labelTx={"libraryScreen.dataSearching"} />
    </Center>
  )
}
