#!/usr/bin/env bash

set -e

# 必ずユーザーのリポジトリに移動
cd "$GITHUB_WORKSPACE"

echo "=== Running pnpm outdated ==="

RAW=$(pnpm outdated --json || true)

# pnpm outdated が空文字列を返す場合に対応
if [[ -z "$RAW" ]]; then
  RAW="[]"
fi

# 保存
echo "$RAW" > outdated.json

echo "=== pnpm outdated result saved to outdated.json ==="
