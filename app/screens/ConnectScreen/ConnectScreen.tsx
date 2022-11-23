import { observer } from "mobx-react-lite"
import { Box } from "native-base"
import React, { FC } from "react"
import { useForm } from "react-hook-form"

import { Button, Flex, FormInput, Heading, RootContainer, Text } from "../../components"
import { useStores } from "../../models"
import { ConnectType } from "./types/ConnectType"

export const ConnectScreen: FC = observer(() => {
  const form = useForm<ConnectType>()
  const { settingStore, opdsRootStore } = useStores()

  return (
    <RootContainer>
      <Flex justify={"space-between"} flex={"1"}>
        <Box flex={"1"}>
          <Heading testID="connect-heading" tx="connectScreen.welcome" />
          <Text tx="connectScreen.detail" marginTop={"5"} />
          <Box marginTop={"7"}>
            <FormInput
              control={form.control}
              defaultValue={settingStore.baseUrl}
              placeholderTx={"connectScreen.placeHolder"}
              rules={{ required: true }}
              name={"url"}
            />
          </Box>
        </Box>
        <Flex flex={"1"} justify={"flex-end"}>
          <Button
            disabled={!form.formState.isValid}
            testID="connect-button"
            tx="connectScreen.connect"
            onPress={form.handleSubmit(async (data) => {
              settingStore.setUrl(data.url)
            })}
            width={"full"}
          />
        </Flex>
      </Flex>
    </RootContainer>
  )
})
