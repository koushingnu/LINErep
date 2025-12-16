# Cloud Runへのデプロイ手順

## 前提条件

1. Google Cloudアカウントを持っていること
2. プロジェクトが作成されていること
3. Cloud RunのAPIが有効化されていること
4. gcloudコマンドラインツールがインストールされていること

## 手順

1. gcloudの初期設定

```bash
# ログイン
gcloud auth login

# プロジェクトの設定
gcloud config set project YOUR_PROJECT_ID
```

2. アプリケーションのビルドとデプロイ

```bash
# アプリケーションをビルドしてContainer Registryにプッシュ
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/line-inquiry

# Cloud Runにデプロイ
gcloud run deploy line-inquiry \
  --image gcr.io/YOUR_PROJECT_ID/line-inquiry \
  --region=asia-northeast1 \
  --platform=managed \
  --allow-unauthenticated
```

3. 環境変数の設定
   Cloud Runのコンソールで以下の環境変数を設定：

- LINE_CHANNEL_SECRET
- LINE_ACCESS_TOKEN
- GMAIL_USER
- GMAIL_APP_PASSWORD
- MAIL_TO

4. Webhook URLの設定

- デプロイ完了時に表示されるURLをコピー
- LINE DevelopersコンソールでWebhook URLを更新
- Webhook送信を有効化
- 接続確認を実行

## 注意点

- メモリ: 最小構成（256MB）で十分です
- インスタンス: 最小0、最大2程度で設定
- タイムアウト: デフォルト（60秒）で問題ありません
- リージョン: asia-northeast1（東京）を使用

## 運用管理

- ログ確認: Cloud Loggingでアプリケーションログを確認可能
- モニタリング: Cloud Monitoringでパフォーマンス監視可能
- 更新: 新バージョンは同じgcloud run deployコマンドで実行
