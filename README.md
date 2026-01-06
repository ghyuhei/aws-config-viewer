# AWS Config Viewer

AWS Config Advanced Query を使用して、複数AWSアカウントのEC2インスタンスとVPCを検索・表示するWebアプリケーション。

## 機能

- **EC2検索**: Account ID, Region, Instance ID, IP Address, Name で部分一致検索
- **VPC検索**: Account ID, Region, VPC ID, CIDR, Name で部分一致検索
- 検索条件なしで全件表示可能
- ダークモードUI

## 前提条件

- AWS Config Aggregator が設定済みであること
- EC2/VPC リソースが AWS Config で記録されていること
- 適切な IAM 権限（`config:SelectAggregateResourceConfig`）

## クイックスタート

### 1. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下を設定:
- `AWS_REGION`: AWS リージョン（例: `ap-northeast-1`）
- `CONFIG_AGGREGATOR_NAME`: Config Aggregator 名
- `AWS_PROFILE`: （オプション）ローカル開発時のSSO プロファイル名

### 2. ローカル実行

#### 開発モード

**Node.js直接実行:**
```bash
npm install
npm run dev
```

**Docker:**
```bash
docker compose up dev
```

http://localhost:3000 でアクセス

#### 本番モード

**方法1: npm を使用**
```bash
npm install
npm run build
npm start
```

**方法2: standalone ビルドを使用（推奨）**
```bash
npm run build
node .next/standalone/server.js
```

**方法3: Docker を使用**
```bash
# Dockerイメージをビルド
docker build -t aws-config-viewer .

# コンテナを起動
docker run -p 3000:3000 \
  -e AWS_REGION=ap-northeast-1 \
  -e CONFIG_AGGREGATOR_NAME=your-aggregator-name \
  -v ~/.aws:/home/nextjs/.aws:ro \
  aws-config-viewer
```

**方法4: Docker Compose を使用**
```bash
docker compose up app
```

http://localhost:3000 でアクセス

## プロジェクト構造

```
aws-config-viewer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ec2/route.ts          # EC2 API エンドポイント
│   │   │   └── vpc/route.ts          # VPC API エンドポイント
│   │   ├── page.tsx                  # 検索UIコンポーネント
│   │   ├── layout.tsx                # アプリケーションレイアウト
│   │   └── globals.css               # グローバルスタイル
│   └── lib/
│       └── aws-config.ts             # AWS Config クエリロジック
├── deploy/
│   ├── iam-policy.json               # IAM ポリシー定義
│   └── ecs-task-definition.json      # ECS タスク定義テンプレート
├── Dockerfile                        # 本番用Dockerイメージ
├── Dockerfile.dev                    # 開発用Dockerイメージ
├── docker-compose.yml                # ローカル実行用Docker Compose設定
├── next.config.js                    # Next.js設定
├── package.json                      # npm依存関係
├── tsconfig.json                     # TypeScript設定
└── .env.example                      # 環境変数テンプレート
```

## カスタマイズガイド

### 検索フィールドの追加

新しい検索条件を追加する場合、以下のファイルを修正します。

#### 1. `src/lib/aws-config.ts` の修正

**a. SearchParams インターフェースに新しいフィールドを追加:**

```typescript
export interface SearchParams {
  accountId?: string;
  region?: string;
  instanceId?: string;
  ipAddress?: string;
  name?: string;
  newField?: string;  // 追加
}
```

**b. クエリ関数のフィルタロジックに条件を追加:**

```typescript
export async function queryEC2Instances(params: SearchParams = {}): Promise<EC2Instance[]> {
  // ... 既存のコード ...
  .filter((i) => {
    if (!matchesFilter(i.accountId, params.accountId)) return false;
    if (!matchesFilter(i.region, params.region)) return false;
    if (!matchesFilter(i.instanceId, params.instanceId)) return false;
    if (!matchesFilter(i.name, params.name)) return false;
    if (!matchesFilter(i.newField, params.newField)) return false;  // 追加
    // ...
  });
}
```

#### 2. `src/app/api/ec2/route.ts` または `vpc/route.ts` の修正

**パラメータ配列に新しいフィールド名を追加:**

