import type { ElectrobunConfig } from "electrobun"

export default {
  app: {
    name: "open-book-shelf",
    identifier: "com.electrobun.open-book-shelf",
    version: "0.1.4",
  },
  build: {
    mainProcess: "bun",
    bun: {
      entrypoint: "src-electrobun/index.ts",
    },
    views: {
      preload: {
        entrypoint: "src-electrobun/preload.ts",
      },
    },
  },
} satisfies ElectrobunConfig
