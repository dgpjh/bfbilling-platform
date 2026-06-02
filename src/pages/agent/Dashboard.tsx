import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Row, Col, Tag, Tooltip, Button, Space, Table, Progress, Alert } from 'antd';
import {
  WalletOutlined,
  RiseOutlined,
  ShopOutlined,
  DollarOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import CafeFormModal from '../../components/CafeFormModal';
import {
  agentInfo,
  ownerInfo,
  currentRole,
  heroStats,
  unitPrice,
  installAnnuity,
  settlementCycle,
  incomeTrend,
  cafeProvinceDistribution,
  recentFeed,
  provinceMatrix,
  globalPoolStats,
} from '../../mock/data';

export default function AgentDashboard() {
  // 当前身份对应的展示信息
  const isAgent = currentRole === 'agent';
  const me = isAgent ? agentInfo : ownerInfo;
  const roleLabel = isAgent ? '代理' : '网吧主';

  // 注册后引导：URL 带 ?from=register 时提示录入网吧
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromRegister = params.get('from') === 'register';
  const [cafeModalOpen, setCafeModalOpen] = useState(false);

  // 收益趋势图配置（首装分摊 + CPS 两条线）
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['CPS 分成', '首装激励（分摊）'],
      right: 16,
      top: 0,
      textStyle: { color: 'rgba(255,255,255,0.65)' },
    },
    grid: { left: 40, right: 16, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: incomeTrend.map((d) => d.date),
      boundaryGap: false,
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
        name: 'CPS 分成',
        type: 'line',
        smooth: true,
        data: incomeTrend.map((d) => d.cps),
        itemStyle: { color: '#FF2E3E' },
        lineStyle: { color: '#FF2E3E' },
        areaStyle: { color: 'rgba(255,46,62,0.12)' },
      },
      {
        name: '首装激励（分摊）',
        type: 'line',
        smooth: true,
        data: incomeTrend.map((d) => d.incentive),
        itemStyle: { color: '#8C8C8C' },
        lineStyle: { color: '#8C8C8C' },
      },
    ],
  };

  // 网吧分布柱状（仅代理身份展示）
  const provinceOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (p: any) => {
        const idx = p[0].dataIndex;
        const item = cafeProvinceDistribution[idx];
        return `${item.province}<br/>网吧: ${item.count} 家<br/>终端: ${item.terminal}<br/>本月分成: ¥${item.income}`;
      },
    },
    grid: { left: 40, right: 16, top: 16, bottom: 30 },
    xAxis: {
      type: 'category',
      data: cafeProvinceDistribution.map((d) => d.province),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)' },
    },
    yAxis: {
      type: 'value',
      name: '网吧数',
      nameTextStyle: { color: 'rgba(255,255,255,0.45)' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series: [
      {
        type: 'bar',
        data: cafeProvinceDistribution.map((d) => d.count),
        itemStyle: { color: '#FF2E3E', borderRadius: [4, 4, 0, 0] },
        barWidth: 24,
      },
    ],
  };

  return (
    <div>
      {fromRegister && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message="入驻注册提交成功！资质审核中，现在可以录入你负责的网吧"
          description="录入网吧名称、地址、终端数等信息后，系统将其纳入结算体系。"
          action={
            <Space>
              <Button size="small" type="primary" onClick={() => setCafeModalOpen(true)}>立即录入网吧</Button>
              <Button size="small" onClick={() => navigate('/agent/my-cafes')}>查看我的网吧</Button>
            </Space>
          }
        />
      )}
      <CafeFormModal open={cafeModalOpen} onClose={() => setCafeModalOpen(false)} onSuccess={() => navigate('/agent/my-cafes')} />
      {/* Page Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            概览首页
            <Tag color={isAgent ? 'red' : 'gold'} style={{ fontSize: 12, marginLeft: 0 }}>
              {roleLabel}
            </Tag>
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>
            {me.name} · {me.province} · 合作起始 {me.startDate}
          </div>
        </div>
        <Space>
          <Button>下载月报</Button>
          <Button type="primary" icon={<WalletOutlined />}>立即提现</Button>
        </Space>
      </div>

      {/* ============ 核心 Hero 4 卡：终端规模 + 单价 + 预估收益 + 结算日 ============ */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* 卡 1：终端规模（拆分：区域结算 + 全局结算） */}
        <Col span={6}>
          <div className="hero-card">
            <div>
              <div className="hero-card-label">
                <ShopOutlined /> 我的终端规模
                <Tooltip
                  title={
                    <div style={{ lineHeight: 1.8, fontSize: 12 }}>
                      <div><b>区域结算：</b>已配置省份渠道号，与同省同渠道号下终端按占比，分本渠道号下产生的 CPS 流水</div>
                      <div><b>全局结算：</b>未配置渠道号；全局池资金<b>仅</b>来自未打号终端流水，但分母是<b>全国所有</b>终端（含已打号）</div>
                      <div style={{ marginTop: 4, color: '#FFD666' }}>已打号终端 = 区域分成 + 全局分成（双享）</div>
                    </div>
                  }
                >
                  <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, opacity: 0.55 }} />
                </Tooltip>
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="money-large">{me.terminalCount.toLocaleString()}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>台</span>
              </div>
            </div>
            {/* 区域 / 全局拆分：mini 进度条 + 双数字 */}
            <div style={{ marginTop: 10 }}>
              <div style={{
                height: 4,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: `${(me.regionalTerminals / me.terminalCount) * 100}%`,
                  background: '#FF2E3E',
                }} />
                <div style={{
                  width: `${(me.globalTerminals / me.terminalCount) * 100}%`,
                  background: 'rgba(255,255,255,0.35)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: '#FF2E3E', marginRight: 4, verticalAlign: 'middle',
                  }} />
                  区域结算 <b>{me.regionalTerminals.toLocaleString()}</b>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.35)', marginRight: 4, verticalAlign: 'middle',
                  }} />
                  全局结算 <b>{me.globalTerminals.toLocaleString()}</b>
                </span>
              </div>
            </div>
          </div>
        </Col>

        {/* 卡 2：单台月单价 */}
        <Col span={6}>
          <div className="hero-card">
            <div>
              <div className="hero-card-label">
                <DollarOutlined /> 单台月单价（合计）
                <Tooltip
                  title={
                    <div style={{ lineHeight: 1.8 }}>
                      <div>首装激励分摊：¥{unitPrice.installPerMonth}/台/月</div>
                      <div style={{ fontSize: 11, opacity: 0.65, marginLeft: 8 }}>
                        （{unitPrice.installTotal} 元/台 ÷ {unitPrice.installMonths} 个月）
                      </div>
                      <div>CPS 月均分成：¥{unitPrice.cpsPerTerminalMonth}/台/月</div>
                    </div>
                  }
                >
                  <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 12, opacity: 0.55 }} />
                </Tooltip>
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="money-large">¥{unitPrice.totalPerTerminalMonth}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>/台/月</span>
              </div>
            </div>
            <div className="hero-card-extra">
              首装 ¥{unitPrice.installPerMonth} + CPS ¥{unitPrice.cpsPerTerminalMonth}
            </div>
          </div>
        </Col>

        {/* 卡 3：本月预估收益 */}
        <Col span={6}>
          <div className="hero-card">
            <div>
              <div className="hero-card-label">
                <RiseOutlined /> 本月预估收益
              </div>
              <div className="money-large" style={{ marginTop: 6, color: '#FF2E3E' }}>
                ¥ {heroStats.monthIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="hero-card-extra">
              <Tooltip
                title={
                  <div style={{ lineHeight: 1.8 }}>
                    <div>首装激励：¥ {heroStats.monthIncomeInstall.toLocaleString()}</div>
                    <div>CPS 分成：¥ {heroStats.monthIncomeCps.toLocaleString()}</div>
                  </div>
                }
              >
                <span style={{ cursor: 'help' }}>
                  = {heroStats.terminalCount.toLocaleString()} 台 × ¥{unitPrice.totalPerTerminalMonth}
                  <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, opacity: 0.55 }} />
                </span>
              </Tooltip>
            </div>
          </div>
        </Col>

        {/* 卡 4：下个结算日 */}
        <Col span={6}>
          <div className="hero-card">
            <div>
              <div className="hero-card-label">
                <CalendarOutlined /> 下个结算日
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="money-large">{settlementCycle.nextSettleDate.slice(5)}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
                  还有 {settlementCycle.daysToNextSettle} 天
                </span>
              </div>
            </div>
            <div className="hero-card-extra">{settlementCycle.cutoffRule}</div>
          </div>
        </Col>
      </Row>

      {/* ============ 收益构成（首装激励分摊 + CPS 分成 两路） ============ */}
      <div className="section-card">
        <div className="section-title">
          <span>💰 我的收益构成</span>
          <Tooltip title="结算口径：每月最后一天结算上月数据；首装激励一次性奖励 ¥120/台，分 12 个月发放（每月 ¥10/台）">
            <a><InfoCircleOutlined /> 结算规则</a>
          </Tooltip>
        </div>

        <Row gutter={16}>
          {/* 路 1：首装激励 */}
          <Col span={12}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,46,62,0.08) 0%, rgba(255,46,62,0.02) 100%)',
                border: '1px solid rgba(255,46,62,0.30)',
                borderRadius: 8,
                padding: 20,
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>首装激励（按月分摊）</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                    每台终端首装 ¥{unitPrice.installTotal} → 分 {unitPrice.installMonths} 个月发放
                  </div>
                </div>
                <Tag color="red">本月 ¥{installAnnuity.thisMonthAmount.toLocaleString()}</Tag>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>分摊期内终端</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'DIN Alternate' }}>
                    {installAnnuity.inAnnuityTerminals.toLocaleString()}
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>/ {installAnnuity.totalTerminals.toLocaleString()} 台</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>剩余待分摊总额</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'DIN Alternate' }}>
                    ¥{installAnnuity.totalRemaining.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    平均剩余 {installAnnuity.avgRemainingMonths} 个月
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* 路 2：CPS 分成 */}
          <Col span={12}>
            <div
              style={{
                background: '#1A1212',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                padding: 20,
                height: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>CPS 分成</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                    区域结算 + 全局结算合并展示，按用户活跃 / 充值流水分成
                  </div>
                </div>
                <Tag color="default" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'transparent', color: 'rgba(255,255,255,0.85)' }}>
                  本月 ¥{heroStats.monthIncomeCps.toLocaleString()}
                </Tag>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: '#FF2E3E',
                    }} />
                    区域结算终端
                    <Tooltip title="已配置省份渠道号；与同省渠道号下其它终端按数量占比，分本省渠道号下产生的 CPS 流水池">
                      <InfoCircleOutlined style={{ fontSize: 11, opacity: 0.55 }} />
                    </Tooltip>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'DIN Alternate' }}>
                    {me.regionalTerminals.toLocaleString()}
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>台</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    占比 {((me.regionalTerminals / me.terminalCount) * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.5)',
                    }} />
                    全局结算终端
                    <Tooltip
                      title={
                        <div style={{ lineHeight: 1.8, fontSize: 12 }}>
                          <div>· 全局池资金来源：仅由"未配置渠道号"终端产生的 CPS 流水</div>
                          <div>· 全局池分母：全国<b>所有</b>终端（含已配置渠道号）</div>
                          <div>· 已配置渠道号的终端可同时获得「区域 + 全局」两份分成</div>
                        </div>
                      }
                    >
                      <InfoCircleOutlined style={{ fontSize: 11, opacity: 0.55 }} />
                    </Tooltip>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'DIN Alternate' }}>
                    {me.globalTerminals.toLocaleString()}
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>台</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    占比 {((me.globalTerminals / me.terminalCount) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 12, paddingTop: 10,
                borderTop: '1px dashed rgba(255,255,255,0.08)',
                fontSize: 11, color: 'rgba(255,255,255,0.45)',
              }}>
                💡 提示：补配省份渠道号后，该终端可在"区域 + 全局"双池中各获得一份分成，收益严格高于仅参与全局
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 省份分成矩阵已下线：跨省代理少见，不再展示 */}
      {false && isAgent && (
        <div className="section-card">
          <div className="section-title">
            <span>🗺 我的省份分成矩阵</span>
          </div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>覆盖省份</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'DIN Alternate' }}>
                  {provinceMatrix.filter(p => p.cafeCount > 0).length}
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4, fontWeight: 400 }}>个</span>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>区域结算配置率</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'DIN Alternate' }}>
                  {(
                    (provinceMatrix.filter(p => p.cafeCount > 0).reduce((s, p) => s + p.terminalConfigured, 0) /
                      provinceMatrix.filter(p => p.cafeCount > 0).reduce((s, p) => s + p.terminalTotal, 0)) * 100
                  ).toFixed(1)}
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4, fontWeight: 400 }}>%</span>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{
                padding: '8px 12px',
                background: 'linear-gradient(135deg, rgba(255,46,62,0.10), rgba(255,46,62,0.02))',
                border: '1px solid rgba(255,46,62,0.30)',
                borderRadius: 6,
              }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>本月区域 CPS 合计</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#FF2E3E', fontFamily: 'DIN Alternate' }}>
                  ¥{provinceMatrix.reduce((s, p) => s + p.regionalIncome, 0).toLocaleString()}
                </div>
              </div>
            </Col>
          </Row>

          {/* 省份明细表 */}
          <Table
            size="small"
            rowKey="province"
            pagination={false}
            dataSource={provinceMatrix.filter(p => p.cafeCount > 0)}
            columns={[
              {
                title: '省份',
                dataIndex: 'province',
                width: 90,
                render: (v) => <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{v}</span>,
              },
              {
                title: '网吧',
                dataIndex: 'cafeCount',
                width: 80,
                align: 'right',
                render: (v) => <span style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'DIN Alternate' }}>{v}</span>,
              },
              {
                title: '终端总数',
                dataIndex: 'terminalTotal',
                width: 100,
                align: 'right',
                render: (v) => <span style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'DIN Alternate' }}>{v.toLocaleString()}</span>,
              },
              {
                title: () => (
                  <span>
                    区域结算配置率
                    <Tooltip title="该省走区域结算的终端 / 该省总终端，未配置的将走全局结算">
                      <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, opacity: 0.55 }} />
                    </Tooltip>
                  </span>
                ),
                key: 'configRate',
                width: 220,
                render: (_, r) => {
                  const rate = r.terminalTotal === 0 ? 0 : (r.terminalConfigured / r.terminalTotal) * 100;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Progress
                        percent={rate}
                        size="small"
                        showInfo={false}
                        strokeColor={rate === 100 ? '#FF2E3E' : rate > 0 ? '#FAAD14' : 'rgba(255,255,255,0.25)'}
                        trailColor="rgba(255,255,255,0.06)"
                        style={{ flex: 1, marginBottom: 0 }}
                      />
                      <span style={{
                        fontSize: 12, fontFamily: 'DIN Alternate',
                        color: rate === 100 ? 'rgba(255,255,255,0.85)' : rate > 0 ? '#FAAD14' : 'rgba(255,255,255,0.45)',
                        minWidth: 90, textAlign: 'right',
                      }}>
                        {r.terminalConfigured}/{r.terminalTotal}
                      </span>
                    </div>
                  );
                },
              },
              {
                title: () => (
                  <span>
                    本省区域池总额
                    <Tooltip title="该省所有走区域结算的终端本月产生的 CPS 流水池金额">
                      <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, opacity: 0.55 }} />
                    </Tooltip>
                  </span>
                ),
                dataIndex: 'regionalPoolTotal',
                width: 140,
                align: 'right',
                render: (v) => (
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'DIN Alternate' }}>
                    {v ? `¥${v.toLocaleString()}` : '—'}
                  </span>
                ),
              },
              {
                title: () => (
                  <span>
                    我的本月分成
                    <Tooltip title="本省区域池总额 × (我在本省走区域结算的终端数 / 本省走区域结算的总终端数)">
                      <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, opacity: 0.55 }} />
                    </Tooltip>
                  </span>
                ),
                dataIndex: 'regionalIncome',
                width: 130,
                align: 'right',
                render: (v) =>
                  v > 0 ? (
                    <span style={{ color: '#FF2E3E', fontWeight: 600, fontFamily: 'DIN Alternate' }}>¥{v.toLocaleString()}</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>¥0</span>
                  ),
              },
              {
                title: '操作',
                key: 'op',
                width: 130,
                render: (_, r) => {
                  if (!r.channelCode)
                    return (
                      <Tooltip title={`本省 ${r.terminalUnconfigured} 台终端正走全局结算`}>
                        <a style={{ color: '#FF2E3E' }}>开通区域结算 →</a>
                      </Tooltip>
                    );
                  if (r.terminalUnconfigured > 0)
                    return (
                      <Tooltip title={`本省还有 ${r.terminalUnconfigured} 台终端未接入区域结算`}>
                        <a style={{ color: '#FAAD14' }}>批量接入 →</a>
                      </Tooltip>
                    );
                  return <a>查看明细</a>;
                },
              },
            ]}
          />

          {/* 全局池补充信息 */}
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            border: '1px dashed rgba(255,255,255,0.08)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>
              🌐 此外参与<b style={{ color: 'rgba(255,255,255,0.85)' }}>全国全局池</b>分成（资金来源：未走区域结算的终端流水 ¥{globalPoolStats.totalAmount.toLocaleString()}，分母：全国 {globalPoolStats.totalNationalTerminals.toLocaleString()} 台）
            </span>
            <span style={{ color: '#FF2E3E', fontWeight: 600, fontFamily: 'DIN Alternate' }}>
              全局分成 ¥{globalPoolStats.myGlobalIncome.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* ============ 趋势图 + 网吧分布（代理才显示分布） ============ */}
      <Row gutter={16}>
        <Col span={isAgent ? 14 : 24}>
          <div className="section-card">
            <div className="section-title">
              <span>📊 收益趋势（近 30 天）</span>
              <Space>
                <a>7 天</a>
                <a style={{ color: '#FF2E3E', fontWeight: 600 }}>30 天</a>
                <a>12 月</a>
              </Space>
            </div>
            <ReactECharts option={trendOption} style={{ height: 280 }} />
          </div>
        </Col>
        {isAgent && (
          <Col span={10}>
            <div className="section-card">
              <div className="section-title">
                <span>🗺 网吧省份分布</span>
                <a>查看详细列表 →</a>
              </div>
              <ReactECharts option={provinceOption} style={{ height: 280 }} />
            </div>
          </Col>
        )}
      </Row>

      {/* ============ 业务速览 + 最近动态 ============ */}
      <Row gutter={16}>
        <Col span={10}>
          <div className="section-card">
            <div className="section-title">
              <span>🏪 我的{isAgent ? '网吧 / 终端' : '终端'}规模</span>
            </div>
            <Row gutter={16}>
              {isAgent && (
                <Col span={12}>
                  <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>托管网吧</div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#FF2E3E' }}>{(me as typeof agentInfo).cafeCount}</div>
                  </div>
                </Col>
              )}
              <Col span={isAgent ? 12 : 12}>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>有效终端</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#FF2E3E' }}>{me.terminalCount.toLocaleString()}</div>
                </div>
              </Col>
              <Col span={12} style={{ marginTop: 12 }}>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>月活终端</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{me.monthlyActiveTerminal.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    活跃率 {((me.monthlyActiveTerminal / me.terminalCount) * 100).toFixed(1)}%
                  </div>
                </div>
              </Col>
              <Col span={12} style={{ marginTop: 12 }}>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>日活终端</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{me.dailyActiveTerminal.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    活跃率 {((me.dailyActiveTerminal / me.terminalCount) * 100).toFixed(1)}%
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col span={14}>
          <div className="section-card">
            <div className="section-title">
              <span>📰 最近动态</span>
              <a>查看全部 →</a>
            </div>
            {recentFeed.map((item, i) => (
              <div className="feed-item" key={i}>
                <span className="feed-time">{item.time}</span>
                {item.type === 'success' && <Tag color="success">收益</Tag>}
                {item.type === 'info' && <Tag color="blue">通知</Tag>}
                {item.type === 'warning' && <Tag color="warning">提醒</Tag>}
                {item.type === 'error' && <Tag color="error">告警</Tag>}
                <span style={{ marginLeft: 8 }}>{item.content}</span>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}
