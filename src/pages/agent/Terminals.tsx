import { useState } from 'react';
import { Table, Input, Select, Button, Space, Tag, Row, Col, Card, DatePicker } from 'antd';
import { SearchOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { cafeList } from '../../mock/data';
import CafeFormModal from '../../components/CafeFormModal';

export default function AgentTerminals() {
  const [filter, setFilter] = useState({ province: '', name: '', status: '', settle: '' });
  const [cafeModalOpen, setCafeModalOpen] = useState(false);

  const filtered = cafeList.filter((c) => {
    if (filter.province && c.province !== filter.province) return false;
    if (filter.name && !c.name.includes(filter.name)) return false;
    if (filter.status && c.status !== filter.status) return false;
    if (filter.settle && c.settleMode !== filter.settle) return false;
    return true;
  });

  const columns = [
    { title: '网吧 ID', dataIndex: 'id', width: 100, fixed: 'left' as const },
    { title: '网吧名称', dataIndex: 'name', width: 200, render: (v: string) => <a>{v}</a> },
    { title: '所在省份', dataIndex: 'province', width: 90 },
    {
      title: '结算方式',
      key: 'channel',
      width: 160,
      render: (_: any, r: any) =>
        r.channelCode ? (
          <Tag color="red" style={{ margin: 0 }}>✓ 区域结算</Tag>
        ) : (
          <Tag style={{ margin: 0 }}>⚠️ 全局结算</Tag>
        ),
    },
    {
      title: '终端数',
      dataIndex: 'terminalCount',
      width: 100,
      sorter: (a: any, b: any) => a.terminalCount - b.terminalCount,
      align: 'right' as const,
    },
    {
      title: '月活率',
      dataIndex: 'activeRate',
      width: 100,
      align: 'right' as const,
      render: (v: string) => <span style={{ color: parseFloat(v) >= 90 ? '#52C41A' : '#FAAD14' }}>{v}%</span>,
    },
    {
      title: '本月分成',
      dataIndex: 'monthIncome',
      width: 120,
      align: 'right' as const,
      render: (v: string) => <span className="money">¥ {v}</span>,
      sorter: (a: any, b: any) => parseFloat(a.monthIncome) - parseFloat(b.monthIncome),
    },
    { title: '菜单版本', dataIndex: 'menuVersion', width: 100 },
    { title: '上线时间', dataIndex: 'onlineDate', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) =>
        v === 'normal' ? <Tag color="success">🟢 正常</Tag> : <Tag color="error">🔴 异常</Tag>,
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right' as const,
      render: () => (
        <Space>
          <a>详情</a>
          <a>编辑</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>终端管理</h2>
        <Space>
          <Button icon={<ExportOutlined />}>批量导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeModalOpen(true)}>新增网吧</Button>
        </Space>
      </div>

      {/* 筛选区 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Select
              placeholder="所在省份"
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: '广东', label: '广东' },
                { value: '湖南', label: '湖南' },
                { value: '四川', label: '四川' },
                { value: '河南', label: '河南' },
                { value: '浙江', label: '浙江' },
                { value: '江苏', label: '江苏' },
              ]}
              onChange={(v) => setFilter({ ...filter, province: v || '' })}
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="网吧名称搜索"
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="状态"
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'normal', label: '正常' },
                { value: 'abnormal', label: '异常' },
              ]}
              onChange={(v) => setFilter({ ...filter, status: v || '' })}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="结算方式"
              style={{ width: '100%' }}
              allowClear
              options={[
                { value: 'regional', label: '✓ 区域结算' },
                { value: 'global', label: '⚠️ 全局结算' },
              ]}
              onChange={(v) => setFilter({ ...filter, settle: v || '' })}
            />
          </Col>
          <Col span={5}>
            <DatePicker.RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
          <Col span={3} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary">查询</Button>
              <Button onClick={() => setFilter({ province: '', name: '', status: '', settle: '' })}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>网吧总数</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{cafeList.length}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>区域结算网吧</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#52C41A' }}>
              {cafeList.filter((c) => c.channelCode).length}
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginLeft: 8 }}>
                ({((cafeList.filter((c) => c.channelCode).length / cafeList.length) * 100).toFixed(0)}%)
              </span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderLeft: '3px solid #FAAD14' }}>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>全局结算网吧 ⚠️</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#FAAD14' }}>
              {cafeList.filter((c) => !c.channelCode).length}
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginLeft: 8 }}>家</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>异常终端</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#F5222D' }}>
              {cafeList.filter((c) => c.status === 'abnormal').length}
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginLeft: 8 }}>
                ({((cafeList.filter((c) => c.status === 'abnormal').length / cafeList.length) * 100).toFixed(1)}%)
              </span>
            </div>
          </Card>
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

      <CafeFormModal open={cafeModalOpen} onClose={() => setCafeModalOpen(false)} />
    </div>
  );
}
