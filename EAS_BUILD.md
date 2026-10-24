# EAS Build（ローカル）トラブルシューティング

Android/iOS のビルドは EAS Build が主力（ビルド方針・リリース手順は [RELEASE.md](./RELEASE.md) 参照）。

## Gradle キャッシュ破損（metadata.bin 読み込みエラー）

**症状:** Gradle フェーズが `Could not read workspace metadata from .../transforms/<hash>/metadata.bin` で失敗する（実測例: `:react-native-webview:generateReleaseLintModel`、2026-10-23）。

**原因:** Gradle daemon がメモリ不足（WSL の ~10GB 環境、Kotlin daemon がビルド後に残存して蓄積）で OOM クラッシュし、transform キャッシュが中途書き込みで破損（metadata.bin が 0バイトになる）。

**対処:**

```sh
# 1. 残存 daemon を停止（Kotlin daemon が ~1.5GB × N 消費して OOM の原因になる）
pkill -f "KotlinCompileDaemon"; pkill -f "GradleDaemon"

# 2. 0バイトの metadata.bin を持つ破損キャッシュを削除（再生成されるので安全）
find ~/.gradle/caches -name "metadata.bin" -size 0 -printf '%h\n' | xargs rm -rf

# 3. 再ビルド（キャッシュ再生成で時間がかかる）
bun run eas:android:preview
```

**備考:**
- 0バイトの `results.bin` はビルドを妨げない（削除不要、2026-10-24 実測）
- `free -h` と `ps aux --sort=-%mem` でメモリ・残存 daemon を先に確認する
- 再ビルド後、APK は `build-<タイムスタンプ>.apk` としてリポジトリ直下に出力される

## 関連する既知の問題

- `.codegraph/` の Unix ソケット（daemon.sock）が EAS Build の shallow clone を失敗させる → ビルド前に `.codegraph/` を削除
- `eas.json` のプロファイルに `local: true` は書けない（スキーマ検証エラー）。ローカルビルドは CLI の `--local` フラグで指定