import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      {
        // storybookTest() は .storybook/web の Vite 設定（viteFinal の rnw / tsconfigPaths）を
        // マージし、test.include を stories glob から生成する。実ブラウザ必須（8.6 系の
        // experimental-addon-test は @vitest/browser/context に依存するため jsdom 不可）。
        plugins: [storybookTest({ configDir: ".storybook/web" })],
        // 実行中に Vite が新規依存を最適化すると full reload が走り、
        // "Vitest failed to find the runner" でテストファイルごと落ちる。事前に宣言する。
        optimizeDeps: {
          include: [
            "@storybook/react",
            "@storybook/experimental-addon-test/preview",
            "@storybook/theming",
            "reactotron-core-client",
            "reactotron-mst",
            "reactotron-react-js",
          ],
        },
        test: {
          name: "storybook",
          // storybookTest() は test.setupFiles が文字列のときだけ自前の setup と連結する
          // （配列だと黙って捨てられる）。
          setupFiles: "./test/storybook/setup.ts",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium", headless: true }],
          },
        },
      },
      {
        // test/setup.ts は bun 専用 preload（react-native や gluestack を文字列に置換する）なので
        // 実 DOM 前提の storybook プロジェクトには絶対に読み込ませない。Phase 4 で bun:test の
        // ユニットテストをここへ移す。
        // include が vitest/ 配下なのは、bun run test:unit の glob（find app test -name '*.test.ts'）
        // に拾われないため。Phase 4 でランナーを切り替えた後は app/ test/ へ戻す。
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["vitest/unit/**/*.test.@(ts|tsx)"],
          passWithNoTests: true,
        },
      },
    ],
  },
})
