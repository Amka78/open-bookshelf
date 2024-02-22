import { Box } from "@/components"
import { Platform, useWindowDimensions } from "react-native"
import { Markdown } from "@storybook/blocks"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { ComponentProps } from "react"
export type ComponentHolderProps = {
  children: React.ReactNode
  markdown?: string
} & ComponentProps<typeof Box>
export function ComponentHolder({ alignItems = "flex-start", justifyContent = "flex-start", ...restProps }: ComponentHolderProps) {

  const props = { alignItems, justifyContent, ...restProps }

  const { useDarkMode } = require("storybook-dark-mode")

  const dimension = useWindowDimensions()

  const colorMode = useDarkMode() ? "dark" : "light"

  return (
    <GluestackUIProvider config={config} colorMode={colorMode}>
      <Box
        {...props}
        flex={1}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
        height={dimension.height}
        width={dimension.width}
      >
        {props.children}
      </Box>
    </GluestackUIProvider >
  )
}
