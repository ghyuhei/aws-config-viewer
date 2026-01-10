import {
  ConfigServiceClient,
  SelectAggregateResourceConfigCommand,
} from '@aws-sdk/client-config-service';
import {
  IAMClient,
  ListAccessKeysCommand,
  GetUserCommand,
} from '@aws-sdk/client-iam';

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

export interface RDSInstance {
  accountId: string;
  region: string;
  dbInstanceId: string;
  dbInstanceClass: string;
  engine: string;
  name: string;
}

export interface LambdaFunction {
  accountId: string;
  region: string;
  functionName: string;
  runtime: string;
  memorySize: number;
  lastModified: string;
}

export interface LoadBalancer {
  accountId: string;
  region: string;
  loadBalancerName: string;
  type: string;
  dnsName: string;
  scheme: string;
}

export interface NetworkInterface {
  accountId: string;
  region: string;
  networkInterfaceId: string;
  privateIpAddress: string;
  subnetId: string;
  vpcId: string;
  description: string;
  status: string;
}

export interface S3Bucket {
  accountId: string;
  region: string;
  bucketName: string;
  creationDate: string;
  versioning: string;
  encryption: string;
}

export interface IAMUser {
  accountId: string;
  region: string;
  userName: string;
  userId: string;
  arn: string;
  path: string;
  createDate: string;
  hasAccessKey: string;
  passwordLastUsed: string;
}

export interface SearchParams {
  accountId?: string;
  region?: string;
  instanceId?: string;
  ipAddress?: string;
  vpcId?: string;
  cidr?: string;
  name?: string;
  dbInstanceId?: string;
  functionName?: string;
  loadBalancerName?: string;
  networkInterfaceId?: string;
  subnetId?: string;
  bucketName?: string;
  userName?: string;
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
      if (!matchesFilter(db.dbInstanceId, params.dbInstanceId)) return false;
      if (!matchesFilter(db.name, params.name)) return false;
      return true;
    });
}

export async function queryLambdaFunctions(params: SearchParams = {}): Promise<LambdaFunction[]> {
  const results = await executeQuery('AWS::Lambda::Function');

  return results
    .map((data) => {
      const config = parseConfig<{
        functionName?: string;
        runtime?: string;
        memorySize?: number;
        lastModified?: string;
      }>(data.configuration);

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        functionName: config.functionName || data.resourceId,
        runtime: config.runtime || '',
        memorySize: config.memorySize || 0,
        lastModified: config.lastModified || '',
      };
    })
    .filter((fn) => {
      if (!matchesFilter(fn.accountId, params.accountId)) return false;
      if (!matchesFilter(fn.region, params.region)) return false;
      if (!matchesFilter(fn.functionName, params.functionName)) return false;
      return true;
    });
}

export async function queryLoadBalancers(params: SearchParams = {}): Promise<LoadBalancer[]> {
  const results = await executeQuery('AWS::ElasticLoadBalancingV2::LoadBalancer');

  return results
    .map((data) => {
      const config = parseConfig<{
        loadBalancerName?: string;
        type?: string;
        dNSName?: string;
        scheme?: string;
      }>(data.configuration);

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        loadBalancerName: config.loadBalancerName || data.resourceId,
        type: config.type || '',
        dnsName: config.dNSName || '',
        scheme: config.scheme || '',
      };
    })
    .filter((lb) => {
      if (!matchesFilter(lb.accountId, params.accountId)) return false;
      if (!matchesFilter(lb.region, params.region)) return false;
      if (!matchesFilter(lb.loadBalancerName, params.loadBalancerName)) return false;
      return true;
    });
}

export async function queryNetworkInterfaces(params: SearchParams = {}): Promise<NetworkInterface[]> {
  const results = await executeQuery('AWS::EC2::NetworkInterface');

  return results
    .map((data) => {
      const config = parseConfig<{
        privateIpAddress?: string;
        subnetId?: string;
        vpcId?: string;
        description?: string;
        status?: string;
      }>(data.configuration);

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        networkInterfaceId: data.resourceId,
        privateIpAddress: config.privateIpAddress || '',
        subnetId: config.subnetId || '',
        vpcId: config.vpcId || '',
        description: config.description || '',
        status: config.status || '',
      };
    })
    .filter((eni) => {
      if (!matchesFilter(eni.accountId, params.accountId)) return false;
      if (!matchesFilter(eni.region, params.region)) return false;
      if (!matchesFilter(eni.networkInterfaceId, params.networkInterfaceId)) return false;
      if (!matchesFilter(eni.subnetId, params.subnetId)) return false;
      if (!matchesFilter(eni.vpcId, params.vpcId)) return false;
      if (params.ipAddress && !matchesFilter(eni.privateIpAddress, params.ipAddress)) {
        return false;
      }
      return true;
    });
}

