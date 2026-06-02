import { Row, Col, Card, Table, Tag, Space, Statistic, Alert } from 'antd';
import { ShopOutlined, DesktopOutlined, DollarOutlined, ClockCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { adminGlobalStats, topAgents } from '../../mock/data';

export default function AdminDashboard() {
  // 全国月收益趋势（模拟12个月）
  const monthlyTrend = Array.from({ length: 12 }).map((_, i) => ({
    month: `${i + 1}月`,
    actual: Math.round(180000 + i * 22000 + Math.random() * 30000),
    predict: Math.round(190000 + i * 24000),
  }));

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['实际收益', '预测收益'],
      right: 16,
      textStyle: { color: 'rgba(255,255,255,0.65)' },
    },
    grid: { left: 60, right: 16, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: monthlyTrend.map((d) => d.month),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '¥{value}', color: 'rgba(255,255,255,0.55)' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series: [
      { name: '实际收益', type: 'bar', data: monthlyTrend.map((d) => d.actual), itemStyle: { color: '#FF2E3E', borderRadius: [4, 4, 0, 0] } },
      { name: '预测收益', type: 'line', smooth: true, data: monthlyTrend.map((d) => d.predict), itemStyle: { color: '#8C8C8C' }, lineStyle: { color: '#8C8C8C' } },
    ],
  };

  // 全国地图热力（用柱状图模拟）
  const provinceData = [
    { name: '广东', value: 187 },
    { name: '四川', value: 158 },
    { name: '湖南', value: 142 },
    { name: '河南', value: 128 },
    { name: '浙江', value: 95 },
    { name: '江苏', value: 88 },
    { name: '湖北', value: 75 },
    { name: '山东', value: 72 },
    { name: '其他', value: 342 },
  ];

  const provinceOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 16, top: 16, bottom: 30 },
    xAxis: {
      type: 'category',
      data: provinceData.map((d) => d.name),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series: [
      {
        type: 'bar',
        data: provinceData.map((d) => d.value),
        itemStyle: {
          color: (p: any) => {
            // 红色饱和度从高到低的单色阶梯（前几名最红，长尾偏灰）
            const colors = ['#FF2E3E', '#E0303C', '#C41E2A', '#A01A24', '#7A1820', '#5C5C5C', '#4A4A4A', '#3A3A3A', '#2A2A2A'];
            return colors[Math.min(p.dataIndex, colors.length - 1)];
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 32,
      },
    ],
  };

  // Top 代理
  const topAgentColumns = [
    { title: '排名', render: (_: any, __: any, i: number) => (
      <Tag color={i < 3 ? 'gold' : 'default'}>{i + 1}</Tag>
    ) },
    { title: '代理名称', dataIndex: 'name', render: (v: string) => <a>{v}</a> },
    { title: '主营省份', dataIndex: 'province' },
    { title: '网吧数', dataIndex: 'cafe', align: 'right' as const },
    { title: '终端数', dataIndex: 'terminal', align: 'right' as const, render: (v: number) => v.toLocaleString() },
    { title: '本月 CPS', dataIndex: 'cps', align: 'right' as const, render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>全局看板</h2>
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13, marginTop: 4 }}>实时数据更新于 2026-05-18 14:30</div>
        </div>
      </div>

      {/* Hero 卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title={<><ShopOutlined /> 全国合作网吧</>} value={adminGlobalStats.cafeCount} suffix="家" valueStyle={{ color: '#722ED1', fontSize: 28 }} />
            <div style={{ marginTop: 8, color: '#52C41A', fontSize: 12 }}>
              <ArrowUpOutlined /> 较上月 +124 家
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={<><DesktopOutlined /> 覆盖终端数</>} value={adminGlobalStats.terminalCount} valueStyle={{ color: '#722ED1', fontSize: 28 }} />
            <div style={{ marginTop: 8, color: '#52C41A', fontSize: 12 }}>
              <ArrowUpOutlined /> 月活率 78.5%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={<><DollarOutlined /> 本月 CPS 总额</>} value={adminGlobalStats.monthCps} prefix="¥" valueStyle={{ color: '#FF7A00', fontSize: 28 }} />
            <div style={{ marginTop: 8, color: '#52C41A', fontSize: 12 }}>
              <ArrowUpOutlined /> 较上月 +6.2%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={<><ClockCircleOutlined /> 待结算金额</>} value={adminGlobalStats.pendingSettle} prefix="¥" valueStyle={{ color: '#FAAD14', fontSize: 28 }} />
            <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              代理 ¥38,000 + 网吧主 ¥10,000
            </div>
          </Card>
        </Col>
      </Row>

      {/* 异常告警 */}
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <Space>
            <strong>⚠️ 风控告警 3 条待处理：</strong>
            <span>代理"星辰"5 台终端硬件指纹完全一致；代理"鏖战"100 台终端共用 8 个出口 IP；网吧 CC003 24 小时内新增终端 +200%</span>
            <a>立即处理 →</a>
          </Space>
        }
      />

      {/* 趋势图 + 省份分布 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card title="📈 全国月度收益趋势（实际 vs 预测）">
            <ReactECharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="🗺 省份网吧密度分布 Top9">
            <ReactECharts option={provinceOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* Top 代理 + 异常告警列表 */}
      <Row gutter={16}>
        <Col span={14}>
          <Card title="🏆 Top 5 代理排行">
            <Table
              columns={topAgentColumns}
              dataSource={topAgents}
              pagination={false}
              size="middle"
              rowKey="name"
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="🚨 异常告警 Feed">
            {[
              { time: '14:32', type: 'error', text: '设备指纹重复（代理 "星辰"，5 台终端）', risk: 85 },
              { time: '14:20', type: 'warning', text: '日活突增（网吧 CC003 +200%）', risk: 72 },
              { time: '13:45', type: 'info', text: 'IP 重复（代理 "鏖战"，已豁免）', risk: 45 },
              { time: '12:30', type: 'error', text: '高频 UID 切换（终端 PC-9824）', risk: 88 },
              { time: '11:15', type: 'warning', text: '提现频次异常（蜀风传媒，本月第 5 次）', risk: 65 },
            ].map((a, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px dashed #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: 'rgba(0,0,0,0.35)', marginRight: 8 }}>{a.time}</span>
                  {a.type === 'error' && <Tag color="error">高危</Tag>}
                  {a.type === 'warning' && <Tag color="warning">中危</Tag>}
                  {a.type === 'info' && <Tag>低危</Tag>}
                  <span style={{ marginLeft: 8 }}>{a.text}</span>
                </div>
                <Tag color={a.risk >= 80 ? 'red' : a.risk >= 60 ? 'orange' : 'default'}>风险 {a.risk}</Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
