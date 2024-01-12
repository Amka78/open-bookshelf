import { Box } from "@/components"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import React from "react"
import { config } from "@gluestack-ui/config"

export type ComponentHolderProps = {
  children: React.ReactNode
}
export function ComponentHolder(props: ComponentHolderProps) {
  return (
    <GluestackUIProvider config={config}>
      <Box
        flex={1}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
        marginTop={2}
        marginLeft={2}
        $light-bgColor="white"
        $dark-bgColor="black"
      >
        {props.children}
      </Box>
    </GluestackUIProvider>
  )
}
