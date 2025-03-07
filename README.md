# S3 Photo Gallery

AWS S3に保存した画像をウェブアプリから一覧表示するシンプルなアプリケーション。

## 技術スタック

- フロントエンド: React + TypeScript
- UI ライブラリ: Shadcn/ui
- インフラ: AWS S3, AWS CloudFormation, AWS CodePipeline

## プロジェクト構造

```
.
├── README.md
├── DEPLOYMENT.md         # デプロイ手順
├── frontend/             # Reactアプリケーション
└── infrastructure/       # CloudFormationテンプレート
    ├── pipeline/         # CodePipelineのメイン設定
    │   ├── main-pipeline.yaml     # メインパイプライン
    │   └── meta-pipeline.yaml     # メタパイプライン（自動更新用）
    ├── resources/        # 各AWSリソースのテンプレート
    │   ├── s3-resources.yaml      # S3バケット関連リソース
    │   └── hosting-resources.yaml # ホスティング関連リソース
    ├── buildspecs/       # CodeBuild用のビルド仕様
    └── prerequisites/    # 前提条件となるリソース
```

## パイプラインアーキテクチャ

このプロジェクトでは、以下の最適化されたCI/CDパイプラインアーキテクチャを採用しています：

1. **CodeBuildの最小化**：
   - インフラデプロイにはCloudFormationアクションを直接使用
   - CodeBuildはReactアプリのビルドなど、実際に必要な処理だけに限定

2. **buildspecの外部化**：
   - インラインではなく、リポジトリ内の外部ファイルとして管理
   - 親パイプラインの再デプロイなしでbuildspecを変更可能

3. **パイプラインの自動更新**：
   - メタパイプラインによるパイプライン設定の自動更新
   - パイプライン設定変更時も再デプロイが自動的に行われる

## デプロイ方法

詳細な手順は [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。

1. 前提条件スタックをデプロイ
2. メタパイプラインスタックをデプロイ
3. メタパイプラインが自動的にメインパイプラインをデプロイ
4. メインパイプラインが残りのリソースをデプロイ

## ローカル開発

```bash
cd frontend
npm install
npm start
```
