'use client';

import { useState, useCallback, useMemo } from 'react';

interface EC2Instance {
  accountId: string;
  region: string;
  instanceId: string;
  privateIpAddress: string;
  name: string;
  instanceType: string;
}

interface VPC {
  accountId: string;
  region: string;
  vpcId: string;
  cidrBlock: string;
  name: string;
  isDefault: boolean;
}

interface RDSInstance {
  accountId: string;
  region: string;
  dbInstanceId: string;
  dbInstanceClass: string;
  engine: string;
  name: string;
}

interface LambdaFunction {
  accountId: string;
  region: string;
  functionName: string;
  runtime: string;
  memorySize: number;
  lastModified: string;
}

interface LoadBalancer {
  accountId: string;
  region: string;
  loadBalancerName: string;
  type: string;
  dnsName: string;
  scheme: string;
}

interface NetworkInterface {
  accountId: string;
  region: string;
  networkInterfaceId: string;
  privateIpAddress: string;
  subnetId: string;
  vpcId: string;
  description: string;
  status: string;
}

interface SESIdentity {
  accountId: string;
  region: string;
  identityName: string;
  identityType: string;
  verificationStatus: string;
}

interface CloudFrontDistribution {
  accountId: string;
  region: string;
  distributionId: string;
  domainName: string;
  status: string;
  enabled: boolean;
}

type TabType = 'ec2' | 'vpc' | 'rds' | 'lambda' | 'lb' | 'eni' | 'ses' | 'cloudfront';
type SortKey = keyof EC2Instance | keyof VPC | keyof RDSInstance | keyof LambdaFunction | keyof LoadBalancer | keyof NetworkInterface | keyof SESIdentity | keyof CloudFrontDistribution;
type SortOrder = 'asc' | 'desc';

const initialEC2Search = {
  accountId: '',
  region: '',
  instanceId: '',
  ipAddress: '',
  name: '',
};

const initialVPCSearch = {
  accountId: '',
  region: '',
  vpcId: '',
  cidr: '',
  name: '',
};

const initialRDSSearch = {
  accountId: '',
  region: '',
  dbInstanceId: '',
  name: '',
};

const initialLambdaSearch = {
  accountId: '',
  region: '',
  functionName: '',
};

const initialLBSearch = {
  accountId: '',
  region: '',
  loadBalancerName: '',
};

const initialENISearch = {
  accountId: '',
  region: '',
  networkInterfaceId: '',
  ipAddress: '',
  subnetId: '',
  vpcId: '',
};

const initialSESSearch = {
  accountId: '',
  region: '',
  identityName: '',
};

