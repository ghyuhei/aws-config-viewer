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

type TabType = 'ec2' | 'vpc';
type SortKey = keyof EC2Instance | keyof VPC;
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('ec2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ec2Instances, setEc2Instances] = useState<EC2Instance[]>([]);
  const [vpcs, setVpcs] = useState<VPC[]>([]);
  const [ec2Search, setEc2Search] = useState(initialEC2Search);
  const [vpcSearch, setVpcSearch] = useState(initialVPCSearch);
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

  const search = useCallback(async (type: 'ec2' | 'vpc') => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = type === 'ec2' ? ec2Search : vpcSearch;
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => v && params.append(k, v));

      const res = await fetch(`/api/${type}?${params}`);
      const data = await res.json();

      if (data.success) {
        type === 'ec2' ? setEc2Instances(data.data) : setVpcs(data.data);
      } else {
        setError(data.error || 'Failed to fetch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [ec2Search, vpcSearch]);

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
          <p>Search EC2 instances and VPCs recorded in AWS Config Aggregator.</p>
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
    </main>
  );
}
