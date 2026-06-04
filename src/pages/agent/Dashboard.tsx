// ===========================================================================
// 概览首页（简化版 v2.1）
// 聚焦三件事：
//   1) 当前角色（身份 + 角色 ID + 入驻时间）
//   2) 待我处理的事项（关联 / 解绑 申请）
//   3) 终端规模 / 活跃 / 流水（聚合指标 + 活跃率）
// 详细的门店列表 / 申请记录 / 操作 全部收敛到「我的网吧」页
// ===========================================================================
import { useEffect, useMemo, useState } from 'react';
import {
  Card, Row, Col, Statistic, Space, Typography, Avatar, Progress, Button,
  Empty, Alert, Timeline, Divider, Tag,
} from 'antd';
import {
  ShopOutlined, DesktopOutlined, ThunderboltOutlined,
  DollarCircleOutlined, UserOutlined,
  CrownOutlined, BellOutlined, CheckCircleFilled,
  HourglassOutlined, ArrowRightOutlined, LinkOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  currentRole, agentInfo, ownerInfo,
  CURRENT_AGENT_ID, CURRENT_OWNER_ID,
  getCafesByAgent, getCafesByOwner,
  getLinkRequestsForOwner, getLinkRequestsByAgent,
  getUnlinkRequestsForOwner, getUnlinkRequestsForAgent,
  summarizeCafes, recentFeed,
  type MyCafe,
} from '../../mock/data';
import CafeFormModal from '../../components/CafeFormModal';