const initialCloudFrontSearch = {
  accountId: '',
  region: '',
  distributionId: '',
  domainName: '',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('ec2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ec2Instances, setEc2Instances] = useState<EC2Instance[]>([]);
  const [vpcs, setVpcs] = useState<VPC[]>([]);
  const [rdsInstances, setRdsInstances] = useState<RDSInstance[]>([]);
  const [lambdaFunctions, setLambdaFunctions] = useState<LambdaFunction[]>([]);
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const [networkInterfaces, setNetworkInterfaces] = useState<NetworkInterface[]>([]);
  const [sesIdentities, setSesIdentities] = useState<SESIdentity[]>([]);
  const [cloudFrontDistributions, setCloudFrontDistributions] = useState<CloudFrontDistribution[]>([]);
  const [ec2Search, setEc2Search] = useState(initialEC2Search);
  const [vpcSearch, setVpcSearch] = useState(initialVPCSearch);
  const [rdsSearch, setRdsSearch] = useState(initialRDSSearch);
  const [lambdaSearch, setLambdaSearch] = useState(initialLambdaSearch);
  const [lbSearch, setLbSearch] = useState(initialLBSearch);
  const [eniSearch, setEniSearch] = useState(initialENISearch);
  const [sesSearch, setSesSearch] = useState(initialSESSearch);
  const [cloudfrontSearch, setCloudfrontSearch] = useState(initialCloudFrontSearch);
  const [sortKey, setSortKey] = useState<SortKey>('accountId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey, sortOrder]);

  const sortedEC2Instances = useMemo(() => {
    const sorted = [...ec2Instances].sort((a, b) => {
      const aVal = a[sortKey as keyof EC2Instance] || '';
      const bVal = b[sortKey as keyof EC2Instance] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [ec2Instances, sortKey, sortOrder]);

  const sortedVPCs = useMemo(() => {
    const sorted = [...vpcs].sort((a, b) => {
      const aVal = a[sortKey as keyof VPC] || '';
      const bVal = b[sortKey as keyof VPC] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vpcs, sortKey, sortOrder]);

  const sortedRDSInstances = useMemo(() => {
    const sorted = [...rdsInstances].sort((a, b) => {
      const aVal = a[sortKey as keyof RDSInstance] || '';
      const bVal = b[sortKey as keyof RDSInstance] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rdsInstances, sortKey, sortOrder]);

  const sortedLambdaFunctions = useMemo(() => {
    const sorted = [...lambdaFunctions].sort((a, b) => {
      const aVal = a[sortKey as keyof LambdaFunction] || '';
      const bVal = b[sortKey as keyof LambdaFunction] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [lambdaFunctions, sortKey, sortOrder]);

  const sortedLoadBalancers = useMemo(() => {
    const sorted = [...loadBalancers].sort((a, b) => {
      const aVal = a[sortKey as keyof LoadBalancer] || '';
      const bVal = b[sortKey as keyof LoadBalancer] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [loadBalancers, sortKey, sortOrder]);

  const sortedNetworkInterfaces = useMemo(() => {
    const sorted = [...networkInterfaces].sort((a, b) => {
      const aVal = a[sortKey as keyof NetworkInterface] || '';
      const bVal = b[sortKey as keyof NetworkInterface] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [networkInterfaces, sortKey, sortOrder]);

  const sortedSESIdentities = useMemo(() => {
    const sorted = [...sesIdentities].sort((a, b) => {
      const aVal = a[sortKey as keyof SESIdentity] || '';
      const bVal = b[sortKey as keyof SESIdentity] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sesIdentities, sortKey, sortOrder]);

  const sortedCloudFrontDistributions = useMemo(() => {
    const sorted = [...cloudFrontDistributions].sort((a, b) => {
      const aVal = a[sortKey as keyof CloudFrontDistribution] || '';
      const bVal = b[sortKey as keyof CloudFrontDistribution] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [cloudFrontDistributions, sortKey, sortOrder]);

  const search = useCallback(async (type: 'ec2' | 'vpc' | 'rds' | 'lambda' | 'lb' | 'eni' | 'ses' | 'cloudfront') => {
    setLoading(true);
    setError(null);

    try {
      let searchParams;
      switch (type) {
        case 'ec2':
          searchParams = ec2Search;
          break;
        case 'vpc':
          searchParams = vpcSearch;
          break;
        case 'rds':
          searchParams = rdsSearch;
          break;
        case 'lambda':
          searchParams = lambdaSearch;
          break;
        case 'lb':
          searchParams = lbSearch;
          break;
        case 'eni':
          searchParams = eniSearch;
          break;
        case 'ses':
          searchParams = sesSearch;
          break;
        case 'cloudfront':
          searchParams = cloudfrontSearch;
          break;
      }

      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => v && params.append(k, v));

      const res = await fetch(`/api/${type}?${params}`);
      const data = await res.json();

      if (data.success) {
        switch (type) {
          case 'ec2':
            setEc2Instances(data.data);
            break;
          case 'vpc':
            setVpcs(data.data);
            break;
          case 'rds':
            setRdsInstances(data.data);
            break;
          case 'lambda':
            setLambdaFunctions(data.data);
            break;
          case 'lb':
            setLoadBalancers(data.data);
            break;
          case 'eni':
            setNetworkInterfaces(data.data);
            break;
          case 'ses':
            setSesIdentities(data.data);
            break;
          case 'cloudfront':
            setCloudFrontDistributions(data.data);
            break;
        }
      } else {
        setError(data.error || 'Failed to fetch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [ec2Search, vpcSearch, rdsSearch, lambdaSearch, lbSearch, eniSearch, sesSearch, cloudfrontSearch]);

  const SearchInput = ({ label, value, onChange, placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <main className="container">
      <header className="header">
        <h1>AWS Config Viewer</h1>
        <p>Search resources across multiple AWS accounts using AWS Config</p>
        <div className="description">
          <p>Search EC2, VPC, RDS, Lambda, Load Balancer, Network Interface, SES, and CloudFront resources recorded in AWS Config Aggregator.</p>
          <p>Leave search fields empty to display all resources. Partial matching is supported.</p>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'ec2' ? 'active' : ''}`} onClick={() => setActiveTab('ec2')}>
          EC2 Instances
        </button>
        <button className={`tab ${activeTab === 'vpc' ? 'active' : ''}`} onClick={() => setActiveTab('vpc')}>
          VPCs
        </button>
        <button className={`tab ${activeTab === 'rds' ? 'active' : ''}`} onClick={() => setActiveTab('rds')}>
          RDS Instances
        </button>
        <button className={`tab ${activeTab === 'lambda' ? 'active' : ''}`} onClick={() => setActiveTab('lambda')}>
          Lambda Functions
        </button>
        <button className={`tab ${activeTab === 'lb' ? 'active' : ''}`} onClick={() => setActiveTab('lb')}>
          Load Balancers
        </button>
        <button className={`tab ${activeTab === 'eni' ? 'active' : ''}`} onClick={() => setActiveTab('eni')}>
          Network Interfaces
        </button>
        <button className={`tab ${activeTab === 'ses' ? 'active' : ''}`} onClick={() => setActiveTab('ses')}>
          SES Configuration Sets
        </button>
        <button className={`tab ${activeTab === 'cloudfront' ? 'active' : ''}`} onClick={() => setActiveTab('cloudfront')}>
          CloudFront Distributions
        </button>
      </div>

      {activeTab === 'ec2' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={ec2Search.accountId} onChange={(v) => setEc2Search({ ...ec2Search, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={ec2Search.region} onChange={(v) => setEc2Search({ ...ec2Search, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="Instance ID" value={ec2Search.instanceId} onChange={(v) => setEc2Search({ ...ec2Search, instanceId: v })} placeholder="i-0123456789" />
            <SearchInput label="IP Address" value={ec2Search.ipAddress} onChange={(v) => setEc2Search({ ...ec2Search, ipAddress: v })} placeholder="10.0.1.100" />
            <SearchInput label="Name Tag" value={ec2Search.name} onChange={(v) => setEc2Search({ ...ec2Search, name: v })} placeholder="web-server" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('ec2')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEc2Search(initialEC2Search)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedEC2Instances.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedEC2Instances.length} instance(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('name')}>
                        Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('instanceId')}>
                        Instance ID {sortKey === 'instanceId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('instanceType')}>
                        Type {sortKey === 'instanceType' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('privateIpAddress')}>
                        Private IP {sortKey === 'privateIpAddress' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEC2Instances.map((i) => (
                      <tr key={`${i.accountId}-${i.instanceId}`}>
                        <td>{i.name || '-'}</td>
                        <td className="monospace">{i.instanceId}</td>
                        <td className="monospace">{i.accountId}</td>
                        <td>{i.region}</td>
                        <td>{i.instanceType}</td>
                        <td className="monospace">{i.privateIpAddress || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display EC2 instances.<br />Leave fields empty to display all instances.</div>
          )}
        </>
      )}

      {activeTab === 'vpc' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={vpcSearch.accountId} onChange={(v) => setVpcSearch({ ...vpcSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={vpcSearch.region} onChange={(v) => setVpcSearch({ ...vpcSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="VPC ID" value={vpcSearch.vpcId} onChange={(v) => setVpcSearch({ ...vpcSearch, vpcId: v })} placeholder="vpc-0123456789" />
            <SearchInput label="CIDR Block" value={vpcSearch.cidr} onChange={(v) => setVpcSearch({ ...vpcSearch, cidr: v })} placeholder="10.0.0.0/16" />
            <SearchInput label="Name Tag" value={vpcSearch.name} onChange={(v) => setVpcSearch({ ...vpcSearch, name: v })} placeholder="main-vpc" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('vpc')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setVpcSearch(initialVPCSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedVPCs.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedVPCs.length} VPC(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('name')}>
                        Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('vpcId')}>
                        VPC ID {sortKey === 'vpcId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('cidrBlock')}>
                        CIDR Block {sortKey === 'cidrBlock' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('isDefault')}>
                        Default {sortKey === 'isDefault' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVPCs.map((v) => (
                      <tr key={`${v.accountId}-${v.vpcId}`}>
                        <td>{v.name || '-'}</td>
                        <td className="monospace">{v.vpcId}</td>
                        <td className="monospace">{v.accountId}</td>
                        <td>{v.region}</td>
                        <td className="monospace">{v.cidrBlock}</td>
                        <td>{v.isDefault && <span className="badge badge-default">Default</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display VPCs.<br />Leave fields empty to display all VPCs.</div>
          )}
        </>
      )}

      {activeTab === 'rds' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={rdsSearch.accountId} onChange={(v) => setRdsSearch({ ...rdsSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={rdsSearch.region} onChange={(v) => setRdsSearch({ ...rdsSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="DB Instance ID" value={rdsSearch.dbInstanceId} onChange={(v) => setRdsSearch({ ...rdsSearch, dbInstanceId: v })} placeholder="mydb-instance" />
            <SearchInput label="Name Tag" value={rdsSearch.name} onChange={(v) => setRdsSearch({ ...rdsSearch, name: v })} placeholder="production-db" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('rds')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setRdsSearch(initialRDSSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedRDSInstances.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedRDSInstances.length} RDS instance(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('name')}>
                        Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('dbInstanceId')}>
                        DB Instance ID {sortKey === 'dbInstanceId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('dbInstanceClass')}>
                        Instance Class {sortKey === 'dbInstanceClass' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('engine')}>
                        Engine {sortKey === 'engine' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRDSInstances.map((db) => (
                      <tr key={`${db.accountId}-${db.dbInstanceId}`}>
                        <td>{db.name || '-'}</td>
                        <td className="monospace">{db.dbInstanceId}</td>
                        <td className="monospace">{db.accountId}</td>
                        <td>{db.region}</td>
                        <td>{db.dbInstanceClass}</td>
                        <td>{db.engine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display RDS instances.<br />Leave fields empty to display all instances.</div>
          )}
        </>
      )}

      {activeTab === 'lambda' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={lambdaSearch.accountId} onChange={(v) => setLambdaSearch({ ...lambdaSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={lambdaSearch.region} onChange={(v) => setLambdaSearch({ ...lambdaSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="Function Name" value={lambdaSearch.functionName} onChange={(v) => setLambdaSearch({ ...lambdaSearch, functionName: v })} placeholder="my-function" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('lambda')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setLambdaSearch(initialLambdaSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedLambdaFunctions.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedLambdaFunctions.length} Lambda function(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('functionName')}>
                        Function Name {sortKey === 'functionName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('runtime')}>
                        Runtime {sortKey === 'runtime' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('memorySize')}>
                        Memory (MB) {sortKey === 'memorySize' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('lastModified')}>
                        Last Modified {sortKey === 'lastModified' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLambdaFunctions.map((fn) => (
                      <tr key={`${fn.accountId}-${fn.functionName}`}>
                        <td className="monospace">{fn.functionName}</td>
                        <td className="monospace">{fn.accountId}</td>
                        <td>{fn.region}</td>
                        <td>{fn.runtime}</td>
                        <td>{fn.memorySize}</td>
                        <td className="monospace">{fn.lastModified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display Lambda functions.<br />Leave fields empty to display all functions.</div>
          )}
        </>
      )}

      {activeTab === 'lb' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={lbSearch.accountId} onChange={(v) => setLbSearch({ ...lbSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={lbSearch.region} onChange={(v) => setLbSearch({ ...lbSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="Load Balancer Name" value={lbSearch.loadBalancerName} onChange={(v) => setLbSearch({ ...lbSearch, loadBalancerName: v })} placeholder="my-load-balancer" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('lb')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setLbSearch(initialLBSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedLoadBalancers.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedLoadBalancers.length} load balancer(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('loadBalancerName')}>
                        Name {sortKey === 'loadBalancerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('type')}>
                        Type {sortKey === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('dnsName')}>
                        DNS Name {sortKey === 'dnsName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('scheme')}>
                        Scheme {sortKey === 'scheme' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLoadBalancers.map((lb) => (
                      <tr key={`${lb.accountId}-${lb.loadBalancerName}`}>
                        <td>{lb.loadBalancerName}</td>
                        <td className="monospace">{lb.accountId}</td>
                        <td>{lb.region}</td>
                        <td>{lb.type}</td>
                        <td className="monospace">{lb.dnsName}</td>
                        <td>{lb.scheme}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display load balancers.<br />Leave fields empty to display all load balancers.</div>
          )}
        </>
      )}

      {activeTab === 'eni' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={eniSearch.accountId} onChange={(v) => setEniSearch({ ...eniSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={eniSearch.region} onChange={(v) => setEniSearch({ ...eniSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="Network Interface ID" value={eniSearch.networkInterfaceId} onChange={(v) => setEniSearch({ ...eniSearch, networkInterfaceId: v })} placeholder="eni-0123456789" />
            <SearchInput label="IP Address" value={eniSearch.ipAddress} onChange={(v) => setEniSearch({ ...eniSearch, ipAddress: v })} placeholder="10.0.1.100" />
            <SearchInput label="Subnet ID" value={eniSearch.subnetId} onChange={(v) => setEniSearch({ ...eniSearch, subnetId: v })} placeholder="subnet-0123456789" />
            <SearchInput label="VPC ID" value={eniSearch.vpcId} onChange={(v) => setEniSearch({ ...eniSearch, vpcId: v })} placeholder="vpc-0123456789" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('eni')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEniSearch(initialENISearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedNetworkInterfaces.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedNetworkInterfaces.length} network interface(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('networkInterfaceId')}>
                        Network Interface ID {sortKey === 'networkInterfaceId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('privateIpAddress')}>
                        Private IP {sortKey === 'privateIpAddress' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('subnetId')}>
                        Subnet ID {sortKey === 'subnetId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('vpcId')}>
                        VPC ID {sortKey === 'vpcId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('status')}>
                        Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('description')}>
                        Description {sortKey === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedNetworkInterfaces.map((eni) => (
                      <tr key={`${eni.accountId}-${eni.networkInterfaceId}`}>
                        <td className="monospace">{eni.networkInterfaceId}</td>
                        <td className="monospace">{eni.accountId}</td>
                        <td>{eni.region}</td>
                        <td className="monospace">{eni.privateIpAddress || '-'}</td>
                        <td className="monospace">{eni.subnetId}</td>
                        <td className="monospace">{eni.vpcId}</td>
                        <td>{eni.status}</td>
                        <td>{eni.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display network interfaces.<br />Leave fields empty to display all interfaces.</div>
          )}
        </>
      )}

      {activeTab === 'ses' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={sesSearch.accountId} onChange={(v) => setSesSearch({ ...sesSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={sesSearch.region} onChange={(v) => setSesSearch({ ...sesSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="Identity Name" value={sesSearch.identityName} onChange={(v) => setSesSearch({ ...sesSearch, identityName: v })} placeholder="example.com" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('ses')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setSesSearch(initialSESSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedSESIdentities.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedSESIdentities.length} SES identity/identities found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('identityName')}>
                        Identity Name {sortKey === 'identityName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('identityType')}>
                        Type {sortKey === 'identityType' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('verificationStatus')}>
                        Verification Status {sortKey === 'verificationStatus' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSESIdentities.map((ses) => (
                      <tr key={`${ses.accountId}-${ses.identityName}`}>
                        <td>{ses.identityName}</td>
                        <td className="monospace">{ses.accountId}</td>
                        <td>{ses.region}</td>
                        <td>{ses.identityType}</td>
                        <td>{ses.verificationStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display SES identities.<br />Leave fields empty to display all identities.</div>
          )}
        </>
      )}

      {activeTab === 'cloudfront' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={cloudfrontSearch.accountId} onChange={(v) => setCloudfrontSearch({ ...cloudfrontSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="Region" value={cloudfrontSearch.region} onChange={(v) => setCloudfrontSearch({ ...cloudfrontSearch, region: v })} placeholder="us-east-1" />
            <SearchInput label="Distribution ID" value={cloudfrontSearch.distributionId} onChange={(v) => setCloudfrontSearch({ ...cloudfrontSearch, distributionId: v })} placeholder="E123EXAMPLE" />
            <SearchInput label="Domain Name" value={cloudfrontSearch.domainName} onChange={(v) => setCloudfrontSearch({ ...cloudfrontSearch, domainName: v })} placeholder="d123example.cloudfront.net" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('cloudfront')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setCloudfrontSearch(initialCloudFrontSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedCloudFrontDistributions.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedCloudFrontDistributions.length} CloudFront distribution(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('distributionId')}>
                        Distribution ID {sortKey === 'distributionId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('domainName')}>
                        Domain Name {sortKey === 'domainName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('status')}>
                        Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('enabled')}>
                        Enabled {sortKey === 'enabled' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCloudFrontDistributions.map((cf) => (
                      <tr key={`${cf.accountId}-${cf.distributionId}`}>
                        <td className="monospace">{cf.distributionId}</td>
                        <td className="monospace">{cf.accountId}</td>
                        <td className="monospace">{cf.domainName}</td>
                        <td>{cf.status}</td>
                        <td>{cf.enabled ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display CloudFront distributions.<br />Leave fields empty to display all distributions.</div>
          )}
        </>
      )}
    </main>
  );
}
