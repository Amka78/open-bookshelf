import { Box } from "@/components"
import { Platform } from "react-native"
import { Markdown } from "@storybook/blocks"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
export type ComponentHolderProps = {
  children: React.ReactNode
  markdown?: string
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
      >
        {props.children}
        {Platform.OS === "web" && props.markdown ? (
          <Markdown>{props.markdown}</Markdown>
        ) : undefined}
      </Box>
    </GluestackUIProvider>
  )
}
