import type { ModalStackParams } from "@/components/Modals/Types"
import { useModal } from "react-native-modalfy"

/**
 * デスクトップ（Electrobun）でもネイティブダイアログは使わず、modalfy の Web モーダルで表示する。
 *
 * Electrobun 2.0.5 の `Utils.showMessageBox` は UI スレッドへ同期ディスパッチする。
 * WebView からの RPC ハンドラ内で呼ぶとダイアログが出ないまま RPC がタイムアウトし、
 * `showNativeConfirm` の then/catch が呼ばれない。再開確認でこれが起きると
 * `viewerReady` が false のままになり、ビューアが黒画面で固まる（2026-11-07 に実機で確認）。
 *
 * ネイティブダイアログ用の bridge（`electrobunBridge` / preload の RPC）は、
 * Electrobun 側が修正されたときに戻せるよう残している。
 */
export function useElectrobunModal() {
  return useModal<ModalStackParams>()
}
