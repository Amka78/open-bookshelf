import { Center, Spinner } from "@gluestack-ui/themed"
import { type FlashListProps, FlashList as Origin } from "@shopify/flash-list"
import React, { useState } from "react"
import { LabeledSpinner } from "../LabeledSpinner/LabeledSpinner"

export type FlatListProps<T> = FlashListProps<T> & {
  preparing?: boolean
}

type FlatListRef = React.ElementRef<typeof Origin>
type FlatListComponent = <T>(
  props: FlatListProps<T> & { ref?: React.Ref<FlatListRef> },
) => React.JSX.Element

export const FlatList = React.forwardRef(function FlatListInner<T>(
  { preparing = false, ...restProps }: FlatListProps<T>,
  ref: React.ForwardedRef<FlatListRef>,
) {
  const props = { preparing, ...restProps }
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  return !preparing ? (
    <Origin
      {...props}
      ref={ref}
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
}) as FlatListComponent
