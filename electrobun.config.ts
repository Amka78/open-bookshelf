import type { ElectrobunConfig } from "electrobun"

export default {
  app: {
    name: "open-book-shelf",
    identifier: "com.electrobun.open-book-shelf",
    version: "0.0.1",
  },
  build: {
    bun: {
      entrypoint: "src-electrobun/main.ts",
    },
    views: {
      preload: {
        entrypoint: "src-electrobun/preload.ts",
      },
    },
  },
} satisfies ElectrobunConfig
