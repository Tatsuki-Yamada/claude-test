# S3 Photo Gallery - Frontend

これはAWS S3に保存された画像を一覧表示するReactアプリケーションです。

## 開発環境のセットアップ

### 必要な環境変数

このアプリケーションを動作させるには、以下の環境変数が必要です：

- `REACT_APP_S3_BUCKET_NAME` - 写真を保存するS3バケットの名前
- `REACT_APP_AWS_REGION` - S3バケットのAWSリージョン

### ローカル開発での環境変数設定

1. プロジェクトルートに `.env.local` ファイルを作成：

```
REACT_APP_S3_BUCKET_NAME=your-bucket-name
REACT_APP_AWS_REGION=us-east-1
```

2. AWSの認証情報を設定（~/.aws/credentials ファイルまたは環境変数で）：

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 開発サーバーの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

## トラブルシューティング

### "S3 bucket name is not configured" エラー

このエラーは、アプリケーションが`REACT_APP_S3_BUCKET_NAME`環境変数を取得できない場合に発生します。以下の解決策を試してください：

1. `.env.local`ファイルが正しく設定されているか確認する
2. アプリケーションを再起動する
3. ブラウザのキャッシュをクリアする
4. 本番環境の場合は、CodePipelineを再実行する

### CORSエラー

S3バケットからのリクエストにCORSエラーが発生する場合：

1. S3バケットのCORS設定が正しく構成されているか確認する
2. CloudFormationテンプレートの`s3-resources.yaml`を確認する
