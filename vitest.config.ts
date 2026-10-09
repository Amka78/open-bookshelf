import { readFileSync } from "node:fs"
import path from "node:path"
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin"
import tsconfigPaths from "vite-tsconfig-paths"
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
        // tsconfigPaths() が無いと "@/..." が解決できず import 解析で失敗する。
        plugins: [tsconfigPaths()],
        // rnw() は入れない（react-native → react-native-web の alias が vi.doMock("react-native")
        // と衝突するため）。expo / react-native が参照する global だけ define する。
        // tsconfig.json は app/**/*.test.tsx を exclude しているため Vite が jsx 設定を読めず、
        // classic transform（React.createElement）に落ちて "React is not defined" になる。
        esbuild: { jsx: "automatic" },
        // vite-tsconfig-paths だけの解決だと vi.doMock("@/...") が実パスのモジュールに一致せず、
        // mock が黙って無視される。Vite ネイティブの alias としても登録する。
        resolve: {
          alias: { "@": path.resolve(process.cwd(), "app") },
        },
        define: {
          __DEV__: "true",
          global: "globalThis",
          _WORKLET_: "false",
          "process.env.NODE_ENV": '"test"',
        },
        test: {
          name: "unit",
          environment: "jsdom",
          // describe / test / expect / vi / beforeEach をグローバル提供する。
          // bun:test 由来の import を持たない（グローバル前提の）テストファイルがあるため。
          globals: true,
          setupFiles: ["./test/vitest-setup.ts"],
          // Phase 4 移行中は「Vitest へ移し終えたファイル」を vitest/migrated.txt で管理する。
          // 全ファイル移行後に app/**・test/** の glob へ置き換えてこのファイルは削除する。
          include: [
            "vitest/unit/**/*.test.@(ts|tsx)",
            ...readFileSync(path.resolve(process.cwd(), "vitest/migrated.txt"), "utf8")
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          ],
          passWithNoTests: true,
        },
      },
    ],
  },
})
