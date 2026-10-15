#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "使い方: bun run version <patch|minor|major|x.y.z>"
  echo ""
  echo "  package.json と app.config.js の version を更新し、コミット + タグを作成します。"
  echo "  タグの push は行いません（push 時に3ワークフローが同時起動します）。"
  exit 1
}

[ $# -lt 1 ] && usage

bump=$1

# --- 現在のバージョンを取得 ---
OLD_VERSION=$(node -e "console.log(require('./package.json').version)")

# --- 新しいバージョンを計算 ---
if [[ "$bump" =~ ^(patch|minor|major)$ ]]; then
  NEW_VERSION=$(node -e "
    const v = require('./package.json').version.split('.').map(Number);
    if ('$bump' === 'major') v[0]++, v[1] = 0, v[2] = 0;
    else if ('$bump' === 'minor') v[1]++, v[2] = 0;
    else v[2]++;
    console.log(v.join('.'));
  ")
elif [[ "$bump" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEW_VERSION="$bump"
else
  echo "エラー: '$bump' は無効です。patch, minor, major, または x.y.z を指定してください。"
  exit 1
fi

if [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "エラー: 新バージョンが現バージョンと同じです ($OLD_VERSION)"
  exit 1
fi

if git tag --list "v$NEW_VERSION" | grep -q .; then
  echo "エラー: タグ v$NEW_VERSION は既に存在します"
  exit 1
fi

# --- ファイル更新 ---
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

  let cfg = fs.readFileSync('app.config.js', 'utf8');
  cfg = cfg.replace(/(version:\s*\")[^\"]*(\")/, '\$1$NEW_VERSION\$2');
  fs.writeFileSync('app.config.js', cfg);
"

echo "  package.json:    $OLD_VERSION → $NEW_VERSION"
echo "  app.config.js:   $OLD_VERSION → $NEW_VERSION"

# --- コミット + タグ ---
git add package.json app.config.js
git commit -m "v$NEW_VERSION にバージョンアップ"
git tag "v$NEW_VERSION"

echo ""
echo "✓ v$NEW_VERSION を作成しました。"
echo "  push する場合は: git push && git push origin v$NEW_VERSION"
echo "  ⚠ v* タグ push で3ワークフローが同時起動します（Docker / EAS preview / Storybook Pages）"
