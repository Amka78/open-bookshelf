import { Box } from "@/components"
import { useWindowDimensions } from "react-native"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { config } from "@gluestack-ui/config"
import { ComponentProps } from "react"
import { createModalStack, ModalProvider } from "react-native-modalfy"
import { modalConfig } from "@/components/Modals/ModalConfigTest"

export type ComponentHolderProps = {
  children: React.ReactNode
  markdown?: string
} & ComponentProps<typeof Box>
export function ComponentHolder({ alignItems = "flex-start", justifyContent = "flex-start", ...restProps }: ComponentHolderProps) {

  const props = { alignItems, justifyContent, ...restProps }

  const { useDarkMode } = require("storybook-dark-mode")

  const dimension = useWindowDimensions()

  const colorMode = useDarkMode() ? "dark" : "light"
  const stack = createModalStack(modalConfig, {})

  return (
    <GluestackUIProvider config={config} colorMode={colorMode}>
      <ModalProvider stack={stack}>
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
      </ModalProvider>
    </GluestackUIProvider >
  )
}
