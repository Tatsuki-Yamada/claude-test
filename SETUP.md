# ゲームコレクション管理アプリ セットアップガイド

このドキュメントでは、ゲームコレクション管理アプリの開発環境セットアップとデプロイ方法について説明します。

## 前提条件

- Node.js (v16以上)
- npm または yarn
- AWS CLI（設定済み）
- AWS アカウント
- GitHub アカウント

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

CI/CDパイプラインはネストしたスタック構造を使用しており、まずパイプラインスタックをデプロイすることで、他のすべてのリソースが自動的にデプロイされます。

### 1. S3バケットを作成（ネストされたスタックテンプレート用）

CloudFormationはネストされたスタックのテンプレートをS3から読み込む必要があるため、まず一時的なS3バケットを作成します：

```bash
# バケットを作成
aws s3 mb s3://game-collection-cfn-templates

# テンプレートファイルをアップロード
aws s3 cp infrastructure/pipeline/templates/ s3://game-collection-cfn-templates/ --recursive
```

### 2. パイプラインスタックのデプロイ

```bash
aws cloudformation create-stack \
  --stack-name game-collection-pipeline \
  --template-body file://infrastructure/pipeline/template.yaml \
  --parameters \
    ParameterKey=AppName,ParameterValue=game-collection \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=RepositoryName,ParameterValue=claude-test \
    ParameterKey=RepositoryOwner,ParameterValue=Tatsuki-Yamada \
    ParameterKey=GitHubOAuthToken,ParameterValue=<YOUR_GITHUB_TOKEN> \
    ParameterKey=Branch,ParameterValue=main \
  --capabilities CAPABILITY_NAMED_IAM
```

GitHubトークンは、以下のスコープを持つものを使用してください：
- `repo`
- `admin:repo_hook`

### 3. スタック構造

パイプラインスタックが以下のネストされたスタックを作成します：

1. **IAMスタック**：必要なIAMロール
   - CodePipelineサービスロール
   - CloudFormationサービスロール
   - CodeBuildサービスロール
   - Lambda実行ロール

2. **S3スタック**：必要なS3バケット
   - パイプラインアーティファクト用バケット
   - Webサイトホスティング用バケット

3. **CodeBuildスタック**：ビルドプロジェクト
   - フロントエンドビルドプロジェクト

4. **Lambdaスタック**：必要なLambda関数
   - CloudFrontキャッシュ無効化関数

### 4. パイプラインのデプロイフロー

親スタックがデプロイされると、CodePipelineが作成され、次の順序でリソースがデプロイされます：

1. GitHubからソースコードを取得
2. 認証スタック（Cognito）のデプロイ
3. ストレージスタック（S3、DynamoDB）のデプロイ
4. APIスタック（API Gateway、Lambda）のデプロイ
5. フロントエンドインフラスタック（CloudFront）のデプロイ
6. フロントエンドのビルド
7. S3へのデプロイとCloudFrontキャッシュの無効化

## リソース情報の取得

各スタックがデプロイされたら、以下のコマンドでリソース情報を取得できます：

```bash
# 認証スタック
aws cloudformation describe-stacks --stack-name game-collection-dev-auth --query "Stacks[0].Outputs"

# ストレージスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-storage --query "Stacks[0].Outputs"

# APIスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-api --query "Stacks[0].Outputs"

# フロントエンドインフラスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-frontend-infra --query "Stacks[0].Outputs"
```

取得した情報を元に、`.env.local` ファイルの環境変数を設定します。

## 変更の反映

リポジトリに変更をプッシュすると、パイプラインが自動的に実行され、変更が反映されます。

```bash
git add .
git commit -m "変更を追加"
git push
```

## スタックの削除

スタックを削除する場合は、以下の順序で削除します：

```bash
# 親スタックを削除（すべてのネストされたスタックも削除されます）
aws cloudformation delete-stack --stack-name game-collection-pipeline

# 各CloudFormationスタックを個別に削除（必要に応じて）
aws cloudformation delete-stack --stack-name game-collection-dev-frontend-infra
aws cloudformation delete-stack --stack-name game-collection-dev-api
aws cloudformation delete-stack --stack-name game-collection-dev-storage
aws cloudformation delete-stack --stack-name game-collection-dev-auth

# テンプレート用S3バケットの削除
aws s3 rm s3://game-collection-cfn-templates --recursive
aws s3 rb s3://game-collection-cfn-templates
```

## トラブルシューティング

### テンプレートURLが見つからないエラー
ネストされたスタックのテンプレートURLがS3バケットで見つからない場合は、テンプレートが正しくアップロードされていることを確認してください。また、テンプレートURLのパスが正しいことを確認してください。

### IAMロールの権限エラー
デプロイ中にIAMロールの権限エラーが発生した場合は、`CAPABILITY_NAMED_IAM`パラメータが指定されていることを確認してください。

### パイプラインのエラー
CodePipelineのデプロイ中にエラーが発生した場合は、AWSマネジメントコンソールでCodePipelineのステージを確認し、具体的なエラーメッセージを確認してください。

### CloudFrontキャッシュ無効化エラー
CloudFrontキャッシュの無効化に失敗した場合は、Lambda関数のログを確認し、CloudFrontディストリビューションIDが正しく取得できているか確認してください。
