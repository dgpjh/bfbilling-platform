// ===========================================================================
// 平台管理端（平台内部审核员）
// 平台视角 = 代理数据看板的上级汇总：总览 / 网吧明细 / 代理账号审核记录。
// 一期取消网吧录入审核；本页保留代理账号审核能力（审核代理注册申请）。
// ===========================================================================
import { useState } from 'react';
import {
  Layout, Table, Button, Card, Tag, Space, Modal, Input, Tabs, Statistic,
  Row, Col, message, Descriptions, Alert, Avatar, Progress, Typography,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined,
  HourglassOutlined, AuditOutlined, LogoutOutlined,
  ShopOutlined, DesktopOutlined, ThunderboltOutlined, DollarCircleOutlined,
  TeamOutlined, UnorderedListOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getPlatformAgentOverview, getPlatformCafes, summarizeCafes,
  getPendingAgentApplications, getAgentApplicationHistory,
  reviewAgentApprove, reviewAgentReject,
  type MyCafe, type AgentApplication,
} from '../../mock/data';

const { Header, Content } = Layout;
const { Text, Paragraph } = Typography;

function cafeStatusTag(cafe: MyCafe) {
  if (!cafe.launchedAt) return <Tag color="orange" icon={<HourglassOutlined />}>待铺设</Tag>;
  return <Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag>;
}

