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
├── frontend/                # Reactアプリケーション
└── infrastructure/          # CloudFormationテンプレート
    ├── pipeline/            # CodePipelineのメイン設定
    ├── resources/           # 各AWSリソースのテンプレート
    └── prerequisites/       # 前提条件となるリソース
```

## デプロイ方法

1. 前提条件スタックをデプロイ
2. パイプラインスタックをデプロイ
3. パイプラインが自動的に残りのリソースをデプロイ

## ローカル開発

```bash
cd frontend
npm install
npm start
```
