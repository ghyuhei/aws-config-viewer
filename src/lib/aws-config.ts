import {
  ConfigServiceClient,
  SelectAggregateResourceConfigCommand,
} from '@aws-sdk/client-config-service';

const client = new ConfigServiceClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

const AGGREGATOR_NAME = process.env.CONFIG_AGGREGATOR_NAME || '';

export interface EC2Instance {
  accountId: string;
  region: string;
  instanceId: string;
  privateIpAddress: string;
  name: string;
  instanceType: string;
}

export interface VPC {
  accountId: string;
  region: string;
  vpcId: string;
  cidrBlock: string;
  name: string;
  isDefault: boolean;
}

export interface SearchParams {
  accountId?: string;
  region?: string;
  instanceId?: string;
  ipAddress?: string;
  vpcId?: string;
  cidr?: string;
  name?: string;
}

interface RawResource {
  accountId: string;
  awsRegion: string;
  resourceId: string;
  configuration: string | Record<string, unknown>;
  tags?: Array<{ key: string; value: string }>;
}

async function executeQuery(resourceType: string): Promise<RawResource[]> {
  const results: RawResource[] = [];
  let nextToken: string | undefined;
  const expression = `SELECT accountId, awsRegion, resourceId, configuration, tags WHERE resourceType = '${resourceType}'`;

  do {
    const command = new SelectAggregateResourceConfigCommand({
      ConfigurationAggregatorName: AGGREGATOR_NAME,
      Expression: expression,
      Limit: 100,
      NextToken: nextToken,
    });

    const response = await client.send(command);

    if (response.Results) {
      for (const result of response.Results) {
        try {
          results.push(JSON.parse(result));
        } catch {
          // Skip invalid JSON
        }
      }
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return results;
}

function parseConfig<T>(config: string | Record<string, unknown>): T {
  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch {
      return {} as T;
    }
  }
  return config as T;
}

function getNameTag(tags?: Array<{ key: string; value: string }>): string {
  return tags?.find((t) => t.key?.toLowerCase() === 'name')?.value || '';
}

// 全角英数字を半角に変換
function toHalfWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

function matchesFilter(value: string, filter?: string): boolean {
  if (!filter) return true;
  const normalizedFilter = toHalfWidth(filter).toLowerCase();
  return value.toLowerCase().includes(normalizedFilter);
}

export async function queryEC2Instances(params: SearchParams = {}): Promise<EC2Instance[]> {
  const results = await executeQuery('AWS::EC2::Instance');

  return results
    .map((data) => {
      const config = parseConfig<{
        privateIpAddress?: string;
        instanceType?: string;
      }>(data.configuration);

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        instanceId: data.resourceId,
        privateIpAddress: config.privateIpAddress || '',
        name: getNameTag(data.tags),
        instanceType: config.instanceType || '',
      };
    })
    .filter((i) => {
      if (!matchesFilter(i.accountId, params.accountId)) return false;
      if (!matchesFilter(i.region, params.region)) return false;
      if (!matchesFilter(i.instanceId, params.instanceId)) return false;
      if (!matchesFilter(i.name, params.name)) return false;
      if (params.ipAddress && !matchesFilter(i.privateIpAddress, params.ipAddress)) {
        return false;
      }
      return true;
    });
}

export async function queryVPCs(params: SearchParams = {}): Promise<VPC[]> {
  const results = await executeQuery('AWS::EC2::VPC');

  return results
    .map((data) => {
      const config = parseConfig<{
        cidrBlock?: string;
        isDefault?: boolean;
      }>(data.configuration);

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        vpcId: data.resourceId,
        cidrBlock: config.cidrBlock || '',
        name: getNameTag(data.tags),
        isDefault: config.isDefault || false,
      };
    })
    .filter((v) => {
      if (!matchesFilter(v.accountId, params.accountId)) return false;
      if (!matchesFilter(v.region, params.region)) return false;
      if (!matchesFilter(v.vpcId, params.vpcId)) return false;
      if (!matchesFilter(v.cidrBlock, params.cidr)) return false;
      if (!matchesFilter(v.name, params.name)) return false;
      return true;
    });
}
