'use client';

import { useState, useCallback } from 'react';

interface EC2Instance {
  accountId: string;
  region: string;
  instanceId: string;
  privateIpAddress: string;
  publicIpAddress: string;
  name: string;
  instanceType: string;
  state: string;
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
        <p>Search EC2 instances and VPCs across AWS accounts</p>
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
            <div className="loading"><div className="spinner" />Loading...</div>
          ) : ec2Instances.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{ec2Instances.length} instance(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Instance ID</th>
                      <th>Account ID</th>
                      <th>Region</th>
                      <th>Type</th>
                      <th>State</th>
                      <th>Private IP</th>
                      <th>Public IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ec2Instances.map((i) => (
                      <tr key={`${i.accountId}-${i.instanceId}`}>
                        <td>{i.name || '-'}</td>
                        <td className="monospace">{i.instanceId}</td>
                        <td className="monospace">{i.accountId}</td>
                        <td>{i.region}</td>
                        <td>{i.instanceType}</td>
                        <td><span className={`badge ${i.state === 'running' ? 'badge-running' : 'badge-stopped'}`}>{i.state}</span></td>
                        <td className="monospace">{i.privateIpAddress || '-'}</td>
                        <td className="monospace">{i.publicIpAddress || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">Enter search criteria and click Search to list EC2 instances.</div>
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
            <div className="loading"><div className="spinner" />Loading...</div>
          ) : vpcs.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{vpcs.length} VPC(s) found</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>VPC ID</th>
                      <th>Account ID</th>
                      <th>Region</th>
                      <th>CIDR Block</th>
                      <th>Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vpcs.map((v) => (
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
            <div className="empty">Enter search criteria and click Search to list VPCs.</div>
          )}
        </>
      )}
    </main>
  );
}
