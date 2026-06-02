import { useState } from 'react';
import { Card, Table, Input, Select, Button, Space, Tag, Row, Col, Progress, Drawer, Descriptions, Statistic, Divider } from 'antd';
import { SearchOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { adminAgentList } from '../../mock/data';

export default function AdminAgents() {
  const [filter, setFilter] = useState<{ name?: string; province?: string; status?: string; tier?: string }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<any>(null);

  const filtered = adminAgentList.filter((a) => {
    if (filter.name && !a.name.includes(filter.name)) return false;
    if (filter.province && a.province !== filter.province) return false;
    if (filter.status && a.status !== filter.status) return false;
    if (filter.tier && a.tier !== filter.tier) return false;
    return true;
  });

  const columns = [
    { title: '代理 ID', dataIndex: 'id', width: 100, fixed: 'left' as const },
    {
      title: '代理名称', dataIndex: 'name', width: 180,
      render: (v: string, r: any) => <a onClick={() => { setCurrentAgent(r); setDrawerOpen(true); }}>{v}</a>,
    },
    { title: '联系人', dataIndex: 'contact', width: 100 },
    { title: '主营省份', dataIndex: 'province', width: 100 },
    { title: '网吧数', dataIndex: 'cafeCount', width: 100, sorter: (a: any, b: any) => a.cafeCount - b.cafeCount, align: 'right' as const },
    { title: '终端数', dataIndex: 'terminalCount', width: 110, render: (v: number) => v.toLocaleString(), align: 'right' as const },
    { title: '当前档位', dataIndex: 'tier', width: 110, render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: '本月 CPS', dataIndex: 'monthCps', width: 130, align: 'right' as const,
      render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span>,
      sorter: (a: any, b: any) => a.monthCps - b.monthCps,
    },
    {
      title: '保底完成度', dataIndex: 'guaranteePct', width: 160,
      render: (v: number) => (
        <Progress percent={v} size="small" strokeColor={v >= 80 ? '#52C41A' : v >= 50 ? '#1890FF' : '#FAAD14'} />
      ),
      sorter: (a: any, b: any) => a.guaranteePct - b.guaranteePct,
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (v: string) =>
        v === 'active' ? <Tag color="success">🟢 正常</Tag> : <Tag color="default">⚪ 冻结</Tag>,
    },
    { title: '合作起始', dataIndex: 'startDate', width: 110 },
    {
      title: '操作', width: 200, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Space>
          <a onClick={() => { setCurrentAgent(r); setDrawerOpen(true); }}>详情</a>
          <a>调整档位</a>
          <a style={{ color: '#F5222D' }}>{r.status === 'active' ? '冻结' : '解冻'}</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>代理管理</h2>
        <Space>
          <Button icon={<ExportOutlined />}>导出全部</Button>
          <Button type="primary" icon={<PlusOutlined />}>新增代理</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={5}>
            <Input placeholder="代理名称" prefix={<SearchOutlined />} allowClear onChange={(e) => setFilter({ ...filter, name: e.target.value })} />
          </Col>
          <Col span={4}>
            <Select placeholder="主营省份" style={{ width: '100%' }} allowClear
              options={[
                { value: '广东' }, { value: '四川' }, { value: '湖南' }, { value: '河南' }, { value: '浙江' }, { value: '江苏' },
              ].map((o) => ({ ...o, label: o.value }))}
              onChange={(v) => setFilter({ ...filter, province: v })}
            />
          </Col>
          <Col span={4}>
            <Select placeholder="档位" style={{ width: '100%' }} allowClear
              options={[
                { value: '前100家' }, { value: '前300家' }, { value: '前1000家' }, { value: '前2000家' },
              ].map((o) => ({ ...o, label: o.value }))}
              onChange={(v) => setFilter({ ...filter, tier: v })}
            />
          </Col>
          <Col span={4}>
            <Select placeholder="状态" style={{ width: '100%' }} allowClear
              options={[{ value: 'active', label: '正常' }, { value: 'frozen', label: '冻结' }]}
              onChange={(v) => setFilter({ ...filter, status: v })}
            />
          </Col>
          <Col span={7} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary">查询</Button>
              <Button onClick={() => setFilter({})}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="代理总数" value={adminAgentList.length} suffix="家" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="正常运营" value={adminAgentList.filter((a) => a.status === 'active').length} suffix="家" valueStyle={{ color: '#52C41A' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="本月已结 CPS" value={adminAgentList.reduce((s, a) => s + a.monthCps, 0)} prefix="¥" valueStyle={{ color: '#FF7A00' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="平均保底达成率" value={Math.round(adminAgentList.reduce((s, a) => s + a.guaranteePct, 0) / adminAgentList.length)} suffix="%" /></Card>
        </Col>
      </Row>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={`代理详情：${currentAgent?.name || ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
      >
        {currentAgent && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="代理 ID">{currentAgent.id}</Descriptions.Item>
              <Descriptions.Item label="联系人">{currentAgent.contact}</Descriptions.Item>
              <Descriptions.Item label="主营省份">{currentAgent.province}</Descriptions.Item>
              <Descriptions.Item label="合作起始">{currentAgent.startDate}</Descriptions.Item>
              <Descriptions.Item label="网吧数">{currentAgent.cafeCount}</Descriptions.Item>
              <Descriptions.Item label="终端数">{currentAgent.terminalCount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="当前档位">{currentAgent.tier}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {currentAgent.status === 'active' ? <Tag color="success">正常</Tag> : <Tag>冻结</Tag>}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <h4>📊 收益概况</h4>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="本月 CPS" value={currentAgent.monthCps} prefix="¥" valueStyle={{ color: '#FF7A00' }} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>保底完成度</div>
                  <Progress percent={currentAgent.guaranteePct} />
                </Card>
              </Col>
            </Row>
            <Divider />
            <h4>⚙️ 快捷操作</h4>
            <Space wrap>
              <Button>调整激励档位</Button>
              <Button>调整保底金额</Button>
              <Button>查看子账号</Button>
              <Button>下载合作合同</Button>
              <Button danger>{currentAgent.status === 'active' ? '冻结代理' : '解冻代理'}</Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}
