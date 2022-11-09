import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState } from "react"

import { Button, Heading, RootContainer, Text, Flex, Input } from "../../components"
import { useStores } from "../../models"
import { AppStackScreenProps } from "../../navigators"
import { Box } from "native-base"


interface ConnectScreenProps extends AppStackScreenProps<"Login"> {}

export const ConnectScreen: FC<ConnectScreenProps> = observer((_props) => {
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const {
    authenticationStore: {
      authEmail,
      setAuthEmail,
      setAuthPassword,
      setAuthToken,
      validationErrors,
    },
  } = useStores()

  useEffect(() => {
    // Here is where you could fetch credientials from keychain or storage
    // and pre-fill the form fields.
    setAuthEmail("ignite@infinite.red")
    setAuthPassword("ign1teIsAwes0m3")
  }, [])


  function login() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (Object.values(validationErrors).some((v) => !!v)) return

    // Make a request to your server to get an authentication token.
    // If successful, reset the fields and set the token.
    setIsSubmitted(false)
    setAuthPassword("")
    setAuthEmail("")

    // We'll mock this with a fake token.
    setAuthToken(String(Date.now()))
  }

  useEffect(() => {
    return () => {
      setAuthPassword("")
      setAuthEmail("")
    }
  }, [])

  return <RootContainer>
    <Flex justify={"space-between"} flex={"1"}>
      <Box flex={"1"} >
      <Heading testID="connect-heading" tx="connectScreen.welcome" />
      <Text tx="connectScreen.detail" marginTop={"5"} />
      <Box marginTop={"7"}>
      <Input variant={"underlined"} placeholderTx={"connectScreen.placeHolder"} size="lg" />
      </Box>
      </Box>
      <Flex flex={"1"} justify={"flex-end"}>
      <Button
        testID="connect-button"
        tx="connectScreen.connect"
        onPress={login}
        width={"full"}
      /> 
      </Flex>
      </Flex>
    </RootContainer>  
})

