# AWS Config Viewer

Web application to search and view AWS resources across multiple accounts using AWS Config Advanced Query.

## Features

- **EC2 Search**: Partial match search by Account ID, Region, Instance ID, IP Address, Name
- **VPC Search**: Partial match search by Account ID, Region, VPC ID, CIDR, Name
- **RDS Search**: Partial match search by Account ID, Region, DB Instance ID, Name
- **Lambda Search**: Partial match search by Account ID, Region, Function Name
- **Load Balancer Search**: Partial match search by Account ID, Region, Load Balancer Name
- **Network Interface Search**: Partial match search by Account ID, Region, ENI ID, IP Address, Subnet ID, VPC ID
- **SES Search**: Partial match search by Account ID, Region, Identity Name
- **CloudFront Search**: Partial match search by Account ID, Region, Distribution ID, Domain Name
- **Table Sorting**: Click column headers to sort ascending/descending
- **Full-width Character Support**: Automatically converts full-width to half-width for search
- Display all resources when no search criteria specified
- Dark mode UI

## Prerequisites

- AWS Config Aggregator configured
- AWS resources (EC2, VPC, RDS, Lambda, Load Balancers, Network Interfaces, SES, CloudFront) recorded in AWS Config
- IAM permission: `config:SelectAggregateResourceConfig`

## Quick Start

### Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- `AWS_REGION`: AWS region (e.g., `ap-northeast-1`)
- `CONFIG_AGGREGATOR_NAME`: Config Aggregator name
- `AWS_PROFILE`: (Optional) SSO profile for local development

### Development

```bash
npm install
npm run dev
# or
docker compose up dev
```

Access http://localhost:3000

### Production

```bash
npm run build
node .next/standalone/server.js
# or
docker compose up app
```

## Project Structure

```
aws-config-viewer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ec2/route.ts          # EC2 API endpoint
│   │   │   ├── vpc/route.ts          # VPC API endpoint
│   │   │   ├── rds/route.ts          # RDS API endpoint
│   │   │   ├── lambda/route.ts       # Lambda API endpoint
│   │   │   ├── lb/route.ts           # Load Balancer API endpoint
│   │   │   ├── eni/route.ts          # Network Interface API endpoint
│   │   │   ├── ses/route.ts          # SES API endpoint
│   │   │   └── cloudfront/route.ts   # CloudFront API endpoint
│   │   ├── page.tsx                  # Search UI
│   │   ├── layout.tsx                # App layout
│   │   └── globals.css               # Global styles
│   └── lib/
│       └── aws-config.ts             # AWS Config query logic
├── deploy/
│   ├── iam-policy.json               # IAM policy
│   └── ecs-task-definition.json      # ECS task definition
├── Dockerfile                        # Production image
├── Dockerfile.dev                    # Development image
└── docker-compose.yml                # Local development
```

## Deployment to AWS ECS Fargate

### 1. Create IAM Role

```bash
# Create policy
aws iam create-policy \
  --policy-name aws-config-viewer-policy \
  --policy-document file://deploy/iam-policy.json

# Create task role
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

# Attach policy
aws iam attach-role-policy \
  --role-name aws-config-viewer-task-role \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/aws-config-viewer-policy
```

### 2. Build and Push Image

```bash
aws ecr create-repository --repository-name aws-config-viewer

aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com

docker build -t aws-config-viewer .
docker tag aws-config-viewer:latest ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/aws-config-viewer:latest
docker push ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/aws-config-viewer:latest
```

### 3. Register Task Definition

Edit `deploy/ecs-task-definition.json`:
- Replace `YOUR_ACCOUNT_ID`, `YOUR_REGION`, `YOUR_AGGREGATOR_NAME`

```bash
aws ecs register-task-definition --cli-input-json file://deploy/ecs-task-definition.json
```

### 4. Create ECS Service

```bash
aws ecs create-service \
  --cluster YOUR_CLUSTER_NAME \
  --service-name aws-config-viewer \
  --task-definition aws-config-viewer \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## Security

### Required IAM Policy

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

### Container Security

- Non-root user (UID 1001: nextjs)
- Read-only root filesystem
- `no-new-privileges` flag
- `/tmp` only writable via tmpfs

### Recommended Network Configuration

```
Internet → ALB (HTTPS/443) → ECS Fargate (port 3000)
             ↓
      ACM Certificate
```

- ALB: Public subnet, HTTPS only
- ECS: Private subnet with NAT Gateway
- Security Group: Allow ALB → ECS on port 3000 only

## License

MIT
