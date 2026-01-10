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

interface S3Bucket {
  accountId: string;
  region: string;
  bucketName: string;
  creationDate: string;
  versioning: string;
  encryption: string;
}

interface IAMUser {
  accountId: string;
  region: string;
  userName: string;
  userId: string;
  arn: string;
  createDate: string;
}

type TabType = 'ec2' | 'vpc' | 'rds' | 'lambda' | 'lb' | 'eni' | 's3' | 'iam';
type SortKey = keyof EC2Instance | keyof VPC | keyof RDSInstance | keyof LambdaFunction | keyof LoadBalancer | keyof NetworkInterface | keyof S3Bucket | keyof IAMUser;
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

const initialS3Search = {
  accountId: '',
  region: '',
  bucketName: '',
};

const initialIAMSearch = {
  accountId: '',
  region: '',
  userName: '',
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
  const [s3Buckets, setS3Buckets] = useState<S3Bucket[]>([]);
  const [iamUsers, setIamUsers] = useState<IAMUser[]>([]);
  const [ec2Search, setEc2Search] = useState(initialEC2Search);
  const [vpcSearch, setVpcSearch] = useState(initialVPCSearch);
  const [rdsSearch, setRdsSearch] = useState(initialRDSSearch);
  const [lambdaSearch, setLambdaSearch] = useState(initialLambdaSearch);
  const [lbSearch, setLbSearch] = useState(initialLBSearch);
  const [eniSearch, setEniSearch] = useState(initialENISearch);
  const [s3Search, setS3Search] = useState(initialS3Search);
  const [iamSearch, setIamSearch] = useState(initialIAMSearch);
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
    const filtered = ec2Instances.filter((i) => {
      if (ec2Search.accountId && !i.accountId.toLowerCase().includes(ec2Search.accountId.toLowerCase())) return false;
      if (ec2Search.region && !i.region.toLowerCase().includes(ec2Search.region.toLowerCase())) return false;
      if (ec2Search.instanceId && !i.instanceId.toLowerCase().includes(ec2Search.instanceId.toLowerCase())) return false;
      if (ec2Search.name && !i.name.toLowerCase().includes(ec2Search.name.toLowerCase())) return false;
      if (ec2Search.ipAddress && !i.privateIpAddress.toLowerCase().includes(ec2Search.ipAddress.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof EC2Instance] || '';
      const bVal = b[sortKey as keyof EC2Instance] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [ec2Instances, ec2Search, sortKey, sortOrder]);

  const sortedVPCs = useMemo(() => {
    const filtered = vpcs.filter((v) => {
      if (vpcSearch.accountId && !v.accountId.toLowerCase().includes(vpcSearch.accountId.toLowerCase())) return false;
      if (vpcSearch.region && !v.region.toLowerCase().includes(vpcSearch.region.toLowerCase())) return false;
      if (vpcSearch.vpcId && !v.vpcId.toLowerCase().includes(vpcSearch.vpcId.toLowerCase())) return false;
      if (vpcSearch.cidr && !v.cidrBlock.toLowerCase().includes(vpcSearch.cidr.toLowerCase())) return false;
      if (vpcSearch.name && !v.name.toLowerCase().includes(vpcSearch.name.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof VPC] || '';
      const bVal = b[sortKey as keyof VPC] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vpcs, vpcSearch, sortKey, sortOrder]);

  const sortedRDSInstances = useMemo(() => {
    const filtered = rdsInstances.filter((db) => {
      if (rdsSearch.accountId && !db.accountId.toLowerCase().includes(rdsSearch.accountId.toLowerCase())) return false;
      if (rdsSearch.region && !db.region.toLowerCase().includes(rdsSearch.region.toLowerCase())) return false;
      if (rdsSearch.dbInstanceId && !db.dbInstanceId.toLowerCase().includes(rdsSearch.dbInstanceId.toLowerCase())) return false;
      if (rdsSearch.name && !db.name.toLowerCase().includes(rdsSearch.name.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof RDSInstance] || '';
      const bVal = b[sortKey as keyof RDSInstance] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rdsInstances, rdsSearch, sortKey, sortOrder]);

  const sortedLambdaFunctions = useMemo(() => {
    const filtered = lambdaFunctions.filter((fn) => {
      if (lambdaSearch.accountId && !fn.accountId.toLowerCase().includes(lambdaSearch.accountId.toLowerCase())) return false;
      if (lambdaSearch.region && !fn.region.toLowerCase().includes(lambdaSearch.region.toLowerCase())) return false;
      if (lambdaSearch.functionName && !fn.functionName.toLowerCase().includes(lambdaSearch.functionName.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof LambdaFunction] || '';
      const bVal = b[sortKey as keyof LambdaFunction] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [lambdaFunctions, lambdaSearch, sortKey, sortOrder]);

  const sortedLoadBalancers = useMemo(() => {
    const filtered = loadBalancers.filter((lb) => {
      if (lbSearch.accountId && !lb.accountId.toLowerCase().includes(lbSearch.accountId.toLowerCase())) return false;
      if (lbSearch.region && !lb.region.toLowerCase().includes(lbSearch.region.toLowerCase())) return false;
      if (lbSearch.loadBalancerName && !lb.loadBalancerName.toLowerCase().includes(lbSearch.loadBalancerName.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof LoadBalancer] || '';
      const bVal = b[sortKey as keyof LoadBalancer] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [loadBalancers, lbSearch, sortKey, sortOrder]);

  const sortedNetworkInterfaces = useMemo(() => {
    const filtered = networkInterfaces.filter((eni) => {
      if (eniSearch.accountId && !eni.accountId.toLowerCase().includes(eniSearch.accountId.toLowerCase())) return false;
      if (eniSearch.region && !eni.region.toLowerCase().includes(eniSearch.region.toLowerCase())) return false;
      if (eniSearch.networkInterfaceId && !eni.networkInterfaceId.toLowerCase().includes(eniSearch.networkInterfaceId.toLowerCase())) return false;
      if (eniSearch.ipAddress && !eni.privateIpAddress.toLowerCase().includes(eniSearch.ipAddress.toLowerCase())) return false;
      if (eniSearch.subnetId && !eni.subnetId.toLowerCase().includes(eniSearch.subnetId.toLowerCase())) return false;
      if (eniSearch.vpcId && !eni.vpcId.toLowerCase().includes(eniSearch.vpcId.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof NetworkInterface] || '';
      const bVal = b[sortKey as keyof NetworkInterface] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [networkInterfaces, eniSearch, sortKey, sortOrder]);

  const sortedS3Buckets = useMemo(() => {
    const filtered = s3Buckets.filter((bucket) => {
      if (s3Search.accountId && !bucket.accountId.toLowerCase().includes(s3Search.accountId.toLowerCase())) return false;
      if (s3Search.region && !bucket.region.toLowerCase().includes(s3Search.region.toLowerCase())) return false;
      if (s3Search.bucketName && !bucket.bucketName.toLowerCase().includes(s3Search.bucketName.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof S3Bucket] || '';
      const bVal = b[sortKey as keyof S3Bucket] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [s3Buckets, s3Search, sortKey, sortOrder]);

  const sortedIAMUsers = useMemo(() => {
    const filtered = iamUsers.filter((user) => {
      if (iamSearch.accountId && !user.accountId.toLowerCase().includes(iamSearch.accountId.toLowerCase())) return false;
      if (iamSearch.region && !user.region.toLowerCase().includes(iamSearch.region.toLowerCase())) return false;
      if (iamSearch.userName && !user.userName.toLowerCase().includes(iamSearch.userName.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof IAMUser] || '';
      const bVal = b[sortKey as keyof IAMUser] || '';

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [iamUsers, iamSearch, sortKey, sortOrder]);

  const search = useCallback(async (type: 'ec2' | 'vpc' | 'rds' | 'lambda' | 'lb' | 'eni' | 's3' | 'iam') => {
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
        case 's3':
          searchParams = s3Search;
          break;
        case 'iam':
          searchParams = iamSearch;
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
          case 's3':
            setS3Buckets(data.data);
            break;
          case 'iam':
            setIamUsers(data.data);
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
  }, [ec2Search, vpcSearch, rdsSearch, lambdaSearch, lbSearch, eniSearch, s3Search, iamSearch]);

  const exportToCSV = useCallback((data: unknown[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0] as Record<string, unknown>);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = (row as Record<string, unknown>)[header];
          // Escape values containing commas or quotes
          const stringValue = String(value ?? '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const RegionSelect = ({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="form-group">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Regions</option>
        <option value="ap-northeast-1">Tokyo (ap-northeast-1)</option>
        <option value="ap-northeast-3">Osaka (ap-northeast-3)</option>
        <option value="ap-southeast-1">Singapore (ap-southeast-1)</option>
        <option value="us-east-1">Virginia (us-east-1)</option>
        <option value="us-east-2">Ohio (us-east-2)</option>
        <option value="us-west-2">Oregon (us-west-2)</option>
        <option value="eu-central-1">Frankfurt (eu-central-1)</option>
      </select>
    </div>
  );

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
          <p>Search EC2, VPC, RDS, Lambda, Load Balancer, Network Interface, S3, and IAM User resources recorded in AWS Config Aggregator.</p>
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
        <button className={`tab ${activeTab === 's3' ? 'active' : ''}`} onClick={() => setActiveTab('s3')}>
          S3 Buckets
        </button>
        <button className={`tab ${activeTab === 'iam' ? 'active' : ''}`} onClick={() => setActiveTab('iam')}>
          IAM Users
        </button>
      </div>

      {activeTab === 'ec2' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={ec2Search.accountId} onChange={(v) => setEc2Search({ ...ec2Search, accountId: v })} placeholder="123456789012" />
            <RegionSelect label="Region" value={ec2Search.region} onChange={(v) => setEc2Search({ ...ec2Search, region: v })} />
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
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedEC2Instances, 'ec2-instances.csv')}>
                  Export CSV
                </button>
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
            <RegionSelect label="Region" value={vpcSearch.region} onChange={(v) => setVpcSearch({ ...vpcSearch, region: v })} />
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
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedVPCs, 'vpcs.csv')}>
                  Export CSV
                </button>
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
            <RegionSelect label="Region" value={rdsSearch.region} onChange={(v) => setRdsSearch({ ...rdsSearch, region: v })} />
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
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedRDSInstances, 'rds-instances.csv')}>
                  Export CSV
                </button>
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
            <RegionSelect label="Region" value={lambdaSearch.region} onChange={(v) => setLambdaSearch({ ...lambdaSearch, region: v })} />
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
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedLambdaFunctions, 'lambda-functions.csv')}>
                  Export CSV
                </button>
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
            <RegionSelect label="Region" value={lbSearch.region} onChange={(v) => setLbSearch({ ...lbSearch, region: v })} />
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
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedLoadBalancers, 'load-balancers.csv')}>
                  Export CSV
                </button>
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
            <RegionSelect label="Region" value={eniSearch.region} onChange={(v) => setEniSearch({ ...eniSearch, region: v })} />
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
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedNetworkInterfaces, 'network-interfaces.csv')}>
                  Export CSV
                </button>
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

      {activeTab === 's3' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={s3Search.accountId} onChange={(v) => setS3Search({ ...s3Search, accountId: v })} placeholder="123456789012" />
            <RegionSelect label="Region" value={s3Search.region} onChange={(v) => setS3Search({ ...s3Search, region: v })} />
            <SearchInput label="Bucket Name" value={s3Search.bucketName} onChange={(v) => setS3Search({ ...s3Search, bucketName: v })} placeholder="my-bucket" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('s3')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setS3Search(initialS3Search)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedS3Buckets.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedS3Buckets.length} S3 bucket(s) found</span>
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedS3Buckets, 's3-buckets.csv')}>
                  Export CSV
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('bucketName')}>
                        Bucket Name {sortKey === 'bucketName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('creationDate')}>
                        Creation Date {sortKey === 'creationDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('versioning')}>
                        Versioning {sortKey === 'versioning' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('encryption')}>
                        Encryption {sortKey === 'encryption' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedS3Buckets.map((bucket) => (
                      <tr key={`${bucket.accountId}-${bucket.bucketName}`}>
                        <td className="monospace">{bucket.bucketName}</td>
                        <td className="monospace">{bucket.accountId}</td>
                        <td>{bucket.region}</td>
                        <td>{bucket.creationDate}</td>
                        <td>{bucket.versioning}</td>
                        <td>{bucket.encryption}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display S3 buckets.<br />Leave fields empty to display all buckets.</div>
          )}
        </>
      )}

      {activeTab === 'iam' && (
        <>
          <div className="search-form">
            <SearchInput label="Account ID" value={iamSearch.accountId} onChange={(v) => setIamSearch({ ...iamSearch, accountId: v })} placeholder="123456789012" />
            <RegionSelect label="Region" value={iamSearch.region} onChange={(v) => setIamSearch({ ...iamSearch, region: v })} />
            <SearchInput label="User Name" value={iamSearch.userName} onChange={(v) => setIamSearch({ ...iamSearch, userName: v })} placeholder="admin" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('iam')} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button className="btn btn-secondary" onClick={() => setIamSearch(initialIAMSearch)}>Clear</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />Searching...</div>
          ) : sortedIAMUsers.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedIAMUsers.length} IAM user(s) found</span>
                <button className="btn btn-secondary" onClick={() => exportToCSV(sortedIAMUsers, 'iam-users.csv')}>
                  Export CSV
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('userName')}>
                        User Name {sortKey === 'userName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        Account ID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        Region {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('userId')}>
                        User ID {sortKey === 'userId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('arn')}>
                        ARN {sortKey === 'arn' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('createDate')}>
                        Create Date {sortKey === 'createDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedIAMUsers.map((user) => (
                      <tr key={`${user.accountId}-${user.userName}`}>
                        <td>{user.userName}</td>
                        <td className="monospace">{user.accountId}</td>
                        <td>{user.region}</td>
                        <td className="monospace">{user.userId}</td>
                        <td className="monospace">{user.arn}</td>
                        <td>{user.createDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to display IAM users.<br />Leave fields empty to display all users.</div>
          )}
        </>
      )}
    </main>
  );
}
