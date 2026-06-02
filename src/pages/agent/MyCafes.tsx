import { useState } from 'react';
import { Table, Button, Card, Tag, Space, Row, Col, Empty, Alert } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { getMyCafes } from '../../mock/data';
import CafeFormModal from '../../components/CafeFormModal';

export default function MyCafes() {
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const cafes = getMyCafes();

  const totalTerminals = cafes.reduce((s, c) => s + c.terminalCount, 0);
  const pendingCount = cafes.filter((c) => c.status === 'pending').length;

  const columns = [
    { title: '网吧 ID', dataIndex: 'id', width: 100 },
    { title: '网吧名称', dataIndex: 'name', width: 200, render: (v: string) => <a>{v}</a> },
    {
      title: '地址',
      key: 'addr',
      render: (_: any, r: any) => `${r.province}·${r.city} ${r.address}`,
    },
    { title: '终端数', dataIndex: 'terminalCount', width: 90, align: 'right' as const },
    { title: '联系人', dataIndex: 'contact', width: 90 },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
    {
      title: '结算方式', dataIndex: 'settleMode', width: 130,
      render: (v: string) => v === 'regional'
        ? <Tag color="red">✓ 区域结算</Tag>
        : <Tag>⚠️ 全局结算</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', width: 110,
      render: (v: string) => v === 'normal'
        ? <Tag color="success">🟢 已生效</Tag>
        : <Tag color="processing">⏳ 待审核</Tag>,
    },
    { title: '录入时间', dataIndex: 'createdAt', width: 120 },
    {
      title: '操作', width: 120,
      render: () => <Space><a>详情</a><a>编辑</a></Space>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>我的网吧</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>录入网吧</Button>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="录入你负责的网吧后，系统将其纳入结算体系。新录入网吧默认走「全局结算」，待运营审核并下发省渠道号后自动转为「区域结算」。"
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><div style={{ color: 'rgba(0,0,0,0.45)' }}>已录入网吧</div><div style={{ fontSize: 28, fontWeight: 600 }}>{cafes.length} <span style={{ fontSize: 14 }}>家</span></div></Card></Col>
        <Col span={8}><Card><div style={{ color: 'rgba(0,0,0,0.45)' }}>终端总数</div><div style={{ fontSize: 28, fontWeight: 600 }}>{totalTerminals} <span style={{ fontSize: 14 }}>台</span></div></Card></Col>
        <Col span={8}><Card style={{ borderLeft: '3px solid #FAAD14' }}><div style={{ color: 'rgba(0,0,0,0.45)' }}>待审核</div><div style={{ fontSize: 28, fontWeight: 600, color: '#FAAD14' }}>{pendingCount} <span style={{ fontSize: 14 }}>家</span></div></Card></Col>
      </Row>

      <Card>
        {cafes.length === 0 ? (
          <Empty image={<ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />} description="还没有录入网吧，点击右上角「录入网吧」开始">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>录入网吧</Button>
          </Empty>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={cafes} scroll={{ x: 1200 }} pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <CafeFormModal open={open} onClose={() => setOpen(false)} onSuccess={() => force((n) => n + 1)} />
    </div>
  );
}