```typescript
export async function GET(request: NextRequest) {
  // ...
  ['accountId', 'region', 'instanceId', 'ipAddress', 'name', 'newField'].forEach((key) => {
    const value = sp.get(key);
    if (value) params[key as keyof SearchParams] = value;
  });
  // ...
}
```

#### 3. `src/app/page.tsx` の修正

**a. 検索状態の初期値に追加:**

```typescript
const initialEC2Search = {
  accountId: '',
  region: '',
  instanceId: '',
  ipAddress: '',
  name: '',
  newField: '',  // 追加
};
```

**b. 検索フォームに入力フィールドを追加:**

```typescript
<SearchInput
  label="New Field"
  value={ec2Search.newField}
  onChange={(v) => setEc2Search({ ...ec2Search, newField: v })}
  placeholder="Enter new field"
/>
```

**c. テーブルにカラムを追加（必要に応じて）:**

```typescript
<thead>
  <tr>
    <th>Name</th>
    <th>New Field</th>  {/* 追加 */}
    {/* ... */}
  </tr>
</thead>
<tbody>
  {ec2Instances.map((i) => (
    <tr key={`${i.accountId}-${i.instanceId}`}>
      <td>{i.name || '-'}</td>
      <td>{i.newField || '-'}</td>  {/* 追加 */}
      {/* ... */}
    </tr>
  ))}
</tbody>
```

### 新しいリソースタイプの追加（例: RDS）

新しいAWSリソースタイプを追加する場合の手順：

#### 1. `src/lib/aws-config.ts` の修正

**a. インターフェース定義を追加:**

```typescript
export interface RDSInstance {
  accountId: string;
  region: string;
  dbInstanceId: string;
  dbInstanceClass: string;
  engine: string;
  name: string;
}
```

**b. クエリ関数を追加:**

```typescript
export async function queryRDSInstances(params: SearchParams = {}): Promise<RDSInstance[]> {
  const results = await executeQuery('AWS::RDS::DBInstance');

  return results
    .map((data) => {
      const config = parseConfig<{
        dBInstanceClass?: string;
        engine?: string;
      }>(data.configuration);

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        dbInstanceId: data.resourceId,
        dbInstanceClass: config.dBInstanceClass || '',
        engine: config.engine || '',
        name: getNameTag(data.tags),
      };
    })
    .filter((db) => {
      if (!matchesFilter(db.accountId, params.accountId)) return false;
      if (!matchesFilter(db.region, params.region)) return false;
      if (!matchesFilter(db.dbInstanceId, params.instanceId)) return false;
      if (!matchesFilter(db.name, params.name)) return false;
      return true;
    });
}
```

