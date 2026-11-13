import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs"
import { join, normalize, sep } from "node:path"
import { BrowserView, BrowserWindow, Updater, Utils } from "electrobun/bun"
import { DEFAULT_LOG_SINK_PORT, startLogSink } from "../scripts/logSink"
import {
  CALIBRE_PROXY_PREFIX,
  buildCorsHeaders,
  proxyCalibreRequest,
  resolveCalibreTarget,
} from "./calibreProxy"
import type { AppRPCType } from "./shared/rpcTypes"

const bundledWebRoot = join(import.meta.dir, "..", "views", "app")

// dist/index.html は /_expo/... の絶対パスを参照するため views:// では解決できない。
// 同梱した Web バンドルを 127.0.0.1 で配信し、同じサーバーで Calibre プロキシも提供する。
function startLocalServer(): { origin: string; appUrl: string } {
  const indexPath = join(bundledWebRoot, "index.html")
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const target = resolveCalibreTarget(request.url)
      if (target) {
        return proxyCalibreRequest(request, target)
      }

      const { pathname } = new URL(request.url)
      if (pathname.startsWith(CALIBRE_PROXY_PREFIX)) {
        return new Response("Not a Calibre proxy request", {
          status: 404,
          headers: buildCorsHeaders(request),
        })
      }

      const filePath = normalize(join(bundledWebRoot, decodeURIComponent(pathname)))
      if (
        filePath.startsWith(bundledWebRoot + sep) &&
        existsSync(filePath) &&
        statSync(filePath).isFile()
      ) {
        return new Response(Bun.file(filePath))
      }
      return new Response(Bun.file(indexPath))
    },
  })

  const origin = `http://127.0.0.1:${server.port}`
  return { origin, appUrl: `${origin}/` }
}

const localServer = startLocalServer()

// ELECTROBUN_WEB_URL は開発時のみ設定する（bun run desktop）。未設定なら同梱バンドルを配信する。
const devServerUrl = process.env.ELECTROBUN_WEB_URL

// 開発時はブラウザ側のログを logs/electrobun.ndjson に落とす。
// ポートが埋まっている（dev:web が起動済みなど）場合は既存の受け口に相乗りする。
const logSinkUrl = devServerUrl
  ? (() => {
      try {
        return startLogSink({ echo: true }).url
      } catch {
        return `http://127.0.0.1:${DEFAULT_LOG_SINK_PORT}`
      }
    })()
  : ""

// Electrobun 2.0.5 の Linux では preload に views:// URL を渡しても実行されないため、
// ビルド済みの preload バンドルを読み込んでインライン JavaScript として渡す。
// プロキシのポートは起動ごとに変わるので、preload の先頭で注入する。
const preloadScript = `window.__ELECTROBUN_PROXY_ORIGIN = ${JSON.stringify(localServer.origin)};
window.__LOG_SINK_URL = ${JSON.stringify(logSinkUrl)};
${readFileSync(join(import.meta.dir, "..", "views", "preload", "index.js"), "utf8")}`

// WebView の localStorage はランダムポート由来の origin 単位なので起動をまたいで
// 共有できない。アプリ状態（接続設定・選択ライブラリ・ナビゲーションなど）は
// ユーザーデータ領域のファイルにキー単位で保存する。
const storageRoot = join(Utils.paths.appData, "com.electrobun.shoin", "storage")
mkdirSync(storageRoot, { recursive: true })

function storageFilePath(key: string): string {
  const safeKey = key.replace(/[^a-zA-Z0-9._-]/g, "_")
  return join(storageRoot, `${safeKey}.json`)
}

async function storageRead(key: string): Promise<string | null> {
  const filePath = storageFilePath(key)
  try {
    if (!existsSync(filePath)) return null
    return readFileSync(filePath, "utf8")
  } catch (error) {
    console.error("[electrobun] storage read failed", key, error)
    return null
  }
}

async function storageWrite(key: string, value: string): Promise<void> {
  try {
    await Bun.write(storageFilePath(key), value)
  } catch (error) {
    // 状態保存の失敗は致命的ではないが、次回起動時に設定が再開されなくなる
    // ため握りつぶさずログへ残す。
    console.error("[electrobun] storage write failed", key, error)
  }
}

const rpc = BrowserView.defineRPC<AppRPCType>({
  maxRequestTime: 10000,
  handlers: {
    requests: {
      showNativeConfirm: async ({ title, message, okLabel, cancelLabel }) => {
        const { response } = await Utils.showMessageBox({
          type: "question",
          title,
          message,
          detail: message,
          buttons: [okLabel, cancelLabel],
          defaultId: 0,
          cancelId: 1,
        })
        return response === 0
      },
      showNativeError: async ({ title, message }) => {
        await Utils.showMessageBox({
          type: "error",
          title,
          message,
          buttons: ["OK"],
        })
      },
      storageGet: async ({ key }) => {
        return { value: await storageRead(key) }
      },
      storageSet: async ({ key, value }) => {
        await storageWrite(key, value)
      },
      storageRemove: async ({ key }) => {
        try {
          rmSync(storageFilePath(key), { force: true })
        } catch (error) {
          console.error("[electrobun] storage remove failed", key, error)
        }
      },
      storageClear: async () => {
        try {
          rmSync(storageRoot, { recursive: true, force: true })
          mkdirSync(storageRoot, { recursive: true })
        } catch (error) {
          console.error("[electrobun] storage clear failed", error)
        }
      },
    },
    messages: {},
  },
})

new BrowserWindow({
  title: "Shoin",
  frame: {
    width: 1200,
    height: 800,
  },
  url: devServerUrl ?? localServer.appUrl,
  preload: preloadScript,
  rpc,
})

async function checkForUpdates(): Promise<void> {
  try {
    const localInfo = await Updater.getLocalInfo()
    if (devServerUrl || !localInfo.baseUrl || localInfo.channel === "dev") {
      return
    }

    const update = await Updater.checkForUpdate()
    if (!update.updateAvailable) return

    const { response } = await Utils.showMessageBox({
      type: "question",
      title: "アップデートがあります",
      message: `新しいバージョン ${update.version} を利用できます。`,
      detail: "今すぐ更新して再起動しますか？",
      buttons: ["更新する", "後で"],
      defaultId: 0,
      cancelId: 1,
    })
    if (response !== 0) return

    await Updater.downloadUpdate()
    await Updater.applyUpdate()
  } catch (error) {
    console.error("Update check failed", error)
  }
}

void checkForUpdates()
