import type { ElectrobunConfig } from "electrobun"

export default {
  app: {
    name: "shoin",
    identifier: "com.electrobun.shoin",
    version: "0.1.7",
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
    // アイコンは `bun run icons` が scripts/buildIcons.ts から生成する
    mac: {
      // iconutil が .iconset を .icns に変換する（macOS ランナーのみ）
      icons: "assets/icons/icon.iconset",
    },
    win: {
      // Hutch が PNG/ICO をインストーラ・ショートカット・タスクバー用に使う
      icon: "assets/icons/icon.ico",
    },
    linux: {
      // デスクトップエントリ・ウィンドウ・タスクバー用
      icon: "assets/icons/icon.png",
    },
  },
  release: {
    // canary は手動 CI と v* タグ CI の両方がこの固定タグ Release に成果物を上書きする
    baseUrl: "https://github.com/Amka78/shoin/releases/download/desktop-canary",
    generatePatch: true,
  },
} satisfies ElectrobunConfig
