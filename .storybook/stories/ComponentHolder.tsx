import { Box } from "@/components"
import { Platform } from "react-native"
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
  return (
    <GluestackUIProvider config={config}>
      <Box
        {...props}
        flex={1}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
        marginTop={2}
        marginLeft={2}
      >
        {props.children}
        {Platform.OS === "web" && props.markdown ? (
          <Markdown>{props.markdown}</Markdown>
        ) : undefined}
      </Box>
    </GluestackUIProvider>
  )
}