export default function PlatformAudit() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const allCafes = getPlatformCafes();
  const platformSummary = summarizeCafes(allCafes);
  const agentOverview = getPlatformAgentOverview();
  const pendingAgents = getPendingAgentApplications();
  const agentHistory = getAgentApplicationHistory();
  const monthlyActiveRate = platformSummary.terminalScaleCount > 0
    ? (platformSummary.monthlyActiveTerminal / platformSummary.terminalScaleCount) * 100
    : 0;
  const dailyActiveRate = platformSummary.terminalScaleCount > 0
    ? (platformSummary.dailyActiveTerminal / platformSummary.terminalScaleCount) * 100
    : 0;

  const [decideModal, setDecideModal] = useState<{ app: AgentApplication; type: 'approve' | 'reject' } | null>(null);
  const [decideRemark, setDecideRemark] = useState('');

  const submit = () => {
    if (!decideModal) return;
    if (decideModal.type === 'reject' && !decideRemark.trim()) {
      message.warning('驳回需填写原因'); return;
    }
    if (decideModal.type === 'approve') {
      const r = reviewAgentApprove(decideModal.app.applicationId, decideRemark || '资料齐全，审核通过');
      if (r.ok) message.success(`已通过代理账号申请：${decideModal.app.contact}`);
      else message.error('操作失败');
    } else {
      const r = reviewAgentReject(decideModal.app.applicationId, decideRemark);
      if (r.ok) message.success('已驳回该代理账号申请');
      else message.error('操作失败');
    }
    setDecideModal(null); setDecideRemark(''); refresh();
  };

  const cafeColumns = [
    { title: '网吧 ID', dataIndex: 'externalCafeId', width: 150, render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: '系统 ID', key: 'id', width: 130,
      render: (_: any, r: MyCafe) => <Tag color="gold">{r.id}</Tag>,
    },
    {
      title: '网吧名称', dataIndex: 'name', width: 220,
      render: (v: string, r: MyCafe) => (
        <Space direction="vertical" size={0}>
          <Text>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.province}·{r.city}</Text>
        </Space>
      ),
    },
    { title: '归属代理', key: 'agent', width: 180, render: (_: any, r: MyCafe) => <Space size={4}><Tag color="red">{r.agentId}</Tag>{r.agentName}</Space> },
    { title: '终端规模', dataIndex: 'terminalScaleCount', width: 110, align: 'right' as const, render: (v: number) => `${v} 台` },
    { title: '已活跃终端', dataIndex: 'terminalCount', width: 120, align: 'right' as const, render: (v: number) => `${v} 台` },
    { title: '日活终端', dataIndex: 'dailyActiveTerminal', width: 110, align: 'right' as const, render: (v: number) => `${v} 台` },
    { title: '月活终端', dataIndex: 'monthlyActiveTerminal', width: 110, align: 'right' as const, render: (v: number) => `${v} 台` },
    { title: '本月流水', dataIndex: 'monthRevenue', width: 130, align: 'right' as const, render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
    { title: '状态', key: 'status', width: 110, render: (_: any, r: MyCafe) => cafeStatusTag(r) },
    { title: '联系人', key: 'contact', width: 170, render: (_: any, r: MyCafe) => <Space direction="vertical" size={0}><span>{r.contact}</span><Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text></Space> },
  ];

  const pendingAgentColumns = [
    { title: '申请编号', dataIndex: 'applicationId', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '申请人', dataIndex: 'contact', width: 100 },
    { title: 'QQ 号', dataIndex: 'qq', width: 130, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
    { title: '所在地区', key: 'region', width: 130, render: (_: any, r: AgentApplication) => `${r.province}·${r.city}` },
    { title: '公司 / 工作室', dataIndex: 'companyName', width: 200, ellipsis: true },
    { title: '身份证号', dataIndex: 'idCardNo', width: 160 },
    { title: '银行账号', dataIndex: 'bankAccount', width: 180 },
    { title: '提交时间', dataIndex: 'submittedAt', width: 140 },
    {
      title: '操作', key: 'op', width: 200, fixed: 'right' as const,
      render: (_: any, r: AgentApplication) => (
        <Space>
          <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={() => { setDecideRemark(''); setDecideModal({ app: r, type: 'approve' }); }}>通过</Button>
          <Button danger icon={<CloseCircleOutlined />} size="small" onClick={() => { setDecideRemark(''); setDecideModal({ app: r, type: 'reject' }); }}>驳回</Button>
        </Space>
      ),
    },
  ];

  const historyAgentColumns = [
    { title: '申请编号', dataIndex: 'applicationId', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '申请人', dataIndex: 'contact', width: 100 },
    { title: 'QQ 号', dataIndex: 'qq', width: 130, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '所在地区', key: 'region', width: 130, render: (_: any, r: AgentApplication) => `${r.province}·${r.city}` },
    { title: '公司 / 工作室', dataIndex: 'companyName', width: 200, ellipsis: true },
    { title: '审核结果', key: 'status', width: 110, render: (_: any, r: AgentApplication) => r.reviewStatus === 'approved' ? <Tag color="success" icon={<CheckCircleOutlined />}>已通过</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>已驳回</Tag> },
    { title: '审核备注', dataIndex: 'reviewRemark', ellipsis: true },
    { title: '审核员', dataIndex: 'reviewer', width: 100 },
    { title: '审核时间', dataIndex: 'reviewAt', width: 150 },
  ];

  const overviewContent = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={4}><Card><Statistic title={<Space><TeamOutlined /> 代理数</Space>} value={agentOverview.length} suffix="个" valueStyle={{ color: '#FF5562' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><ShopOutlined /> 网吧数</Space>} value={platformSummary.cafeCount} suffix="家" valueStyle={{ color: '#FF5562' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={platformSummary.terminalScaleCount} suffix="台" valueStyle={{ color: '#FAAD14' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><ThunderboltOutlined /> 已活跃终端</Space>} value={platformSummary.terminalCount} suffix="台" valueStyle={{ color: '#52C41A' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><DollarCircleOutlined /> 本月流水</Space>} value={platformSummary.monthRevenue} prefix="¥" groupSeparator="," valueStyle={{ color: '#FFD66B' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><UserOutlined /> 待审核代理</Space>} value={pendingAgents.length} suffix="个" valueStyle={{ color: '#FAAD14' }} /></Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title={<span style={{ color: '#fff' }}>📊 全平台终端活跃率</span>} styles={{ header: { borderBottom: '1px solid #2A1A1C' } }}>
            {platformSummary.terminalScaleCount === 0 ? (
              <Alert type="info" showIcon message="暂无终端数据" />
            ) : (
              <Space direction="vertical" size={20} style={{ width: '100%' }}>
                <div>
                  <Row justify="space-between" style={{ marginBottom: 6 }}>
                    <Text>月活终端</Text>
                    <Text strong style={{ color: '#52C41A' }}>{platformSummary.monthlyActiveTerminal} / {platformSummary.terminalScaleCount} 台</Text>
                  </Row>
                  <Progress percent={Number(monthlyActiveRate.toFixed(1))} strokeColor={{ '0%': '#52C41A', '100%': '#73D13D' }} trailColor="#2A1A1C" />
                </div>
                <div>
                  <Row justify="space-between" style={{ marginBottom: 6 }}>
                    <Text>日活终端</Text>
                    <Text strong style={{ color: '#1890FF' }}>{platformSummary.dailyActiveTerminal} / {platformSummary.terminalScaleCount} 台</Text>
                  </Row>
                  <Progress percent={Number(dailyActiveRate.toFixed(1))} strokeColor={{ '0%': '#1890FF', '100%': '#40A9FF' }} trailColor="#2A1A1C" />
                </div>
                <Paragraph style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                  平台总览 = 所有代理名下网吧数据汇总；代理看板是本视图按单个代理过滤后的子集。
                </Paragraph>
              </Space>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<span style={{ color: '#fff' }}>待处理事项</span>} styles={{ header: { borderBottom: '1px solid #2A1A1C' } }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Alert type="warning" showIcon message={`${pendingAgents.length} 个代理账号申请待审核`} />
              <Alert type="info" showIcon message={`${platformSummary.pendingLaunchCount} 家网吧待铺设`} />
              <Alert type="success" showIcon message={`${platformSummary.launchedCafeCount} 家网吧已上线回传数据`} />
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="代理数据看板（平台视角）">
        <Table
          rowKey="agentId"
          dataSource={agentOverview}
          pagination={false}
          columns={[
            { title: '代理 ID', dataIndex: 'agentId', width: 120, render: (v: string) => <Tag color="red">{v}</Tag> },
            { title: '代理名称', dataIndex: 'agentName', width: 140 },
            { title: '省份', dataIndex: 'province', width: 90 },
            { title: '网吧数', dataIndex: 'cafeCount', align: 'right' as const, render: (v: number) => `${v} 家` },
            { title: '已上线', dataIndex: 'launchedCafeCount', align: 'right' as const, render: (v: number) => `${v} 家` },
            { title: '待铺设', dataIndex: 'pendingLaunchCount', align: 'right' as const, render: (v: number) => `${v} 家` },
            { title: '终端规模', dataIndex: 'terminalScaleCount', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '已活跃终端', dataIndex: 'activeTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '日活终端', dataIndex: 'dailyActiveTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '月活终端', dataIndex: 'monthlyActiveTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '本月流水', dataIndex: 'monthRevenue', align: 'right' as const, render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
          ]}
          scroll={{ x: 1200 }}
        />
      </Card>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <Header style={{ background: '#1A1212', borderBottom: '1px solid #2A1A1C', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space size={16}>
          <Avatar style={{ background: '#FF2E3E' }} icon={<SafetyCertificateOutlined />} />
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>平台管理端</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>平台 · 总览 / 网吧明细 / 代理账号审核</div>
          </div>
        </Space>
        <Space>
          <Tag color="red">审核员</Tag>
          <Button icon={<LogoutOutlined />} onClick={() => navigate('/')}>退出</Button>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          message="平台管理端 = 所有代理数据的上级汇总视角"
          description="平台可查看全量代理、网吧、终端、活跃与本月流水数据；本期网吧录入即生效（无需审核），仅保留代理账号注册申请的人工审核。"
        />

        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: <span><TeamOutlined /> 总览</span>,
              children: overviewContent,
            },
            {
              key: 'cafes',
              label: <span><UnorderedListOutlined /> 网吧明细（{allCafes.length}）</span>,
              children: (
                <Card title="全平台网吧明细">
                  <Table rowKey={(r) => r.id || r.externalCafeId} columns={cafeColumns} dataSource={allCafes} scroll={{ x: 1500 }} pagination={{ pageSize: 10 }} />
                </Card>
              ),
            },
            {
              key: 'agentAudit',
              label: <span><AuditOutlined /> 代理账号审核（{pendingAgents.length} 待审）</span>,
              children: (
                <Card>
                  <Alert
                    type="info" showIcon style={{ marginBottom: 12 }}
                    message="代理账号审核 = 对代理注册申请做合规审核"
                    description="审核要点：身份证 / 银行账号 / 公司或工作室主体真实性。通过后该代理可登录平台并录入网吧；驳回后申请人需重新提交资料。"
                  />
                  <Tabs
                    items={[
                      {
                        key: 'pending',
                        label: <span><AuditOutlined /> 待审核（{pendingAgents.length}）</span>,
                        children: <Table rowKey="applicationId" columns={pendingAgentColumns} dataSource={pendingAgents} scroll={{ x: 1500 }} pagination={{ pageSize: 10 }} />,
                      },
                      {
                        key: 'history',
                        label: <span>已审核（{agentHistory.length}）</span>,
                        children: <Table rowKey="applicationId" columns={historyAgentColumns} dataSource={agentHistory} scroll={{ x: 1300 }} pagination={{ pageSize: 10 }} />,
                      },
                    ]}
                  />
                </Card>
              ),
            },
          ]}
        />

        <Modal
          title={decideModal?.type === 'approve' ? '通过代理账号申请' : '驳回代理账号申请'}
          open={!!decideModal}
          onOk={submit}
          onCancel={() => setDecideModal(null)}
          okText={decideModal?.type === 'approve' ? '确认通过' : '确认驳回'}
          okButtonProps={{ danger: decideModal?.type === 'reject' }}
          width={620}
        >
          {decideModal && (
            <>
              <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
                <Descriptions.Item label="申请编号"><Tag>{decideModal.app.applicationId}</Tag></Descriptions.Item>
                <Descriptions.Item label="申请人">{decideModal.app.contact}</Descriptions.Item>
                <Descriptions.Item label="QQ 号"><Tag color="blue">{decideModal.app.qq}</Tag></Descriptions.Item>
                <Descriptions.Item label="联系电话">{decideModal.app.phone}</Descriptions.Item>
                <Descriptions.Item label="所在地区">{decideModal.app.province}·{decideModal.app.city}</Descriptions.Item>
                <Descriptions.Item label="公司 / 工作室">{decideModal.app.companyName}</Descriptions.Item>
                <Descriptions.Item label="身份证号">{decideModal.app.idCardNo}</Descriptions.Item>
                <Descriptions.Item label="银行账号">{decideModal.app.bankAccount}</Descriptions.Item>
                <Descriptions.Item label="提交时间">{decideModal.app.submittedAt}</Descriptions.Item>
              </Descriptions>
              <Alert
                type={decideModal.type === 'approve' ? 'success' : 'warning'} showIcon style={{ marginBottom: 12 }}
                message={decideModal.type === 'approve'
                  ? '通过后该代理账号即生效，申请人可登录平台并录入网吧'
                  : '驳回后申请人需根据驳回原因重新提交资料'}
              />
              <Input.TextArea rows={3} value={decideRemark} onChange={(e) => setDecideRemark(e.target.value)} placeholder={decideModal.type === 'approve' ? '审核备注（选填）' : '驳回原因（必填）'} maxLength={200} showCount />
            </>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}
