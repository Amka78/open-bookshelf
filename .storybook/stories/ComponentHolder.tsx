import { Box } from "@/components"
import { modalConfig } from "@/components/Modals/ModalConfigTest"
import { getPalette } from "@/theme"
import { config } from "@gluestack-ui/config"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import type { ComponentProps, ComponentType } from "react"
import { useWindowDimensions } from "react-native"
import { ModalProvider, createModalStack } from "react-native-modalfy"
import { SafeAreaProvider } from "react-native-safe-area-context"

export type ComponentHolderProps = {
  children: React.ReactNode
  markdown?: string
} & ComponentProps<typeof Box>
export function ComponentHolder({
  alignItems = "flex-start",
  justifyContent = "flex-start",
  ...restProps
}: ComponentHolderProps) {
  const props = { alignItems, justifyContent, ...restProps }

  const { useDarkMode } = require("storybook-dark-mode")

  const dimension = useWindowDimensions()

  const colorMode = useDarkMode() ? "dark" : "light"
  const palette = getPalette(colorMode)
  const stack = createModalStack(modalConfig, {})

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config} colorMode={colorMode}>
        <ModalProvider stack={stack}>
          <Box
            {...props}
            flex={1}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            height={dimension.height}
            width={dimension.width}
            backgroundColor={palette.bg0}
          >
            {props.children}
          </Box>
        </ModalProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  )
}

// Storybook が decorator に渡す Story は args / context を束縛済みのコンポーネント。
// StoryFn は (args, context) の2引数必須で JSX タグに使えない（TS2786 / TS6229）ため ComponentType にする。
export const withComponentHolder = (Story: ComponentType) => (
  <ComponentHolder>
    <Story />
  </ComponentHolder>
)
