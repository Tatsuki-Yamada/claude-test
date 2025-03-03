# インフラストラクチャ

このディレクトリには、AWS CloudFormationテンプレートが含まれています。これらのテンプレートを使用して、アプリケーションに必要なAWSリソースをプロビジョニングします。

## ディレクトリ構造

- `auth/` - 認証関連リソース（Cognito）
- `storage/` - ストレージ関連リソース（S3、DynamoDB）
- `api/` - API関連リソース（API Gateway、Lambda）
- `frontend/` - フロントエンド配信関連リソース（S3、CloudFront）

## デプロイ方法

各ディレクトリ内のテンプレートは、AWS CLIまたはAWS Management Consoleを使用してデプロイできます。

### AWS CLIを使用したデプロイ例

```bash
# スタックの作成
aws cloudformation create-stack \
  --stack-name game-collection-storage \
  --template-body file://storage/template.yaml \
  --capabilities CAPABILITY_IAM

# スタックの更新
aws cloudformation update-stack \
  --stack-name game-collection-storage \
  --template-body file://storage/template.yaml \
  --capabilities CAPABILITY_IAM
```

### 依存関係

スタックには以下の依存関係があります：

1. 認証スタック（Cognito）
2. ストレージスタック（S3、DynamoDB）
3. APIスタック（API Gateway、Lambda）
4. フロントエンドスタック（S3、CloudFront）

スタックは上記の順序でデプロイしてください。
