#!/usr/bin/env bash

set -e

echo "=== Running pnpm outdated ==="

# pnpm が存在するかチェック（存在しなければ異常終了）
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed in this environment."
  echo "The MANAGER input may be incorrect or this project does not use pnpm."
  exit 1
fi

# outdated を JSON で取得
OUTDATED_JSON=$(pnpm outdated --json || echo "[]")

# JSON が空文字列の場合に備えて補正
if [[ -z "$OUTDATED_JSON" ]]; then
  OUTDATED_JSON="[]"
fi

# 保存
echo "$OUTDATED_JSON" > outdated.json

echo "=== pnpm outdated result saved to outdated.json ==="
