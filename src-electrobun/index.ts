import { readFileSync } from "node:fs"
import { join } from "node:path"
import { BrowserView, BrowserWindow, Utils } from "electrobun/bun"
import type { AppRPCType } from "./shared/rpcTypes"

const isDev = process.env.NODE_ENV !== "production"

// Electrobun 2.0.5 の Linux では preload に views:// URL を渡しても実行されないため、
// ビルド済みの preload バンドルを読み込んでインライン JavaScript として渡す。
const preloadScript = readFileSync(
  join(import.meta.dir, "..", "views", "preload", "index.js"),
  "utf8",
)

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

const win = new BrowserWindow({
  title: "Open BookShelf",
  frame: {
    width: 1200,
    height: 800,
  },
  url: isDev ? "http://localhost:8081" : "views://app/index.html",
  preload: preloadScript,
  rpc,
})
