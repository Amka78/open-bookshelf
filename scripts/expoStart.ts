/**
 * ネイティブ開発サーバーの起動（Expo Go 既定、dev-client / debug / perf はフラグで指定）。
 *
 *   bun run start               # Expo Go（JS のみの開発）
 *   bun run start --dev-client  # 開発クライアント
 *   bun run start --debug       # EXPO_PUBLIC_LOG_LEVEL=debug
 *   bun run start --perf        # EXPO_PUBLIC_PERF_LOG=search（--perf=all でモード指定）
 *   bun run start --android     # 上記以外の引数は expo start へそのまま渡る
 */
import { parseDevFlags } from "./devFlags"

const expoArgs = process.argv.slice(2)
const flags = parseDevFlags(expoArgs)

const expo = Bun.spawn(
  [
    process.execPath,
    "x",
    "expo",
    "start",
    ...(flags.devClient ? ["--dev-client"] : []),
    ...expoArgs,
  ],
  {
    env: {
      ...process.env,
      USE_EXPO_GO: flags.devClient ? "false" : "true",
      ...(flags.logLevel ? { EXPO_PUBLIC_LOG_LEVEL: flags.logLevel } : {}),
      ...(flags.perfMode ? { EXPO_PUBLIC_PERF_LOG: flags.perfMode } : {}),
    },
    stdio: ["inherit", "inherit", "inherit"],
  },
)

let stopping = false
const shutdown = (code: number) => {
  if (stopping) return
  stopping = true
  expo.kill()
  process.exit(code)
}
process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const exitCode = await expo.exited
process.exit(exitCode ?? 0)
