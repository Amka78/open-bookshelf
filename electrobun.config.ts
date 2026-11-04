import type { ElectrobunConfig } from "electrobun"

export default {
  app: {
    name: "open-book-shelf",
    identifier: "com.electrobun.open-book-shelf",
    version: "0.1.5",
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
    // 本番は Expo Web の書き出し（dist）を同梱し、Bun 側のローカルサーバーで配信する
    copy: {
      dist: "views/app",
    },
  },
  release: {
    // canary は手動 CI と v* タグ CI の両方がこの固定タグ Release に成果物を上書きする
    baseUrl: "https://github.com/Amka78/open-bookshelf/releases/download/desktop-canary",
    generatePatch: true,
  },
} satisfies ElectrobunConfig
