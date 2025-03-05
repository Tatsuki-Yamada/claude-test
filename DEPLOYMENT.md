# デプロイ手順

このアプリケーションをAWSにデプロイするための手順です。

## 前提条件

- AWSアカウント
- AWS CLIがインストールされており、適切な権限で設定されていること
- GitHubの個人アクセストークン（リポジトリへのアクセス権限が必要）

## デプロイ手順

### 1. パイプラインの前提条件をデプロイ

```bash
aws cloudformation create-stack \
  --stack-name s3-photo-gallery-prerequisites \
  --template-body file://infrastructure/prerequisites/pipeline-prerequisites.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

### 2. メインパイプラインをデプロイ

```bash
aws cloudformation create-stack \
  --stack-name s3-photo-gallery \
  --template-body file://infrastructure/pipeline/main-pipeline.yaml \
  --parameters \
      ParameterKey=GitHubOwner,ParameterValue=Tatsuki-Yamada \
      ParameterKey=GitHubRepo,ParameterValue=claude-test \
      ParameterKey=GitHubBranch,ParameterValue=main \
      ParameterKey=GitHubToken,ParameterValue=YOUR_GITHUB_TOKEN \
      ParameterKey=PrerequisitesStackName,ParameterValue=s3-photo-gallery-prerequisites \
  --capabilities CAPABILITY_NAMED_IAM
```

> 注意: GitHubTokenのところは、実際のGitHubトークンに置き換えてください。

### 3. パイプラインの実行を確認

AWS マネジメントコンソールにログインし、CodePipeline のコンソールからパイプラインの実行状況を確認します。

```
https://console.aws.amazon.com/codepipeline/home?region=YOUR_REGION#/view/s3-photo-gallery-pipeline
```

パイプラインが完了すると、以下のリソースがデプロイされます：

1. S3バケット（写真保存用）
2. S3バケット（ウェブサイトホスティング用）
3. CloudFront配信

### 4. アプリケーションへのアクセス

デプロイが完了すると、CloudFrontのURLを通じてアプリケーションにアクセスできます。URLは以下の場所で確認できます：

1. CloudFormationスタックの出力から
2. CloudFrontコンソールから

### 5. 写真のアップロード

写真は以下の方法でS3バケットにアップロードできます：

1. AWS管理コンソールのS3セクションから
2. AWS CLIを使用して：

```bash
aws s3 cp /path/to/your/image.jpg s3://YOUR_STACK_NAME-photos-YOUR_ACCOUNT_ID/
```

## 更新とメンテナンス

コードを変更した場合、GitHubリポジトリにプッシュするだけで、CodePipelineが自動的に変更を検出し、デプロイを実行します。

## クリーンアップ

環境を削除するには、以下の順序でCloudFormationスタックを削除します：

```bash
# メインスタックを削除
aws cloudformation delete-stack --stack-name s3-photo-gallery

# S3バケットとCloudFrontのスタックを削除
aws cloudformation delete-stack --stack-name s3-photo-gallery-s3-resources
aws cloudformation delete-stack --stack-name s3-photo-gallery-hosting-resources

# 最後に前提条件のスタックを削除
aws cloudformation delete-stack --stack-name s3-photo-gallery-prerequisites
```

> 注意: S3バケットを削除する前に、バケット内のすべてのオブジェクトを削除してください。そうしないとスタックの削除が失敗します。
