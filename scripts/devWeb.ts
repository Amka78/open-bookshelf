/**
 * Web 開発をコマンド1つで起動する。
 *
 *   bun run dev:web
 *
 * Calibre プロキシ（127.0.0.1）と Expo Web（Metro）を起動し、
 * プロキシの実ポートを EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN として Metro に渡す。
 */
import { startCalibreProxyDevServer } from "./calibreProxyDevServer"

const preferredPort = Number(process.env.CALIBRE_PROXY_PORT ?? 8082)

function startProxy() {
  try {
    return startCalibreProxyDevServer({ port: preferredPort })
  } catch (error) {
    console.warn(
      `Calibre dev proxy: port ${preferredPort} is unavailable (${
        error instanceof Error ? error.message : String(error)
      }). Using a free port.`,
    )
    return startCalibreProxyDevServer({ port: 0 })
  }
}

const proxy = startProxy()
const proxyOrigin = `http://127.0.0.1:${proxy.port}`

console.log(`Calibre dev proxy: ${proxyOrigin}`)

const expo = Bun.spawn(
  [process.execPath, "x", "expo", "start", "--web", ...process.argv.slice(2)],
  {
    env: { ...process.env, EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN: proxyOrigin },
    stdio: ["inherit", "inherit", "inherit"],
  },
)

let stopping = false
const shutdown = (code: number) => {
  if (stopping) return
  stopping = true
  proxy.stop(true)
  expo.kill()
  process.exit(code)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const exitCode = await expo.exited
proxy.stop(true)
process.exit(exitCode ?? 0)
