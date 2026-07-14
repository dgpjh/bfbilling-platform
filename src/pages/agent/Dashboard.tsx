// ===========================================================================
// 概览首页（v3 代理单角色版）
// 聚焦：代理身份、网吧录入审核、待铺设 TODO、终端规模/活跃/流水。
// ===========================================================================
import { useEffect, useMemo, useState } from 'react';
import {
  Card, Row, Col, Statistic, Space, Typography, Avatar, Progress, Button,
  Empty, Alert, Timeline, Tag,
} from 'antd';
import {
  ShopOutlined, DesktopOutlined, ThunderboltOutlined,
  DollarCircleOutlined,
  CrownOutlined, CheckCircleFilled,
  HourglassOutlined, ArrowRightOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  agentInfo,
  CURRENT_AGENT_ID,
  MONTHLY_ACTIVE_TERMINAL_ACTIVE_DAYS_THRESHOLD,
  MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_DESC,
  calculateMonthlyTerminalSettlement,
  getCafesByAgent,
  summarizeCafes,
  type MyCafe,
} from '../../mock/data';
import CafeFormModal from '../../components/CafeFormModal';

const { Title, Text, Paragraph } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCafeModal, setShowCafeModal] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const myCafes: MyCafe[] = getCafesByAgent(CURRENT_AGENT_ID);
  const summary = useMemo(() => summarizeCafes(myCafes), [myCafes, tick]);

  useEffect(() => {
    if (searchParams.get('from') === 'register') {
      setShowCafeModal(true);
      const next = new URLSearchParams(searchParams);
      next.delete('from');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const monthlyActiveRate = summary.terminalScaleCount > 0
    ? (summary.monthlyActiveTerminal / summary.terminalScaleCount) * 100 : 0;
  const dailyActiveRate = summary.terminalScaleCount > 0
    ? (summary.dailyActiveTerminal / summary.terminalScaleCount) * 100 : 0;
  const terminalSettlement = calculateMonthlyTerminalSettlement(summary.monthlyActiveTerminal);

  return (
    <div>
      <Card
        style={{
          background: 'linear-gradient(135deg, #2A1216 0%, #1A0E11 100%)',
          border: '1px solid #3A1A1F', marginBottom: 16,
        }}
        styles={{ body: { padding: 20 } }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="64px">
            <Avatar size={64} style={{ background: '#FF5562' }}>
              <CrownOutlined style={{ fontSize: 28 }} />
            </Avatar>
          </Col>
          <Col flex="auto">
            <Space size={8} align="center" wrap>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>{agentInfo.name}</Title>
              <Tag color="red" style={{ marginRight: 0 }}>代理</Tag>
              <Tag color="default" style={{ marginRight: 0 }}>角色 ID：{CURRENT_AGENT_ID}</Tag>
              <Tag color="default" style={{ marginRight: 0 }}>
                <CheckCircleFilled style={{ color: '#52C41A' }} /> 已实名
              </Tag>
            </Space>
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              当前录入 <Text strong style={{ color: '#FFD66B' }}>{summary.cafeCount}</Text> 家网吧 · 已上线 <Text strong style={{ color: '#FFD66B' }}>{summary.launchedCafeCount}</Text> 家 · 终端规模 <Text strong style={{ color: '#FFD66B' }}>{summary.terminalScaleCount}</Text> 台 · 已活跃 <Text strong style={{ color: '#FFD66B' }}>{summary.terminalCount}</Text> 台 · 入驻于 {agentInfo.startDate}
            </div>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCafeModal(true)}>
              录入网吧
            </Button>
          </Col>
        </Row>
      </Card>

      {summary.pendingLaunchCount > 0 && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message={`你有 ${summary.pendingLaunchCount} 家网吧待铺设霸服系统`}
          description="请尽快完成线下铺设；铺设完成后才会有终端 / 活跃 / 流水数据回传。"
          action={<Button size="small" type="primary" onClick={() => navigate('/agent/my-cafes')}>去处理 <ArrowRightOutlined /></Button>}
        />
      )}

      <Card
        style={{ background: 'linear-gradient(135deg, rgba(255,214,107,0.12) 0%, #1A1212 100%)', border: '1px solid rgba(255,214,107,0.35)', marginBottom: 16 }}
        styles={{ body: { padding: 18 } }}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} lg={10}>
            <Space direction="vertical" size={4}>
              <Space wrap>
                <Tag color="gold">已拍定结算口径</Tag>
                <Text strong style={{ color: '#fff' }}>月活跃终端数结算</Text>
              </Space>
              <Text style={{ color: 'rgba(255,255,255,0.62)' }}>
                {MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_DESC}，当前首页按该字段预估本月结算。
              </Text>
            </Space>
          </Col>
          <Col xs={8} lg={4}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>月活跃结算终端</span>}
              value={terminalSettlement.eligibleTerminalCount}
              suffix="台"
              valueStyle={{ color: '#FFD66B', fontWeight: 700 }}
            />
          </Col>
          <Col xs={8} lg={4}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>单台单月</span>}
              value={terminalSettlement.unitPrice}
              prefix="¥"
              valueStyle={{ color: '#FFD66B', fontWeight: 700 }}
            />
          </Col>
          <Col xs={8} lg={4}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>预估结算金额</span>}
              value={terminalSettlement.amount}
              prefix="¥"
              groupSeparator=","
              valueStyle={{ color: '#FFD66B', fontWeight: 700 }}
            />
          </Col>
          <Col xs={24} lg={2}>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              ≥{MONTHLY_ACTIVE_TERMINAL_ACTIVE_DAYS_THRESHOLD} 天
            </Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><ShopOutlined style={{ color: '#FF5562' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>录入网吧</span></Space>}
              value={summary.cafeCount}
              suffix="家"
              valueStyle={{ color: '#FF5562', fontSize: 32, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              待铺设 {summary.pendingLaunchCount} 家
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><DesktopOutlined style={{ color: '#FAAD14' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>终端规模</span></Space>}
              value={summary.terminalScaleCount}
              suffix="台"
              valueStyle={{ color: '#FAAD14', fontSize: 32, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>代理人工维护的终端规模总数</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><ThunderboltOutlined style={{ color: '#52C41A' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>已活跃终端</span></Space>}
              value={summary.terminalCount}
              suffix={<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}> / 当前</span>}
              valueStyle={{ color: '#52C41A', fontSize: 32, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              月活跃结算终端 {summary.monthlyActiveTerminal} 台 · 日活 {summary.dailyActiveTerminal} 台 · 活跃率 {monthlyActiveRate.toFixed(1)}%
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><DollarCircleOutlined style={{ color: '#FFD66B' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>本月流水</span></Space>}
              value={summary.monthRevenue}
              prefix="¥"
              valueStyle={{ color: '#FFD66B', fontSize: 32, fontWeight: 700 }}
              groupSeparator=","
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>代理名下所有已上线网吧流水汇总</div>
          </Card>
        </Col>
      </Row>

      <Card
        title={<span style={{ color: '#fff' }}>📊 终端活跃率</span>}
        style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}
        styles={{ header: { borderBottom: '1px solid #2A1A1C' } }}
        extra={
          <Button type="link" size="small" onClick={() => navigate('/agent/my-cafes')}>
            查看全部网吧 <ArrowRightOutlined />
          </Button>
        }
      >
        {summary.terminalCount === 0 ? (
          <Empty description={<span style={{ color: 'rgba(255,255,255,0.45)' }}>暂无终端数据</span>} />
        ) : (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <div>
              <Row justify="space-between" style={{ marginBottom: 6 }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)' }}>月活终端</Text>
                <Text strong style={{ color: '#52C41A' }}>
                  {summary.monthlyActiveTerminal} / {summary.terminalScaleCount} 台
                </Text>
              </Row>
              <Progress percent={Number(monthlyActiveRate.toFixed(1))} strokeColor={{ '0%': '#52C41A', '100%': '#73D13D' }} trailColor="#2A1A1C" />
            </div>
            <div>
              <Row justify="space-between" style={{ marginBottom: 6 }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)' }}>日活终端</Text>
                <Text strong style={{ color: '#1890FF' }}>
                  {summary.dailyActiveTerminal} / {summary.terminalScaleCount} 台
                </Text>
              </Row>
              <Progress percent={Number(dailyActiveRate.toFixed(1))} strokeColor={{ '0%': '#1890FF', '100%': '#40A9FF' }} trailColor="#2A1A1C" />
            </div>
            <Paragraph style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
              月活跃结算终端 = 单自然月内活跃 3 天及以上终端数；日活率 = 当日有过活跃记录的终端数 / 代理维护的终端规模。
            </Paragraph>
          </Space>
        )}
      </Card>

      <CafeFormModal
        open={showCafeModal}
        onClose={() => setShowCafeModal(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
