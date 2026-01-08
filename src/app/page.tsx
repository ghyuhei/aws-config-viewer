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
        <p>AWS Config を使用して複数アカウントのリソースを横断検索</p>
        <div className="description">
          <p>AWS Config Aggregator に記録されているEC2インスタンスとVPCを検索できます。</p>
          <p>検索条件を指定しない場合は全件表示されます。部分一致検索が可能です。</p>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'ec2' ? 'active' : ''}`} onClick={() => setActiveTab('ec2')}>
          EC2 インスタンス
        </button>
        <button className={`tab ${activeTab === 'vpc' ? 'active' : ''}`} onClick={() => setActiveTab('vpc')}>
          VPC
        </button>
      </div>

      {activeTab === 'ec2' && (
        <>
          <div className="search-form">
            <SearchInput label="アカウントID" value={ec2Search.accountId} onChange={(v) => setEc2Search({ ...ec2Search, accountId: v })} placeholder="123456789012" />
            <SearchInput label="リージョン" value={ec2Search.region} onChange={(v) => setEc2Search({ ...ec2Search, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="インスタンスID" value={ec2Search.instanceId} onChange={(v) => setEc2Search({ ...ec2Search, instanceId: v })} placeholder="i-0123456789" />
            <SearchInput label="IPアドレス" value={ec2Search.ipAddress} onChange={(v) => setEc2Search({ ...ec2Search, ipAddress: v })} placeholder="10.0.1.100" />
            <SearchInput label="名前タグ" value={ec2Search.name} onChange={(v) => setEc2Search({ ...ec2Search, name: v })} placeholder="web-server" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('ec2')} disabled={loading}>
                {loading ? '検索中...' : '検索'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEc2Search(initialEC2Search)}>クリア</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />検索中...</div>
          ) : sortedEC2Instances.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedEC2Instances.length} 件のインスタンスが見つかりました</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('name')}>
                        名前 {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('instanceId')}>
                        インスタンスID {sortKey === 'instanceId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        アカウントID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        リージョン {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('instanceType')}>
                        タイプ {sortKey === 'instanceType' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('privateIpAddress')}>
                        プライベートIP {sortKey === 'privateIpAddress' && (sortOrder === 'asc' ? '↑' : '↓')}
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
            <div className="empty">検索条件を入力して「検索」ボタンをクリックすると、EC2インスタンスが表示されます。<br />条件を指定しない場合は全件表示されます。</div>
          )}
        </>
      )}

      {activeTab === 'vpc' && (
        <>
          <div className="search-form">
            <SearchInput label="アカウントID" value={vpcSearch.accountId} onChange={(v) => setVpcSearch({ ...vpcSearch, accountId: v })} placeholder="123456789012" />
            <SearchInput label="リージョン" value={vpcSearch.region} onChange={(v) => setVpcSearch({ ...vpcSearch, region: v })} placeholder="ap-northeast-1" />
            <SearchInput label="VPC ID" value={vpcSearch.vpcId} onChange={(v) => setVpcSearch({ ...vpcSearch, vpcId: v })} placeholder="vpc-0123456789" />
            <SearchInput label="CIDRブロック" value={vpcSearch.cidr} onChange={(v) => setVpcSearch({ ...vpcSearch, cidr: v })} placeholder="10.0.0.0/16" />
            <SearchInput label="名前タグ" value={vpcSearch.name} onChange={(v) => setVpcSearch({ ...vpcSearch, name: v })} placeholder="main-vpc" />
            <div className="button-group">
              <button className="btn btn-primary" onClick={() => search('vpc')} disabled={loading}>
                {loading ? '検索中...' : '検索'}
              </button>
              <button className="btn btn-secondary" onClick={() => setVpcSearch(initialVPCSearch)}>クリア</button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading"><div className="spinner" />検索中...</div>
          ) : sortedVPCs.length > 0 ? (
            <>
              <div className="results-header">
                <span className="results-count">{sortedVPCs.length} 件のVPCが見つかりました</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('name')}>
                        名前 {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('vpcId')}>
                        VPC ID {sortKey === 'vpcId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('accountId')}>
                        アカウントID {sortKey === 'accountId' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('region')}>
                        リージョン {sortKey === 'region' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('cidrBlock')}>
                        CIDRブロック {sortKey === 'cidrBlock' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('isDefault')}>
                        デフォルト {sortKey === 'isDefault' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                        <td>{v.isDefault && <span className="badge badge-default">デフォルト</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">検索条件を入力して「検索」ボタンをクリックすると、VPCが表示されます。<br />条件を指定しない場合は全件表示されます。</div>
          )}
        </>
      )}
    </main>
  );
}
