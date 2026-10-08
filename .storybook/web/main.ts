import type { StorybookConfig } from "@storybook/react-vite"
import { rnw } from "vite-plugin-rnw"
import tsconfigPaths from "vite-tsconfig-paths"

const config: StorybookConfig = {
  typescript: { reactDocgen: false },
  stories: [
    "../../app/components/**/*.stories.?(ts|tsx|js|jsx)",
    "../../app/screens/**/*.stories.?(ts|tsx|js|jsx)",
    "../stories/**/*.stories.?(ts|tsx|js|jsx)",
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "storybook-dark-mode"],
  viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tsconfigPaths(), ...rnw()]

    return viteConfig
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
}

export default config
