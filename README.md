# LINE Webhook to Email PoC

## 概要

LINEの公式アカウントに届いたメッセージを自動的にメールに転送するシステム。
特に楽々販売のメール取込機能と連携することを想定しています。

## 技術スタック

- Node.js + TypeScript
- Express（Webサーバー）
- @line/bot-sdk（LINE Messaging API SDK）
- nodemailer（メール送信）
- ngrok（ローカル開発用トンネリング）

## 環境設定

### 必要な環境変数（.env）

```
LINE_CHANNEL_SECRET=【LINE Developersから取得】
LINE_ACCESS_TOKEN=【LINE Developersから取得】
PORT=3000
GMAIL_USER=【送信元Gmailアドレス】
GMAIL_APP_PASSWORD=【Gmailアプリパスワード】
MAIL_TO=【カンマ区切りの送信先メールアドレス】
```

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

## 機能詳細

### 1. LINE Webhook受信

- エンドポイント: `/webhook`
- 署名検証あり（LINE_CHANNEL_SECRETを使用）
- テキストメッセージのみ対応

### 2. メール送信

- 送信元: 設定したGmailアドレス
- 送信先: カンマ区切りで複数指定可能
- メール形式:
  - 件名: `LINE問い合わせ【フレッツ光でグッドライフ】flets_line`
  - 本文:
    ```
    [ID] : 【LINE User ID】
    [Message] : 【受信したメッセージ】
    ```

### 3. エラーハンドリング

- メール送信エラーのログ出力
- 詳細なエラー情報の表示（エラーメッセージ、タイプ、スタックトレース）

## 現在の設定値

### LINE設定

- Webhook URL: ngrokで生成されたURL + /webhook
- Webhookの利用: ON
- 応答メッセージ: OFF（二重送信防止）

### メール設定

- 送信先:
  1. koushin1022apple@gmail.com
  2. qsu3he-00001-flets@hdpeach.htdb.jp

## 動作確認方法

1. サーバー起動

```bash
npm run dev
```

2. ngrok起動（別ターミナル）

```bash
ngrok http 3000
```

3. LINE Developersでwebhook URLを更新

- 形式: `https://xxxx.ngrok.io/webhook`

4. LINEアプリからメッセージを送信

- コンソールに「INBOUND:」と送信内容が表示
- 設定したメールアドレスに通知が届く

## 注意事項

- ngrokのURLは起動時に毎回変更されるため、テスト時は都度LINE DevelopersでURLの更新が必要
- Gmailアプリパスワードは2段階認証を有効にした後に取得可能
- メール送信に失敗した場合は詳細なエラーログを確認

