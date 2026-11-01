import { ConnectContent, Heading, RootContainer, Text, VStack } from "@/components"
import { useConnect } from "@/hooks"
import { observer } from "mobx-react-lite"
import React, { type FC } from "react"

export const ConnectScreen: FC = observer(() => {
  const { form, baseUrl, onConnectPress } = useConnect()

  return (
    <RootContainer>
      <VStack flex={1} space="md">
        <Heading testID="connect-heading" tx="connectScreen.welcome" />
        <Text tx="connectScreen.detail" />
        <ConnectContent
          control={form.control}
          baseUrl={baseUrl}
          onSubmit={form.handleSubmit(onConnectPress)}
          submitDisabled={!form.formState.isValid}
        />
      </VStack>
    </RootContainer>
  )
})
