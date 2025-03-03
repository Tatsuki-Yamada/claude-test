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

このプロジェクトでは、すべてのインフラストラクチャリソースがCodePipelineによって管理されます。最初に初期パイプラインをデプロイし、その後パイプラインがすべてのリソースを自動的にデプロイします。

### 1. パイプラインスタックのデプロイ

まず、パイプライン本体とそのリソース（IAMロール、アーティファクトバケット）をデプロイします：

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

### 2. パイプライン実行フロー

パイプラインスタックがデプロイされると、CodePipelineが自動的に起動し、以下の順序でリソースをデプロイします：

1. **ソースコード取得**: GitHubリポジトリからコードを取得
2. **IAMリソースのデプロイ**: 各コンポーネント用のIAMロールをデプロイ
3. **S3リソースのデプロイ**: 必要なS3バケットをデプロイ
4. **CodeBuildリソースのデプロイ**: フロントエンドビルド用のCodeBuildプロジェクトをデプロイ
5. **Lambdaリソースのデプロイ**: CloudFrontキャッシュ無効化用のLambda関数をデプロイ
6. **アプリケーションスタックのデプロイ**: Cognito、DynamoDB、API Gateway、CloudFrontなどのアプリケーションスタックをデプロイ
7. **フロントエンドビルド**: ReactアプリケーションをCodeBuildでビルド
8. **フロントエンドデプロイ**: ビルド成果物をS3にデプロイし、CloudFrontキャッシュを無効化

このフローにより、すべてのインフラストラクチャがコード管理され、自動的にデプロイされます。

### 3. パイプラインの進行状況確認

パイプラインの進行状況は、AWS Management ConsoleのCodePipelineページで確認できます：

```
https://console.aws.amazon.com/codepipeline/home?region=<YOUR_REGION>#/view/game-collection-dev-pipeline
```

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

インフラストラクチャの変更も同様にコードとしてコミットし、GitHubにプッシュすることで自動的にデプロイされます。

## スタックの構造

このプロジェクトでは以下のスタックが使用されています：

1. **パイプラインスタック** (`game-collection-pipeline`)
   - CodePipeline本体
   - 初期IAMロール
   - アーティファクトバケット

2. **IAMスタック** (`game-collection-dev-iam`)
   - CodeBuildサービスロール
   - Lambda実行ロール
   - CloudFormationサービスロール

3. **S3スタック** (`game-collection-dev-s3`)
   - Webサイトバケット
   - サムネイルバケット

4. **CodeBuildスタック** (`game-collection-dev-codebuild`)
   - フロントエンドビルドプロジェクト

5. **Lambdaスタック** (`game-collection-dev-lambda`)
   - CloudFrontキャッシュ無効化関数

6. **アプリケーションスタック**
   - 認証スタック (`game-collection-dev-auth`)
   - ストレージスタック (`game-collection-dev-storage`)
   - APIスタック (`game-collection-dev-api`)
   - フロントエンドインフラスタック (`game-collection-dev-frontend-infra`)

## スタックの削除

スタックを削除する場合は、以下の順序で削除します：

```bash
# まずパイプラインスタックを削除
aws cloudformation delete-stack --stack-name game-collection-pipeline

# 次に各アプリケーションスタックを削除（必要に応じて）
aws cloudformation delete-stack --stack-name game-collection-dev-frontend-infra
aws cloudformation delete-stack --stack-name game-collection-dev-api
aws cloudformation delete-stack --stack-name game-collection-dev-storage
aws cloudformation delete-stack --stack-name game-collection-dev-auth

# 最後にインフラスタックを削除
aws cloudformation delete-stack --stack-name game-collection-dev-lambda
aws cloudformation delete-stack --stack-name game-collection-dev-codebuild
aws cloudformation delete-stack --stack-name game-collection-dev-s3
aws cloudformation delete-stack --stack-name game-collection-dev-iam
```

## トラブルシューティング

### パイプラインのエラー
パイプラインのデプロイやアクションで問題が発生した場合は、AWS Management ConsoleでCodePipelineのコンソールからエラーの詳細を確認し、対応するスタックまたはリソースを修正してください。

### 依存関係のエラー
スタック間に依存関係があるため、デプロイの順序が重要です。一部のスタックがデプロイされていない場合、依存するスタックもデプロイに失敗します。パイプラインの実行履歴を確認して、どのステージで失敗したかを特定してください。

### IAMロールの権限エラー
スタックデプロイ中にIAMロールの権限エラーが発生した場合は、`CAPABILITY_NAMED_IAM`パラメータが指定されていることを確認してください。また、必要なIAM権限がCloudFormationサービスロールに付与されていることを確認してください。
