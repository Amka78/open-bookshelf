import React from "react"
import { Box } from "@/components"
import { NativeBaseProvider } from "native-base"
import { background } from "native-base/lib/typescript/theme/styled-system"
export type ComponentHolderProps = {
  children: React.ReactNode
}
export function ComponentHolder(props: ComponentHolderProps) {
  return (
    <NativeBaseProvider>
      <Box
        flex={1}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
        marginTop={2}
        marginLeft={2}
        _light={{
          backgroundColor: "white",
        }}
        _dark={{
          backgroundColor: "black",
        }}
      >
        {props.children}
      </Box>
    </NativeBaseProvider>
  )
}