const { Title, Text, Paragraph } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAgent = currentRole === 'agent';
  const me = isAgent ? agentInfo : ownerInfo;
  const myRoleId = isAgent ? CURRENT_AGENT_ID : CURRENT_OWNER_ID;

  const myCafes: MyCafe[] = isAgent
    ? getCafesByAgent(CURRENT_AGENT_ID)
    : getCafesByOwner(CURRENT_OWNER_ID);
  const summary = useMemo(() => summarizeCafes(myCafes), [myCafes]);
  const pendingAuditCount = !isAgent
    ? myCafes.filter((c) => c.platformAuditStatus === 'pending').length
    : 0;
  const pendingLaunchCount = isAgent
    ? myCafes.filter((c) => !c.launchedAt).length
    : myCafes.filter((c) => c.platformAuditStatus === 'approved' && !c.launchedAt).length;

  // 待我处理 + 待审批
  const ownerPendingLinks = !isAgent ? getLinkRequestsForOwner(CURRENT_OWNER_ID) : [];
  const ownerPendingUnlinks = !isAgent ? getUnlinkRequestsForOwner(CURRENT_OWNER_ID) : [];
  const agentPendingUnlinks = isAgent ? getUnlinkRequestsForAgent(CURRENT_AGENT_ID) : [];
  const agentMyLinkPending = isAgent
    ? getLinkRequestsByAgent(CURRENT_AGENT_ID).filter((r) => r.status === 'pending').length
    : 0;

  const todoCount = isAgent
    ? agentPendingUnlinks.length
    : ownerPendingLinks.length + ownerPendingUnlinks.length;

  // 注册后引导：from=register 时自动弹"录入网吧"
  const [showCafeModal, setShowCafeModal] = useState(false);
  useEffect(() => {
    if (searchParams.get('from') === 'register' && !isAgent) {
      setShowCafeModal(true);
      const next = new URLSearchParams(searchParams);
      next.delete('from');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, isAgent, setSearchParams]);

  const monthlyActiveRate = summary.terminalCount > 0
    ? (summary.monthlyActiveTerminal / summary.terminalCount) * 100 : 0;
  const dailyActiveRate = summary.terminalCount > 0
    ? (summary.dailyActiveTerminal / summary.terminalCount) * 100 : 0;

  return (
    <div>
      {/* ============ 顶部：当前角色卡片 ============ */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #2A1216 0%, #1A0E11 100%)',
          border: '1px solid #3A1A1F', marginBottom: 16,
        }}
        styles={{ body: { padding: 20 } }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="64px">
            <Avatar size={64} style={{ background: isAgent ? '#FF5562' : '#52C41A' }}>
              {isAgent ? <CrownOutlined style={{ fontSize: 28 }} /> : <ShopOutlined style={{ fontSize: 28 }} />}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Space size={8} align="center" wrap>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>{me.name}</Title>
              <Tag color={isAgent ? 'red' : 'green'} style={{ marginRight: 0 }}>
                {isAgent ? '代理' : '网吧主'}
              </Tag>
              <Tag color="default" style={{ marginRight: 0 }}>角色 ID：{myRoleId}</Tag>
              <Tag color="default" style={{ marginRight: 0 }}>
                <CheckCircleFilled style={{ color: '#52C41A' }} /> 已实名
              </Tag>
            </Space>
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              {isAgent
                ? <>当前托管 <Text strong style={{ color: '#FFD66B' }}>{summary.cafeCount}</Text> 家网吧 · 终端 <Text strong style={{ color: '#FFD66B' }}>{summary.terminalCount}</Text> 台 · 入驻于 {me.startDate}{pendingLaunchCount > 0 && <> · <Text strong style={{ color: '#FAAD14' }}>{pendingLaunchCount}</Text> 家待铺设</>}</>
                : <>当前 <Text strong style={{ color: '#FFD66B' }}>{summary.cafeCount}</Text> 家门店（已关联代理 {summary.linkedAgentCafeCount} 家 / 散店 {summary.standaloneCafeCount} 家） · 入驻于 {me.startDate}{(pendingAuditCount > 0 || pendingLaunchCount > 0) && <> · {pendingAuditCount > 0 && <><Text strong style={{ color: '#FAAD14' }}>{pendingAuditCount}</Text> 家待平台审核</>}{pendingAuditCount > 0 && pendingLaunchCount > 0 && <> · </>}{pendingLaunchCount > 0 && <><Text strong style={{ color: '#FAAD14' }}>{pendingLaunchCount}</Text> 家待铺设</>}</>}</>
              }
            </div>
          </Col>
          <Col>
            <Space>
              {isAgent ? (
                <Button type="primary" icon={<LinkOutlined />} onClick={() => navigate('/agent/my-cafes')}>
                  关联新网吧
                </Button>
              ) : (
                <Button type="primary" icon={<ShopOutlined />} onClick={() => setShowCafeModal(true)}>
                  录入新网吧
                </Button>
              )}
              <Button icon={<UserOutlined />} onClick={() => navigate('/agent/profile')}>个人信息</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ============ 待办横幅 ============ */}
      {todoCount > 0 && (
        <Alert
          type="warning" showIcon icon={<BellOutlined />} style={{ marginBottom: 16 }}
          message={`你有 ${todoCount} 条申请待处理`}
          description={
            <Space split={<Divider type="vertical" />} wrap>
              {!isAgent && ownerPendingLinks.length > 0 && (
                <span><LinkOutlined /> {ownerPendingLinks.length} 条代理关联申请</span>
              )}
              {!isAgent && ownerPendingUnlinks.length > 0 && (
                <span><DisconnectOutlined /> {ownerPendingUnlinks.length} 条代理解绑申请</span>
              )}
              {isAgent && agentPendingUnlinks.length > 0 && (
                <span><DisconnectOutlined /> {agentPendingUnlinks.length} 条网吧主解绑申请</span>
              )}
            </Space>
          }
          action={<Button size="small" type="primary" onClick={() => navigate('/agent/my-cafes')}>去处理 <ArrowRightOutlined /></Button>}
        />
      )}
      {isAgent && agentMyLinkPending > 0 && (
        <Alert
          type="info" showIcon icon={<HourglassOutlined />} style={{ marginBottom: 16 }}
          message={`你发起的 ${agentMyLinkPending} 条网吧关联申请正在等待网吧主审批`}
          action={<Button size="small" onClick={() => navigate('/agent/my-cafes')}>查看申请 <ArrowRightOutlined /></Button>}
        />
      )}
      {isAgent && pendingLaunchCount > 0 && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 16 }}
          message={`你有 ${pendingLaunchCount} 家网吧已关联但「待铺设霸服系统」`}
          description="请尽快线下完成霸服系统铺设；铺设完成后才会有终端 / 流水数据回传。"
          action={<Button size="small" type="primary" onClick={() => navigate('/agent/my-cafes')}>去查看 <ArrowRightOutlined /></Button>}
        />
      )}
      {!isAgent && pendingAuditCount > 0 && (
        <Alert
          type="info" showIcon icon={<HourglassOutlined />} style={{ marginBottom: 16 }}
          message={`你有 ${pendingAuditCount} 家网吧正在等待平台审核`}
          description="审核通过后会分配正式网吧 ID（MCxxxx），届时可分享给代理发起关联。"
          action={<Button size="small" onClick={() => navigate('/agent/my-cafes')}>查看 <ArrowRightOutlined /></Button>}
        />
      )}

      {/* ============ 4 指标卡 ============ */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><ShopOutlined style={{ color: '#FF5562' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>{isAgent ? '托管网吧' : '我的门店'}</span></Space>}
              value={summary.cafeCount}
              suffix="家"
              valueStyle={{ color: '#FF5562', fontSize: 32, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {isAgent
                ? <>来自 {new Set(myCafes.map((c) => c.ownerId)).size} 位网吧主</>
                : <>关联代理 {summary.linkedAgentCafeCount} · 散店 {summary.standaloneCafeCount}</>
              }
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><DesktopOutlined style={{ color: '#FAAD14' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>终端规模</span></Space>}
              value={summary.terminalCount}
              suffix="台"
              valueStyle={{ color: '#FAAD14', fontSize: 32, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>所有门店已部署的终端总数</div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
            <Statistic
              title={<Space><ThunderboltOutlined style={{ color: '#52C41A' }} /><span style={{ color: 'rgba(255,255,255,0.65)' }}>活跃规模</span></Space>}
              value={summary.monthlyActiveTerminal}
              suffix={<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}> / 月活</span>}
              valueStyle={{ color: '#52C41A', fontSize: 32, fontWeight: 700 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              日活 {summary.dailyActiveTerminal} 台 · 月活率 {monthlyActiveRate.toFixed(1)}%
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
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>所有门店本月用户消费流水汇总</div>
          </Card>
        </Col>
      </Row>

      {/* ============ 活跃率 + 最近动态 ============ */}
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ color: '#fff' }}>📊 终端活跃率</span>}
            style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}
            styles={{ header: { borderBottom: '1px solid #2A1A1C' } }}
            extra={
              <Button type="link" size="small" onClick={() => navigate('/agent/my-cafes')}>
                查看全部门店 <ArrowRightOutlined />
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
                      {summary.monthlyActiveTerminal} / {summary.terminalCount} 台
                    </Text>
                  </Row>
                  <Progress
                    percent={Number(monthlyActiveRate.toFixed(1))}
                    strokeColor={{ '0%': '#52C41A', '100%': '#73D13D' }}
                    trailColor="#2A1A1C"
                  />
                </div>
                <div>
                  <Row justify="space-between" style={{ marginBottom: 6 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.75)' }}>日活终端</Text>
                    <Text strong style={{ color: '#1890FF' }}>
                      {summary.dailyActiveTerminal} / {summary.terminalCount} 台
                    </Text>
                  </Row>
                  <Progress
                    percent={Number(dailyActiveRate.toFixed(1))}
                    strokeColor={{ '0%': '#1890FF', '100%': '#40A9FF' }}
                    trailColor="#2A1A1C"
                  />
                </div>
                <Paragraph style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                  月活率 = 当月有过活跃记录的终端数 / 终端总数；日活率 = 当日有过活跃记录的终端数 / 终端总数
                </Paragraph>
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<span style={{ color: '#fff' }}>📰 最近动态</span>}
            style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}
            styles={{ header: { borderBottom: '1px solid #2A1A1C' } }}
          >
            <Timeline
              items={recentFeed.map((f) => ({
                color: f.type === 'success' ? 'green' : f.type === 'warning' ? 'orange' : 'blue',
                children: (
                  <Space direction="vertical" size={2}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{f.content}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{f.time}</Text>
                  </Space>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <CafeFormModal
        open={showCafeModal}
        onClose={() => setShowCafeModal(false)}
        onSuccess={() => { /* 数据自动刷新依赖路由切换 */ }}
      />
    </div>
  );
}
