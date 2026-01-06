# AWS Config Viewer

AWS Config Advanced Query を使用して、複数AWSアカウントのEC2インスタンスとVPCを検索・表示するWebアプリケーション。

## 機能

- **EC2検索**: Account ID, Region, Instance ID, IP Address, Name で部分一致検索
- **VPC検索**: Account ID, Region, VPC ID, CIDR, Name で部分一致検索
- 検索条件なしで全件表示

## 前提条件

- AWS Config Aggregator が設定済みであること
- EC2/VPC リソースが Config で記録されていること

## クイックスタート

### ローカル開発

```bash
# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して CONFIG_AGGREGATOR_NAME と AWS_PROFILE を設定

# Docker なし
npm install
npm run dev

# Docker あり（開発モード）
docker compose up dev
```

http://localhost:3000 でアクセス

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `AWS_REGION` | AWSリージョン | Yes |
| `CONFIG_AGGREGATOR_NAME` | Config Aggregator 名 | Yes |
| `AWS_PROFILE` | SSO プロファイル（ローカルのみ） | No |

## ファイル構成

```
aws-config-viewer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ec2/route.ts      # EC2 API エンドポイント
│   │   │   └── vpc/route.ts      # VPC API エンドポイント
│   │   ├── page.tsx              # 検索UI
│   │   ├── layout.tsx            # レイアウト
│   │   └── globals.css           # スタイル
│   └── lib/
│       └── aws-config.ts         # AWS Config クエリロジック
├── deploy/
│   ├── iam-policy.json           # IAM ポリシー
│   └── ecs-task-definition.json  # ECS タスク定義
├── Dockerfile                     # 本番用
├── Dockerfile.dev                 # 開発用
├── docker-compose.yml             # ローカル開発用
└── .env.example                   # 環境変数テンプレート
```

## カスタマイズガイド

### 検索フィールドの追加

1. **`src/lib/aws-config.ts`**: インターフェースとフィルタロジックを追加
   ```typescript
   // SearchParams に新しいフィールドを追加
   export interface SearchParams {
     accountId?: string;
     newField?: string;  // 追加
   }

   // filter 内で新しいフィールドの条件を追加
   .filter((i) => {
     if (!matchesFilter(i.newField, params.newField)) return false;
     // ...
   })
   ```

2. **`src/app/api/ec2/route.ts`** または **`vpc/route.ts`**: パラメータ配列に追加
   ```typescript
   ['accountId', 'region', 'newField'].forEach((key) => {
   ```

3. **`src/app/page.tsx`**: 検索フォームに入力フィールドを追加
   ```typescript
   const [search, setSearch] = useState({ newField: '', ... });

   <SearchInput label="New Field" value={search.newField} ... />
   ```

### 新しいリソースタイプの追加（例: RDS）

1. **`src/lib/aws-config.ts`**:
   ```typescript
   // インターフェース追加
   export interface RDSInstance {
     accountId: string;
     region: string;
     dbInstanceId: string;
     // ...
   }

   // クエリ関数追加
   export async function queryRDSInstances(params: SearchParams = {}): Promise<RDSInstance[]> {
     const results = await executeQuery('AWS::RDS::DBInstance');
     // ...
   }
   ```

2. **`src/app/api/rds/route.ts`**: 新規作成
   ```typescript
   import { queryRDSInstances } from '@/lib/aws-config';
   // EC2 route.ts を参考に実装
   ```

3. **`src/app/page.tsx`**: タブとテーブルを追加

### スタイルの変更

**`src/app/globals.css`** の CSS 変数を編集:
```css
:root {
  --background: #0a0a0a;    /* 背景色 */
  --primary: #3b82f6;       /* メインカラー */
  --border: #333;           /* ボーダー色 */
}
```

## ECS Fargate デプロイ

### 1. IAM ロール作成

```bash
# ポリシー作成
aws iam create-policy \
  --policy-name aws-config-viewer-policy \
  --policy-document file://deploy/iam-policy.json

# ロール作成
aws iam create-role \
  --role-name aws-config-viewer-task-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# ポリシーをアタッチ
aws iam attach-role-policy \
  --role-name aws-config-viewer-task-role \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/aws-config-viewer-policy
```

### 2. イメージのビルドとプッシュ

```bash
# ECR リポジトリ作成
aws ecr create-repository --repository-name aws-config-viewer

# ログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com

# ビルド & プッシュ
docker build -t aws-config-viewer .
docker tag aws-config-viewer:latest ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/aws-config-viewer:latest
docker push ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/aws-config-viewer:latest
```

### 3. ECS タスク登録

`deploy/ecs-task-definition.json` の以下を編集:
- `YOUR_ACCOUNT_ID` → 実際のアカウントID
- `YOUR_REGION` → リージョン
- `YOUR_AGGREGATOR_NAME` → Aggregator名

```bash
aws ecs register-task-definition --cli-input-json file://deploy/ecs-task-definition.json
```

## セキュリティ

### IAM（最小権限）

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["config:SelectAggregateResourceConfig"],
    "Resource": "*"
  }]
}
```

### コンテナセキュリティ

- 非rootユーザー（UID 1001）で実行
- 読み取り専用ルートファイルシステム
- `no-new-privileges` 設定
- `/tmp` のみ tmpfs でマウント

### ネットワーク構成（推奨）

```
Internet → ALB (HTTPS/443) → ECS Fargate (port 3000)
                ↓
        ACM Certificate
```

- ALB: パブリックサブネット、HTTPS のみ
- ECS: プライベートサブネット
- セキュリティグループ: ALB → ECS の 3000 番ポートのみ許可
