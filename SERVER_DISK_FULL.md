# サーバーのディスク満杯時（Calibre 描画エラー）の復旧手順

自宅サーバー（192.168.1.11）のシステムディスクが満杯になると、Calibre content server の書籍描画が次のスタックトレースで落ちる。

```
File "calibre/srv/render_book.py", line 433, in __enter__
File "calibre/ptempfile.py", line 203, in PersistentTemporaryDirectory
File "tempfile.py", line 368, in mkdtemp
OSError: [Errno 28] No space left on device: '/tmp/calibre_6.17.0_tmp_xxxx/yyyy'
```

描画ワーカーは `/tmp`（コンテナの書き込みレイヤ＝ホストの `/`）に作業ディレクトリを作るため、**ディスク満杯＝描画失敗**になる。Calibre 側の設定やアプリのコードの問題ではない。

## 症状の確認

```bash
df -h /
df -i /
```

- `Use%` が 100% → 容量不足（本ドキュメントの対象）
- `Size` に余裕があるのに `IUse%` が 100% → inode 枯渇（別問題。小さいファイルの堆積を探す）

2026-11-06 の実測: `/dev/mapper/ubuntu--vg-ubuntu--lv 98G 94G 0 100%`、inode は 10%。

## 1. 先に空きを作る

0 バイト空きだと Docker デーモンやログ出力も不安定になるため、まず安全な操作だけで数 GB 空ける。

```bash
sudo journalctl --vacuum-size=200M
docker image prune -f      # dangling イメージのみ。使用中イメージは消えない
docker builder prune -f    # ビルドキャッシュ
df -h /
```

**やってはいけない**

- `docker system prune -a` — 他スタック（jellyfin 等）のイメージまで消える
- `docker volume prune -a` — calibre の `/config` などデータ入りボリュームも消える
- `/var/lib/docker` 配下の手動削除

## 2. 容量の消費者を特定

```bash
df -h                    # 別ディスク・マウントの有無
lsblk -f
sudo du -x -d1 -h / 2>/dev/null | sort -h | tail -20
sudo du -x -d1 -h /var/lib/docker 2>/dev/null | sort -h | tail -10
docker system df
docker system df -v | head -40
```

`du` の合計が `df` の使用量に届かない場合は、削除済みだがプロセスが掴んでいるファイルを疑う。

```bash
sudo lsof -nP +L1 2>/dev/null | head -20
# lsof が無い場合
sudo ls -l /proc/[0-9]*/fd/* 2>/dev/null | grep deleted | head
```

該当プロセスを再起動（多くはログを開いたままのサービス）すれば解放される。

### コンテナ別の書き込みレイヤを疑う

`docker system df` の `Containers` が大きく、`Images` の RECLAIMABLE が小さい場合は、イメージではなく**コンテナの書き込みレイヤ**が犯人。prune では空かない。

```bash
docker ps -a -s --format 'table {{.Names}}\t{{.Size}}\t{{.Status}}'
```

2026-11-06 の実測では `calibre` が **65.2GB**（virtual 67.2GB）で、他は 1MB 未満だった。原因は 6 週間の稼働中に失敗した描画の `/tmp/calibre_*_tmp_*` がコンテナ内に溜まったこと。`/tmp` はコンテナの書き込みレイヤ（＝ホストの `/`）なので、ホストのディスクを直接圧迫する。

```bash
docker exec calibre sh -c 'du -x -d1 -h / 2>/dev/null | sort -h | tail -12'
docker exec calibre sh -c 'du -sh /tmp/* /config/* 2>/dev/null | sort -h | tail -12'
```

## 3. Calibre の復旧

ディスクに空きができたら、失敗した描画の残骸を回収する。**稼働中のワーカーが掴んでいるディレクトリを消しても容量は解放されない**（inode が残る）ため、先に再起動して全ワーカーを落とす。

```bash
docker restart calibre
sleep 20
docker exec calibre sh -c 'find /tmp -maxdepth 1 -name "calibre_*_tmp_*" -mmin +3 -print -exec rm -rf {} +'
df -h /
```

`-mmin +3` は「再起動前から存在するもの」だけを対象にするため。再起動後に新しく作られた作業ディレクトリは残る。削除は数分かかる（小ファイルが多い）。

2026-11-06 の実測では `/tmp` に 3 ディレクトリだけで 53GB（13GB / 15GB / 25GB）あった。エラーに出ていた `calibre_6.17.0_tmp_k23vcba3` もその一つで、同じディレクトリが失敗後も残り続けていた。

使用中かどうかを先に確認したい場合:

```bash
docker exec calibre sh -c 'ls -ld --time-style=long-iso /tmp/calibre_* 2>/dev/null'
docker exec calibre sh -c 'for p in /proc/[0-9]*; do ls -l $p/fd 2>/dev/null; done | grep -o "/tmp/calibre_[^/]*" | sort | uniq -c'
```

2つ目に何も出なければ未使用。出たディレクトリは生きているプロセスのもの。

`/config` 配下（Calibre ライブラリ本体）は別ディスクの正規データなので削除しない。

## 4. 再発防止

98G に対して 94G 使用のような状態では、掃除だけでは再発する。`du` の結果に応じて以下を検討する。

- Calibre ライブラリ・jellyfin のトランスコード/キャッシュ・syncthing の `.stversions` など、増え続けるデータを別ディスクへ移す
- `docker system df -v` で未使用の名前付きボリュームを確認し、不要なものだけ個別に削除する
- Watchtower の `WATCHTOWER_CLEANUP: true` は scope 内の古いイメージしか消さない。他スタックは定期的に `docker image prune` を回す
- ディスク使用率の監視（80% 超で通知）を入れる。`/tmp` を使う処理は満杯時に真っ先に落ちる

### Calibre の `/tmp` をディスク上（別領域）へ出す

サーバーには `/`（98G）とは別に `/home`（3.5T）があるため、Calibre の一時領域をそちらへ逃がすのが最小の変更で効く。コンテナの `/tmp` にホストディレクトリを重ねるだけでよい。

```bash
sudo install -d -m 1777 /home/calibre-tmp
```

```yaml
    volumes:
      - /home/calibre-tmp:/tmp
```

再作成は `docker compose up -d --force-recreate`。再作成すると 65GB の書き込みレイヤも破棄される。あわせてホスト側で古い残骸を定期削除する。

```bash
# crontab -e（毎日 4:00 に 1 日より古い描画残骸を削除）
0 4 * * * find /home/calibre-tmp -maxdepth 1 -name 'calibre_*_tmp_*' -mmin +1440 -exec rm -rf {} +
```

根本的には Docker のデータ（82GB）が `/` 上にあることが問題なので、長期的には `daemon.json` の `data-root` を `/home/docker` か未使用の `sdb1` へ移す。