#### 2. `src/app/api/rds/route.ts` を新規作成

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { queryRDSInstances, type SearchParams } from '@/lib/aws-config';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const params: SearchParams = {};

    ['accountId', 'region', 'instanceId', 'name'].forEach((key) => {
      const value = sp.get(key);
      if (value) params[key as keyof SearchParams] = value;
    });

    const data = await queryRDSInstances(params);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('RDS query error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

#### 3. `src/app/page.tsx` の修正

**a. インターフェースを追加:**

```typescript
interface RDSInstance {
  accountId: string;
  region: string;
  dbInstanceId: string;
  dbInstanceClass: string;
  engine: string;
  name: string;
}
```

**b. タブタイプを更新:**

```typescript
type TabType = 'ec2' | 'vpc' | 'rds';  // 'rds'を追加
```

**c. 状態と初期値を追加:**

```typescript
const [rdsInstances, setRdsInstances] = useState<RDSInstance[]>([]);
const [rdsSearch, setRdsSearch] = useState({
  accountId: '',
  region: '',
  instanceId: '',
  name: '',
});
```

**d. search関数を更新:**

```typescript
const search = useCallback(async (type: 'ec2' | 'vpc' | 'rds') => {
  // ...
  const searchParams =
    type === 'ec2' ? ec2Search :
    type === 'vpc' ? vpcSearch :
    rdsSearch;
  // ...
  if (data.success) {
    if (type === 'ec2') setEc2Instances(data.data);
    else if (type === 'vpc') setVpcs(data.data);
    else setRdsInstances(data.data);
  }
}, [ec2Search, vpcSearch, rdsSearch]);
```

**e. タブとUIを追加:**

```typescript
<div className="tabs">
  <button className={`tab ${activeTab === 'ec2' ? 'active' : ''}`} onClick={() => setActiveTab('ec2')}>
    EC2 Instances
  </button>
  <button className={`tab ${activeTab === 'vpc' ? 'active' : ''}`} onClick={() => setActiveTab('vpc')}>
    VPCs
  </button>
  <button className={`tab ${activeTab === 'rds' ? 'active' : ''}`} onClick={() => setActiveTab('rds')}>
    RDS
  </button>
</div>

{/* タブコンテンツを追加（EC2/VPCタブを参考に実装） */}
```

### スタイルの変更

`src/app/globals.css` の CSS 変数を編集してテーマをカスタマイズ:

```css
:root {
  --background: #0a0a0a;       /* 背景色 */
  --foreground: #ededed;       /* テキスト色 */
  --primary: #3b82f6;          /* プライマリカラー */
  --primary-hover: #2563eb;    /* ホバー時のプライマリカラー */
  --border: #333;              /* ボーダー色 */
  --card-bg: #111;             /* カード背景色 */
  --input-bg: #1a1a1a;         /* 入力欄背景色 */
}
```

## デプロイ

### AWS ECS Fargate へのデプロイ

#### 1. IAM ロール作成

```bash
# IAMポリシーを作成
aws iam create-policy \
  --policy-name aws-config-viewer-policy \
  --policy-document file://deploy/iam-policy.json

# タスクロールを作成
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
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/aws-config-viewer-policy
```

#### 2. ECR にイメージをプッシュ

```bash
# ECR リポジトリ作成
aws ecr create-repository --repository-name aws-config-viewer

# ECR ログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com

# イメージビルド & プッシュ
docker build -t aws-config-viewer .
docker tag aws-config-viewer:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/aws-config-viewer:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/aws-config-viewer:latest
```

#### 3. ECS タスク定義の登録

`deploy/ecs-task-definition.json` を編集:
- `YOUR_ACCOUNT_ID` を実際のアカウントIDに置換
- `YOUR_REGION` を使用するリージョンに置換
- `YOUR_AGGREGATOR_NAME` を Config Aggregator 名に置換

```bash
aws ecs register-task-definition --cli-input-json file://deploy/ecs-task-definition.json
```

#### 4. ECS サービスの作成

```bash
aws ecs create-service \
  --cluster YOUR_CLUSTER_NAME \
  --service-name aws-config-viewer \
  --task-definition aws-config-viewer \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 推奨ネットワーク構成

```
Internet → ALB (HTTPS/443) → ECS Fargate (port 3000)
             ↓
      ACM Certificate
```

- **ALB**: パブリックサブネット、HTTPS のみ許可
- **ECS**: プライベートサブネット（NAT Gateway 経由でAWS API にアクセス）
- **セキュリティグループ**: ALB → ECS の 3000 番ポートのみ許可

## セキュリティ

### 必要な IAM 権限

アプリケーションに必要な最小権限（`deploy/iam-policy.json` 参照）:

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

本番用 Docker イメージには以下のセキュリティ機能が実装されています:

- 非rootユーザー（UID 1001: nextjs）で実行
- 読み取り専用ルートファイルシステム
- `no-new-privileges` 設定
- `/tmp` のみ tmpfs でマウント（書き込み可能）

## トラブルシューティング

### AWS 認証エラー

**エラー**: `Unable to locate credentials`

**対処**:
- ローカル開発: `.env.local` で `AWS_PROFILE` を設定
- Docker: AWS 認証情報が `~/.aws` にあることを確認
- ECS: タスクロールが正しく設定されていることを確認

### Config Aggregator が見つからない

**エラー**: `NoSuchConfigurationAggregatorException`

**対処**:
- `CONFIG_AGGREGATOR_NAME` が正しく設定されていることを確認
- AWS Config で Aggregator が作成されていることを確認
- 使用しているリージョンが正しいことを確認（Aggregator は特定のリージョンに作成される）

### 検索結果が空

**考えられる原因**:
- AWS Config でリソースが記録されていない
- 検索条件が厳しすぎる
- IAM 権限が不足している

**対処**:
- AWS Config コンソールでリソースが記録されていることを確認
- 検索条件をクリアして全件検索を試す
- IAM ポリシーで `config:SelectAggregateResourceConfig` 権限があることを確認

## ライセンス

MIT