export async function queryS3Buckets(params: SearchParams = {}): Promise<S3Bucket[]> {
  const results = await executeQuery('AWS::S3::Bucket');

  return results
    .map((data) => {
      const config = parseConfig<{
        name?: string;
        creationDate?: string;
        versioningConfiguration?: {
          status?: string;
        };
        serverSideEncryptionConfiguration?: {
          rules?: Array<{
            applyServerSideEncryptionByDefault?: {
              sSEAlgorithm?: string;
            };
          }>;
        };
      }>(data.configuration);

      const versioningStatus = config.versioningConfiguration?.status || 'Disabled';
      const encryption = config.serverSideEncryptionConfiguration?.rules?.[0]?.applyServerSideEncryptionByDefault?.sSEAlgorithm || 'None';

      return {
        accountId: data.accountId,
        region: data.awsRegion,
        bucketName: config.name || data.resourceId,
        creationDate: config.creationDate || '',
        versioning: versioningStatus,
        encryption: encryption,
      };
    })
    .filter((bucket) => {
      if (!matchesFilter(bucket.accountId, params.accountId)) return false;
      if (!matchesFilter(bucket.region, params.region)) return false;
      if (!matchesFilter(bucket.bucketName, params.bucketName)) return false;
      return true;
    });
}

async function getIAMUserDetails(userName: string, accountId: string): Promise<{
  hasAccessKey: string;
  passwordLastUsed: string;
}> {
  try {
    const iamClient = new IAMClient({ region: 'us-east-1' }); // IAM is global, use any region

    // Get access keys
    let hasAccessKey = 'None';
    try {
      const accessKeysResponse = await iamClient.send(
        new ListAccessKeysCommand({ UserName: userName })
      );
      if (accessKeysResponse.AccessKeyMetadata && accessKeysResponse.AccessKeyMetadata.length > 0) {
        const hasActive = accessKeysResponse.AccessKeyMetadata.some(
          key => key.Status === 'Active'
        );
        hasAccessKey = hasActive ? 'Active' : 'Inactive';
      }
    } catch (error) {
      // If we can't get access keys, mark as unknown
      hasAccessKey = 'Unknown';
    }

    // Get password last used
    let passwordLastUsed = 'Never';
    try {
      const userResponse = await iamClient.send(
        new GetUserCommand({ UserName: userName })
      );
      if (userResponse.User?.PasswordLastUsed) {
        passwordLastUsed = userResponse.User.PasswordLastUsed.toISOString();
      }
    } catch (error) {
      // If we can't get user details, mark as unknown
      passwordLastUsed = 'Unknown';
    }

    return { hasAccessKey, passwordLastUsed };
  } catch (error) {
    // If IAM API fails completely, return defaults
    return { hasAccessKey: 'Unknown', passwordLastUsed: 'Unknown' };
  }
}

export async function queryIAMUsers(params: SearchParams = {}): Promise<IAMUser[]> {
  const results = await executeQuery('AWS::IAM::User');

  const baseUsers = results.map((data) => {
    const config = parseConfig<{
      userName?: string;
      userId?: string;
      arn?: string;
      path?: string;
      createDate?: string;
    }>(data.configuration);

    return {
      accountId: data.accountId,
      region: data.awsRegion,
      userName: config.userName || data.resourceId,
      userId: config.userId || '',
      arn: config.arn || '',
      path: config.path || '/',
      createDate: config.createDate || '',
    };
  });

  // Enrich with IAM API data
  const enrichedUsers = await Promise.all(
    baseUsers.map(async (user) => {
      const iamDetails = await getIAMUserDetails(user.userName, user.accountId);
      return {
        ...user,
        hasAccessKey: iamDetails.hasAccessKey,
        passwordLastUsed: iamDetails.passwordLastUsed,
      };
    })
  );

  return enrichedUsers.filter((user) => {
    if (!matchesFilter(user.accountId, params.accountId)) return false;
    if (!matchesFilter(user.region, params.region)) return false;
    if (!matchesFilter(user.userName, params.userName)) return false;
    return true;
  });
}
