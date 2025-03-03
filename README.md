# ゲームコレクション管理アプリ

個人のゲームコレクションを管理するためのWebアプリケーションです。プレイしたゲームの記録やサムネイル画像の管理ができます。

## 機能
- ゲーム情報の登録・編集・削除
- ゲーム一覧表示（サムネイル表示）
- ゲーム詳細表示
- 検索・フィルタリング機能
- ユーザー認証

## 技術スタック
- フロントエンド: React + TypeScript + shadcn/ui
- バックエンド: AWS Lambda + API Gateway
- データベース: DynamoDB
- ストレージ: S3
- インフラ: CloudFormation

## プロジェクト構造
```
/
├── frontend/              # フロントエンドコード (React + TypeScript)
├── backend/               # バックエンドコード (Lambda関数)
└── infrastructure/        # CloudFormationテンプレート
    ├── auth/              # 認証関連リソース
    ├── storage/           # ストレージ関連リソース
    ├── api/               # API関連リソース
    └── frontend/          # フロントエンド配信関連リソース
```

## 開発環境セットアップ
（セットアップ手順は今後追加予定）

## デプロイ手順
（デプロイ手順は今後追加予定）
