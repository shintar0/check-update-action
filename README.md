# 📦 check-update-action

check-update-action は、指定したパッケージマネージャ（現在は pnpm）を用いて依存パッケージの更新状況をチェックし、ホワイトリスト（YAML）によるフィルタリングや Slack 通知を行う GitHub Action です。

- 更新対象の抽出
- ホワイトリストによる除外
- Slack 通知（任意）
- 更新があれば CI を失敗させる（任意）

といった CI 運用を簡単に実現できます。

## ✨ Features

- 🔍 パッケージの更新状況をチェック（現在は pnpm のみ対応）
- 🧹 ホワイトリスト（YAML）で除外ルールを柔軟に設定
- 📣 Slack 通知に対応（任意）
- 🚨 更新があれば CI を失敗させるオプション
- 🔧 将来 pip / poetry などの追加に対応しやすい構造

## 📁 Repository Structure

```txt
check-update-action/
├─ action.yaml
├─ managers/
│   ├─ pnpm.sh
│   └─ pip.sh          # 将来追加予定
├─ scripts/
│   ├─ filter.js
│   └─ notify.js
├─ LICENCE.md
├─ LICENCE.ja.md
└─ README.md
```

## ⚙️ Inputs

### `manager`（必須）

> 実行するパッケージマネージャ 現在サポートは`pnpm`のみ

```yaml
manager: pnpm
```

### `webhook_url`（任意）

> Slack 通知を行う場合の Webhook URL 未指定の場合は通知しません。

```yaml
webhook_url: "https://example.com/xxxx"
```

### `enable_slack`（任意 / デフォルト: false）

> Slack 通知を有効にするかどうか。

```yaml
enable_slack: true
```

### whitelist_file（任意）

> 更新チェックから除外するパッケージの YAML ファイルパス。

```yaml
packages:
  - name: "no-update-package"
    skipped_version: "*"
    reason: "このパッケージは基本アップデートしません。"

  - name: "main-package"
    skipped_version: "4.*.*"
    reason: "メジャーアップデート直後のため様子見。"

  - name: "minor-package"
    skipped_version: "4.1.*"
    reason: "このマイナーバージョンはパッチのみ対応します。"
```

### fail_on_update（任意 / デフォルト: false）

> 更新対象が 1 件でもあれば exit 1 でジョブを失敗させる。

```yaml
fail_on_update: true
```
## 🧪 Usage Example

```yaml
- uses: shintar0/check-update-action@v1
  with:
    manager: pnpm
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    enable_slack: true
    whitelist_file: "./whitelist.yaml"
    fail_on_update: true
```

## 🔍 How It Works

1. 引数チェック
    - manager が必須
    - whitelist_file が指定されていれば存在チェック
    - Slack 通知は enable_slack と webhook_url の両方が必要
1. パッケージマネージャの実行
    - pnpm outdated --json を実行し outdated.json を生成
1. ホワイトリストによるフィルタリング
    - scripts/filter.js が outdated.json と whitelist_file を読み込み
    - minimatch によるワイルドカード判定で除外
    - filtered.json を生成
    - fail_on_update が true なら exit 1
1. Slack 通知（任意）
    - filtered.json の内容を Slack に送信

## 🛠 Future Plans

- pip / poetry / npm / yarn などの追加
- Slack Block Kit 対応
- GitHub Issue / PR 自動生成オプション

## 📄 License

このリポジトリは独自ライセンスで公開されています。詳細は [LICENCE.md](LICENCE.md) および [LICENCE.ja.md](LICENCE.ja.md) を参照してください。