import { Card, Tabs, Row, Col, Table, Tag, Button, DatePicker, Space, Statistic, Divider } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { billingHistory, unitPrice, agentInfo, installAnnuity } from '../../mock/data';

export default function AgentBilling() {
  // 收益构成：两大核心来源 —— 首装激励（按月分摊） + CPS 分成
  // 口径：单台终端首装激励 ¥50，分 12 个月发放（每月 ≈¥4.17/台）；CPS 按用户活跃流水分成
  const installThisMonth = installAnnuity.thisMonthAmount;
  const installRemaining = installAnnuity.totalRemaining;
  const cpsThisMonth = Math.round(agentInfo.terminalCount * unitPrice.cpsPerTerminalMonth * 100) / 100;

  const composition = [
    {
      name: '首装激励（按月分摊）',
      value: installThisMonth,
      color: '#FF2E3E',
      desc: `一次性 ¥${unitPrice.installTotal}/台 → 分 ${unitPrice.installMonths} 个月发放（每月 ¥${unitPrice.installPerMonth}/台）`,
      detail: [
        { name: `· 本期分摊（${installAnnuity.inAnnuityTerminals.toLocaleString()} 台 × ¥${unitPrice.installPerMonth}）`, value: installThisMonth },
        { name: `· 平均剩余 ${installAnnuity.avgRemainingMonths} 个月待分摊`, value: installRemaining },
      ],
    },
    {
      name: 'CPS 分成',
      value: cpsThisMonth,
      color: '#8C8C8C',
      desc: `按用户活跃 / 充值流水分成（¥${unitPrice.cpsPerTerminalMonth}/台·月）`,
      detail: [
        { name: `· 本月 CPS 分成（${agentInfo.terminalCount.toLocaleString()} 台 × ¥${unitPrice.cpsPerTerminalMonth}）`, value: cpsThisMonth },
      ],
    },
  ];

  const totalAmount = composition.reduce((s, c) => s + c.value, 0);

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: {
      orient: 'vertical',
      left: 'left',
      bottom: 0,
      textStyle: { color: 'rgba(255,255,255,0.65)' },
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['65%', '50%'],
        data: composition.map((c) => ({ name: c.name, value: c.value, itemStyle: { color: c.color } })),
        label: {
          formatter: '{b}\n¥{c}',
          fontSize: 12,
          color: 'rgba(255,255,255,0.75)',
          textBorderColor: 'transparent',
          textBorderWidth: 0,
          lineHeight: 16,
        },
        labelLine: {
          lineStyle: { color: 'rgba(255,255,255,0.25)' },
        },
        itemStyle: { borderColor: '#1A1212', borderWidth: 2 },
      },
    ],
  };

  const historyColumns = [
    { title: '账期', dataIndex: 'period', width: 120 },
    {
      title: '应结金额',
      dataIndex: 'amount',
      width: 140,
      align: 'right' as const,
      render: (v: number) => <span className="money">¥ {v.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>,
    },
    {
      title: '代扣税费',
      dataIndex: 'tax',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: 'rgba(0,0,0,0.45)' }}>-¥ {v.toFixed(2)}</span>,
    },
    {
      title: '实际到账',
      dataIndex: 'paid',
      width: 140,
      align: 'right' as const,
      render: (v: number) =>
        v > 0 ? <span className="money">¥ {v.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span> : '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (v: string) =>
        v === 'paid' ? <Tag color="success">🟢 已结清</Tag> : <Tag color="processing">🟡 处理中</Tag>,
    },
    {
      title: '操作',
      width: 160,
      render: () => (
        <Space>
          <a><DownloadOutlined /> 下载 PDF</a>
          <a>详情</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>财务结算</h2>
        <Space>
          <DatePicker picker="month" defaultValue={undefined} placeholder="选择账期" />
          <Button icon={<FileExcelOutlined />}>导出全部</Button>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="bill"
        items={[
          {
            key: 'bill',
            label: '月度账单',
            children: (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
                    <Col>
                      <Space>
                        <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>账期：2026-05</Tag>
                        <Tag color="default" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'transparent', color: 'rgba(255,255,255,0.85)' }}>
                          📅 结算日 {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10)}
                        </Tag>
                        <Tag color="success">📋 已生成</Tag>
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Button icon={<DownloadOutlined />}>下载 PDF</Button>
                        <Button icon={<FileExcelOutlined />}>下载明细 Excel</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Row gutter={32}>
                    <Col span={12}>
                      <h4 style={{ marginTop: 0 }}>收益构成（首装激励 + CPS 分成）</h4>
                      <ReactECharts option={pieOption} style={{ height: 280 }} />
                    </Col>
                    <Col span={12}>
                      <h4 style={{ marginTop: 0 }}>金额明细</h4>
                      <Card type="inner" style={{ background: '#1A1212' }}>
                        {composition.map((c) => (
                          <div key={c.name} style={{ marginBottom: 14 }}>
                            <Row justify="space-between" align="middle">
                              <Col>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: 4,
                                    height: 14,
                                    background: c.color,
                                    marginRight: 8,
                                    verticalAlign: 'middle',
                                    borderRadius: 2,
                                  }}
                                />
                                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{c.name}</span>
                              </Col>
                              <Col className="money">¥ {c.value.toFixed(2)}</Col>
                            </Row>
                            <div
                              style={{
                                color: 'rgba(255,255,255,0.45)',
                                fontSize: 12,
                                marginLeft: 12,
                                marginTop: 4,
                                marginBottom: 6,
                              }}
                            >
                              {c.desc}
                            </div>
                            {c.detail.map((d) => (
                              <Row
                                justify="space-between"
                                key={d.name}
                                style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}
                              >
                                <Col>{d.name}</Col>
                                <Col>¥ {d.value.toFixed(2)}</Col>
                              </Row>
                            ))}
                          </div>
                        ))}
                        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.12)' }} />
                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                          <Col>本月应结金额</Col>
                          <Col><Statistic value={totalAmount} precision={2} prefix="¥" valueStyle={{ fontSize: 20, color: '#fff' }} /></Col>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: 8 }}>
                          <Col style={{ color: 'rgba(255,255,255,0.45)' }}>平台代扣个税 (3%)</Col>
                          <Col style={{ color: 'rgba(255,255,255,0.45)' }}>-¥ {(totalAmount * 0.03).toFixed(2)}</Col>
                        </Row>
                        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.12)' }} />
                        <Row justify="space-between">
                          <Col><strong>实际到账金额</strong></Col>
                          <Col><Statistic value={totalAmount * 0.97} precision={2} prefix="¥" valueStyle={{ fontSize: 24, color: '#FF2E3E', fontWeight: 700 }} /></Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </Card>

                <Card title="历史账单">
                  <Table
                    rowKey="period"
                    columns={historyColumns}
                    dataSource={billingHistory}
                    pagination={false}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'annuity',
            label: '首装分摊计划',
            children: (
              <Card>
                <p style={{ color: 'rgba(255,255,255,0.65)' }}>
                  📋 首装激励一次性奖励 ¥{unitPrice.installTotal}/台，分 {unitPrice.installMonths} 个月按月发放（每月 ¥{unitPrice.installPerMonth}/台）。
                </p>
                <Table
                  rowKey="month"
                  pagination={false}
                  columns={[
                    { title: '分摊月份', dataIndex: 'month', width: 140 },
                    { title: '在分摊终端数', dataIndex: 'terminals', width: 160, align: 'right' as const,
                      render: (v: number) => v.toLocaleString() + ' 台' },
                    { title: '本月分摊金额', dataIndex: 'amount', width: 160, align: 'right' as const,
                      render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
                    { title: '已发放', dataIndex: 'paid', width: 120,
                      render: (v: boolean) => v ? <Tag color="success">已发放</Tag> : <Tag color="processing">待发放</Tag> },
                  ]}
                  dataSource={[
                    { month: '2026-01', terminals: 1800, amount: Math.round(1800 * unitPrice.installPerMonth * 100) / 100, paid: true },
                    { month: '2026-02', terminals: 2900, amount: Math.round(2900 * unitPrice.installPerMonth * 100) / 100, paid: true },
                    { month: '2026-03', terminals: 3800, amount: Math.round(3800 * unitPrice.installPerMonth * 100) / 100, paid: true },
                    { month: '2026-04', terminals: 4400, amount: Math.round(4400 * unitPrice.installPerMonth * 100) / 100, paid: true },
                    { month: '2026-05', terminals: 4600, amount: Math.round(4600 * unitPrice.installPerMonth * 100) / 100, paid: false },
                    { month: '2026-06', terminals: 4600, amount: Math.round(4600 * unitPrice.installPerMonth * 100) / 100, paid: false },
                    { month: '2026-07', terminals: 4500, amount: Math.round(4500 * unitPrice.installPerMonth * 100) / 100, paid: false },
                    { month: '2026-08', terminals: 4300, amount: Math.round(4300 * unitPrice.installPerMonth * 100) / 100, paid: false },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
