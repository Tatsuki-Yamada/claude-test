# ゲームコレクション管理アプリ セットアップガイド

このドキュメントでは、ゲームコレクション管理アプリの開発環境セットアップとデプロイ方法について説明します。

## 前提条件

- Node.js (v14以上)
- npm または yarn
- AWS CLI（設定済み）
- AWS アカウント

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/Tatsuki-Yamada/claude-test.git
cd claude-test
```

### 2. フロントエンド開発環境のセットアップ

```bash
cd frontend
npm install  # または yarn
```

### 3. 環境変数の設定

`frontend/.env.local` ファイルを作成し、以下の内容を設定します（AWSリソースをデプロイ後に取得した値を使用）：

```
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_USER_POOL_ID=<Cognito User Pool ID>
REACT_APP_USER_POOL_CLIENT_ID=<Cognito User Pool Client ID>
REACT_APP_IDENTITY_POOL_ID=<Cognito Identity Pool ID>
REACT_APP_API_ENDPOINT=<API Gateway Endpoint>
REACT_APP_THUMBNAILS_BUCKET=<S3 Bucket Name for Thumbnails>
```

### 4. ローカル開発サーバーの起動

```bash
npm start  # または yarn start
```

これにより、`http://localhost:3000` でアプリが起動します。

## AWSリソースのデプロイ

### 1. CloudFormationテンプレートのデプロイ

以下の順序でCloudFormationスタックをデプロイします：

#### 認証スタック（Cognito）

```bash
cd infrastructure/auth
aws cloudformation create-stack \
  --stack-name game-collection-dev-auth \
  --template-body file://template.yaml \
  --parameters ParameterKey=AppName,ParameterValue=game-collection ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM
```

#### ストレージスタック（S3、DynamoDB）

```bash
cd ../storage
aws cloudformation create-stack \
  --stack-name game-collection-dev-storage \
  --template-body file://template.yaml \
  --parameters ParameterKey=AppName,ParameterValue=game-collection ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM
```

#### APIスタック（API Gateway、Lambda）

```bash
cd ../api
aws cloudformation create-stack \
  --stack-name game-collection-dev-api \
  --template-body file://template.yaml \
  --parameters ParameterKey=AppName,ParameterValue=game-collection ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM
```

#### フロントエンドスタック（CloudFront、S3）

```bash
cd ../frontend
aws cloudformation create-stack \
  --stack-name game-collection-dev-frontend \
  --template-body file://template.yaml \
  --parameters ParameterKey=AppName,ParameterValue=game-collection ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_IAM
```

### 2. リソース情報の取得

各スタックがデプロイされたら、以下のコマンドでリソース情報を取得できます：

```bash
# 認証スタック
aws cloudformation describe-stacks --stack-name game-collection-dev-auth --query "Stacks[0].Outputs"

# ストレージスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-storage --query "Stacks[0].Outputs"

# APIスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-api --query "Stacks[0].Outputs"

# フロントエンドスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-frontend --query "Stacks[0].Outputs"
```

取得した情報を元に、`.env.local` ファイルの環境変数を設定します。

## フロントエンドのデプロイ

### 1. フロントエンドのビルド

```bash
cd frontend
npm run build  # または yarn build
```

### 2. ビルド成果物のS3アップロード

```bash
aws s3 sync build/ s3://game-collection-dev-website/
```

### 3. CloudFrontのキャッシュ無効化

```bash
# CloudFront Distribution IDを取得
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name game-collection-dev-frontend --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)

# キャッシュ無効化
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## アプリにアクセス

CloudFrontのドメイン名を使用してアプリにアクセスできます：

```bash
# CloudFrontドメイン名を取得
DOMAIN_NAME=$(aws cloudformation describe-stacks --stack-name game-collection-dev-frontend --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text)

echo "WebサイトURL: https://$DOMAIN_NAME"
```

## トラブルシューティング

### APIへの接続エラー

- API Gateway CORSの設定を確認
- Cognitoの認証情報が正しく設定されているか確認
- APIエンドポイントURLが正しいか確認

### S3へのアップロードエラー

- IAMロールのアクセス権限を確認
- S3バケット名が正しいか確認
- CORS設定が適切か確認

### CloudFormationデプロイエラー

- エラーメッセージを確認し、リソース名やパラメータを修正
- スタックの削除後に再デプロイを試行
