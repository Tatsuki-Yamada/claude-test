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

デプロイは2段階で行います：

1. 最初に基本インフラ（IAMロール、S3バケットなど）をデプロイ
2. 次にCodePipelineをデプロイし、残りのリソースをパイプラインで管理

### 1. 基本インフラスタックのデプロイ

```bash
aws cloudformation create-stack \
  --stack-name game-collection-dev-base \
  --template-body file://infrastructure/base/template.yaml \
  --parameters \
    ParameterKey=AppName,ParameterValue=game-collection \
    ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM
```

このスタックがデプロイされると、以下のリソースが作成されます：

- IAMロール（CodePipeline、CodeBuild、CloudFormation、Lambda用）
- S3バケット（パイプラインアーティファクトとWebサイトホスティング用）

### 2. CodePipelineスタックのデプロイ

基本インフラスタックのデプロイが完了したら、CodePipelineをデプロイします：

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

### 3. パイプラインの実行フロー

CodePipelineがデプロイされると、自動的に実行が開始され、以下の順序でリソースがデプロイされます：

1. **Source**: GitHubリポジトリからソースコードを取得
2. **DeployCodeBuildProject**: フロントエンドビルド用のCodeBuildプロジェクトをデプロイ
3. **DeployLambdaFunction**: CloudFrontキャッシュ無効化用のLambda関数をデプロイ
4. **DeployAuthStack**: 認証スタックをデプロイ（Cognito）
5. **DeployStorageStack**: ストレージスタックをデプロイ（DynamoDB）
6. **DeployAPIStack**: APIスタックをデプロイ（API Gateway、Lambda）
7. **DeployFrontendInfraStack**: フロントエンドインフラスタックをデプロイ（CloudFront）
8. **BuildFrontend**: CodeBuildを使用してフロントエンドをビルド
9. **DeployFrontend**: ビルド成果物をS3にデプロイし、CloudFrontキャッシュを無効化

この構造により、インフラの変更とアプリケーションコードの変更が一元管理され、自動的にデプロイされます。

## プロジェクト構造

### インフラストラクチャコード

- **基本インフラ**: `/infrastructure/base/template.yaml`
  - IAMロール、S3バケットなど、パイプラインが依存する基本リソース

- **パイプライン**: `/infrastructure/pipeline/template.yaml`
  - CodePipelineの定義

- **CodeBuild**: `/infrastructure/codebuild/frontend-build.yaml`
  - フロントエンドビルド用のCodeBuildプロジェクト

- **Lambda**: `/infrastructure/lambda/cf-invalidation.yaml`
  - CloudFrontキャッシュ無効化用のLambda関数

- **アプリケーションスタック**:
  - `/infrastructure/auth/template.yaml`: 認証（Cognito）
  - `/infrastructure/storage/template.yaml`: ストレージ（DynamoDB）
  - `/infrastructure/api/template.yaml`: API（API Gateway、Lambda）
  - `/infrastructure/frontend/template.yaml`: フロントエンド配信（CloudFront）

### フロントエンドコード

- `/frontend`: Reactアプリケーション

## リソース情報の取得

各スタックがデプロイされたら、以下のコマンドでリソース情報を取得できます：

```bash
# 基本インフラスタック
aws cloudformation describe-stacks --stack-name game-collection-dev-base --query "Stacks[0].Outputs"

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

インフラストラクチャの変更も同様に、該当するCloudFormationテンプレートを変更し、GitHubにプッシュすることで自動的にデプロイされます。

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

# CodeBuildプロジェクトとLambda関数のスタックを削除
aws cloudformation delete-stack --stack-name game-collection-dev-frontend-build
aws cloudformation delete-stack --stack-name game-collection-dev-cf-invalidation

# 最後に基本インフラスタックを削除
aws cloudformation delete-stack --stack-name game-collection-dev-base
```

## トラブルシューティング

### ステップ間の依存関係エラー

CodePipelineのステージやアクションがエクスポートされた値を見つけられない場合、正しい順序でスタックがデプロイされているか確認してください。基本インフラスタックが最初にデプロイされ、必要な出力値をエクスポートしていることを確認します。

### IAMロールの権限エラー

スタックデプロイ中にIAMロールの権限エラーが発生した場合は、`CAPABILITY_NAMED_IAM`パラメータが指定されていることを確認してください。また、必要なIAM権限が正しく設定されているか確認してください。

### パイプラインのエラー

パイプラインのステージが失敗した場合は、AWS Management ConsoleのCodePipelineページでエラー詳細を確認してください。多くの場合、CloudFormationスタックのロールバックエラーやCodeBuildプロジェクトのビルドエラーが原因です。

### 環境変数の設定

パイプラインが正常に実行された後、フロントエンドアプリケーションが正しく動作するには、`.env.local`ファイルに正しい環境変数を設定する必要があります。各スタックの出力値を確認して、APIエンドポイントやCognitoの設定を正しく設定してください。

## まとめ

この構成により、基本的なインフラリソースを手動で一度デプロイし、その後はCodePipelineを通じてすべてのリソースを管理する仕組みになっています。GitHubへのプッシュで自動的にデプロイされるため、継続的な開発と更新が容易になります。
