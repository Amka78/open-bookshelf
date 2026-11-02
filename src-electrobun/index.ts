import { existsSync, readFileSync, statSync } from "node:fs"
import { join, normalize, sep } from "node:path"
import { BrowserView, BrowserWindow, Updater, Utils } from "electrobun/bun"
import type { AppRPCType } from "./shared/rpcTypes"

const bundledWebRoot = join(import.meta.dir, "..", "views", "app")

// Electrobun 2.0.5 の Linux では preload に views:// URL を渡しても実行されないため、
// ビルド済みの preload バンドルを読み込んでインライン JavaScript として渡す。
const preloadScript = readFileSync(
  join(import.meta.dir, "..", "views", "preload", "index.js"),
  "utf8",
)

// dist/index.html は /_expo/... の絶対パスを参照するため views:// では解決できない。
// 同梱した Web バンドルを 127.0.0.1 で配信して読み込む。
function startBundledWebServer(): string {
  const indexPath = join(bundledWebRoot, "index.html")
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      const { pathname } = new URL(request.url)
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
  return `http://127.0.0.1:${server.port}/`
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
    },
    messages: {},
  },
})

// ELECTROBUN_WEB_URL は開発時のみ設定する（bun run desktop）。未設定なら同梱バンドルを配信する。
const devServerUrl = process.env.ELECTROBUN_WEB_URL

new BrowserWindow({
  title: "Open BookShelf",
  frame: {
    width: 1200,
    height: 800,
  },
  url: devServerUrl ?? startBundledWebServer(),
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
