/**
 * Web 開発をコマンド1つで起動する。
 *
 *   bun run dev:web               # Calibre プロキシ + Expo Web（Metro）
 *   bun run dev:web --debug       # EXPO_PUBLIC_LOG_LEVEL=debug
 *   bun run dev:web --perf        # EXPO_PUBLIC_PERF_LOG=search（--perf=all でモード指定）
 *
 * Calibre プロキシ（127.0.0.1）と Expo Web（Metro）を起動し、
 * プロキシの実ポートを EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN として Metro に渡す。
 */
import { startCalibreProxyDevServer } from "./calibreProxyDevServer"
import { parseDevFlags } from "./devFlags"
import { startLogSink } from "./logSink"

const preferredPort = Number(process.env.CALIBRE_PROXY_PORT ?? 8082)
const expoArgs = process.argv.slice(2)
const flags = parseDevFlags(expoArgs)

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

// ブラウザのログを logs/web.ndjson に落とす受け口。既に単体起動していればそれを使う。
function startSink() {
  try {
    const sink = startLogSink()
    console.log(`Log sink: ${sink.url} -> ${sink.logDir}`)
    return sink
  } catch (error) {
    console.warn(
      `Log sink: port unavailable (${
        error instanceof Error ? error.message : String(error)
      }). Existing sink, if any, will be used.`,
    )
    return undefined
  }
}

const sink = startSink()

const expo = Bun.spawn([process.execPath, "x", "expo", "start", "--web", ...expoArgs], {
  env: {
    ...process.env,
    EXPO_PUBLIC_CALIBRE_PROXY_ORIGIN: proxyOrigin,
    ...(flags.logLevel ? { EXPO_PUBLIC_LOG_LEVEL: flags.logLevel } : {}),
    ...(flags.perfMode ? { EXPO_PUBLIC_PERF_LOG: flags.perfMode } : {}),
  },
  stdio: ["inherit", "inherit", "inherit"],
})

let stopping = false
const shutdown = (code: number) => {
  if (stopping) return
  stopping = true
  proxy.stop(true)
  sink?.stop(true)
  expo.kill()
  process.exit(code)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const exitCode = await expo.exited
proxy.stop(true)
sink?.stop(true)
process.exit(exitCode ?? 0)
