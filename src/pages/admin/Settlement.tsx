import { Card, Tabs, Table, Tag, Button, Space, Modal, message, Alert, Statistic, Row, Col, Steps } from 'antd';
import { CalculatorOutlined, ReloadOutlined, FileExcelOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { settlementBatches } from '../../mock/data';

export default function AdminSettlement() {
  const [recalcOpen, setRecalcOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const onRecalc = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setRecalcOpen(false);
      message.success('结算重算已完成，本次差异 ¥0');
    }, 2000);
  };

  const batchColumns = [
    { title: '账期', dataIndex: 'period', width: 110 },
    {
      title: '状态', dataIndex: 'status', width: 130,
      render: (v: string) =>
        v === 'paid' ? <Tag color="success">🟢 已结清</Tag> :
          v === 'generated' ? <Tag color="processing">🔵 已生成</Tag> :
            <Tag color="default">未开始</Tag>,
    },
    { title: '计算开始时间', dataIndex: 'startTime', width: 180 },
    { title: '计算耗时', dataIndex: 'cost', width: 110 },
    {
      title: '涉及金额', dataIndex: 'amount', width: 150, align: 'right' as const,
      render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span>,
    },
    {
      title: '异常笔数', dataIndex: 'exception', width: 110, align: 'right' as const,
      render: (v: number) => v === 0 ? <Tag color="success">0</Tag> : <Tag color="warning">{v}</Tag>,
    },
    {
      title: '操作', width: 220,
      render: () => (
        <Space>
          <a><FileExcelOutlined /> 明细</a>
          <a>账单详情</a>
          <a style={{ color: '#F5222D' }} onClick={() => setRecalcOpen(true)}>重算</a>
        </Space>
      ),
    },
  ];

  const reconcileData = [
    { date: '2026-05-18', diyue: 12820, yyb: 12820, project: 12820, diff: 0, status: 'ok' },
    { date: '2026-05-17', diyue: 11500, yyb: 11520, project: 11500, diff: -20, status: 'warning' },
    { date: '2026-05-16', diyue: 12100, yyb: 12100, project: 12100, diff: 0, status: 'ok' },
    { date: '2026-05-15', diyue: 13250, yyb: 13230, project: 13250, diff: 20, status: 'warning' },
    { date: '2026-05-14', diyue: 11890, yyb: 11890, project: 11890, diff: 0, status: 'ok' },
  ];

  const reconcileColumns = [
    { title: '日期', dataIndex: 'date', width: 120 },
    { title: '迪越上报', dataIndex: 'diyue', align: 'right' as const, render: (v: number) => `¥ ${v.toLocaleString()}` },
    { title: '应用宝 CPS', dataIndex: 'yyb', align: 'right' as const, render: (v: number) => `¥ ${v.toLocaleString()}` },
    { title: '项目组结算', dataIndex: 'project', align: 'right' as const, render: (v: number) => `¥ ${v.toLocaleString()}` },
    {
      title: '差异', dataIndex: 'diff', align: 'right' as const,
      render: (v: number) => v === 0 ? <span style={{ color: '#52C41A' }}>¥ 0</span> : <span style={{ color: '#F5222D' }}>¥ {v}</span>,
    },
    {
      title: '状态', dataIndex: 'status', width: 110,
      render: (v: string) => v === 'ok' ? <Tag color="success">✅ 一致</Tag> : <Tag color="warning">⚠️ 待核对</Tag>,
    },
    {
      title: '操作', width: 140,
      render: (_: any, r: any) => r.status === 'warning' ? <a>核对差异</a> : <a>明细</a>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>结算引擎</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => setRecalcOpen(true)}>触发重算</Button>
          <Button type="primary" icon={<CalculatorOutlined />}>立即结算下一批</Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        message="结算引擎采用月结模式：每月 1 日 0:05 自动启动结算计算，财务审核通过后于 5 日内打款。"
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="本月已结金额" value={385200} prefix="¥" valueStyle={{ color: '#FF7A00' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待结算金额" value={48000} prefix="¥" valueStyle={{ color: '#FAAD14' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="累计结算金额" value={1820400} prefix="¥" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="结算成功率" value={99.84} suffix="%" valueStyle={{ color: '#52C41A' }} /></Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          defaultActiveKey="batch"
          items={[
            {
              key: 'batch',
              label: '月度结算批次',
              children: (
                <Table rowKey="period" columns={batchColumns} dataSource={settlementBatches} pagination={false} />
              ),
            },
            {
              key: 'reconcile',
              label: '日度三方对账',
              children: (
                <>
                  <Alert
                    type="warning"
                    message="发现 5/15 与 5/17 三方对账存在差异，请财务团队核对"
                    style={{ marginBottom: 16 }}
                    showIcon
                  />
                  <Table rowKey="date" columns={reconcileColumns} dataSource={reconcileData} pagination={false} />
                </>
              ),
            },
            {
              key: 'manual',
              label: '手动调账',
              children: (
                <div style={{ padding: 24, textAlign: 'center', color: 'rgba(0,0,0,0.45)' }}>
                  <p>手动调账需要双人复核，请先发起调账申请</p>
                  <Button type="primary">发起调账申请</Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="⚠️ 结算重算（高风险操作）"
        open={recalcOpen}
        onCancel={() => setRecalcOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setRecalcOpen(false)}>取消</Button>
            <Button type="primary" danger loading={running} onClick={onRecalc} icon={<CheckCircleOutlined />}>
              确认重算
            </Button>
          </Space>
        }
        width={520}
      >
        <Alert
          type="warning"
          message="本操作将重新计算选定账期的结算金额，可能影响代理已收到的结算结果。"
          description="操作日志将留档审计，需要 P0 权限 + 二次审批后才可执行"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Steps
          current={running ? 1 : 0}
          size="small"
          items={[
            { title: '提交申请' },
            { title: '上级审批' },
            { title: '执行重算' },
            { title: '推送对账' },
          ]}
        />
      </Modal>
    </div>
  );
}
