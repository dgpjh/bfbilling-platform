// ===========================================================================
// 平台管理端（平台内部审核员）
// 平台视角 = 代理数据看板的上级汇总：总览 / 网吧明细 / 审核记录。
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
  TeamOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getPendingPlatformReviews, getPlatformReviewHistory,
  getPlatformAgentOverview, getPlatformCafes, summarizeCafes,
  reviewCafeApprove, reviewCafeReject,
  type MyCafe,
} from '../../mock/data';

const { Header, Content } = Layout;
const { Text, Paragraph } = Typography;

function statusTag(cafe: MyCafe) {
  if (cafe.platformAuditStatus === 'pending') return <Tag color="processing" icon={<HourglassOutlined />}>待审核</Tag>;
  if (cafe.platformAuditStatus === 'rejected') return <Tag color="error" icon={<CloseCircleOutlined />}>已驳回</Tag>;
  if (!cafe.launchedAt) return <Tag color="orange" icon={<HourglassOutlined />}>待铺设</Tag>;
  return <Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag>;
}

export default function PlatformAudit() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const pending = getPendingPlatformReviews();
  const history = getPlatformReviewHistory();
  const allCafes = getPlatformCafes();
  const platformSummary = summarizeCafes(allCafes);
  const agentOverview = getPlatformAgentOverview();
  const monthlyActiveRate = platformSummary.terminalScaleCount > 0
    ? (platformSummary.monthlyActiveTerminal / platformSummary.terminalScaleCount) * 100
    : 0;
  const dailyActiveRate = platformSummary.terminalScaleCount > 0
    ? (platformSummary.dailyActiveTerminal / platformSummary.terminalScaleCount) * 100
    : 0;

  const [decideModal, setDecideModal] = useState<{ cafe: MyCafe; type: 'approve' | 'reject' } | null>(null);
  const [decideRemark, setDecideRemark] = useState('');

  const submit = () => {
    if (!decideModal) return;
    if (decideModal.type === 'reject' && !decideRemark.trim()) {
      message.warning('驳回需填写原因'); return;
    }
    if (decideModal.type === 'approve') {
      const r = reviewCafeApprove(decideModal.cafe.tempId!, decideRemark || '资料齐全，审核通过');
      if (r.ok) message.success(`已通过，系统记录已更新：${r.cafeId}`);
      else message.error('操作失败');
    } else {
      const ok = reviewCafeReject(decideModal.cafe.tempId!, decideRemark);
      if (ok) message.success('已驳回该录入申请');
      else message.error('操作失败');
    }
    setDecideModal(null); setDecideRemark(''); refresh();
  };

  const cafeColumns = [
    { title: '网吧 ID', dataIndex: 'externalCafeId', width: 150, render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: '系统 ID', key: 'id', width: 130,
      render: (_: any, r: MyCafe) => r.id ? <Tag color="gold">{r.id}</Tag> : <Tag>{r.tempId}</Tag>,
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
    { title: '实际流水', dataIndex: 'monthRevenue', width: 130, align: 'right' as const, render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
    { title: '状态', key: 'status', width: 110, render: (_: any, r: MyCafe) => statusTag(r) },
    { title: '联系人', key: 'contact', width: 170, render: (_: any, r: MyCafe) => <Space direction="vertical" size={0}><span>{r.contact}</span><Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text></Space> },
  ];

  const pendingColumns = [
    { title: '临时编号', dataIndex: 'tempId', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '网吧 ID', dataIndex: 'externalCafeId', width: 150, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '网吧名称', dataIndex: 'name', width: 220 },
    { title: '归属代理', key: 'agent', width: 180, render: (_: any, r: MyCafe) => <Space size={4}><Tag color="red">{r.agentId}</Tag>{r.agentName}</Space> },
    { title: '所在地区', key: 'region', width: 140, render: (_: any, r: MyCafe) => <span>{r.province}·{r.city}</span> },
    { title: '详细地址', dataIndex: 'address', ellipsis: true },
    { title: '终端规模', dataIndex: 'terminalScaleCount', width: 100, align: 'right' as const, render: (v: number) => `${v} 台` },
    { title: '提交时间', dataIndex: 'createdAt', width: 110 },
    {
      title: '操作', key: 'op', width: 200, fixed: 'right' as const,
      render: (_: any, r: MyCafe) => (
        <Space>
          <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={() => { setDecideRemark(''); setDecideModal({ cafe: r, type: 'approve' }); }}>通过</Button>
          <Button danger icon={<CloseCircleOutlined />} size="small" onClick={() => { setDecideRemark(''); setDecideModal({ cafe: r, type: 'reject' }); }}>驳回</Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    { title: '系统 ID / 临时编号', key: 'id', width: 160, render: (_: any, r: MyCafe) => r.platformAuditStatus === 'approved' ? <Tag color="gold">{r.id}</Tag> : <Tag>{r.tempId}</Tag> },
    { title: '网吧 ID', dataIndex: 'externalCafeId', width: 150, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '网吧名称', dataIndex: 'name', width: 220 },
    { title: '归属代理', key: 'agent', width: 180, render: (_: any, r: MyCafe) => <Space size={4}><Tag color="red">{r.agentId}</Tag>{r.agentName}</Space> },
    { title: '审核结果', key: 'status', width: 110, render: (_: any, r: MyCafe) => r.platformAuditStatus === 'approved' ? <Tag color="success" icon={<CheckCircleOutlined />}>已通过</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>已驳回</Tag> },
    { title: '审核备注', dataIndex: 'platformAuditRemark', ellipsis: true },
    { title: '审核时间', dataIndex: 'platformAuditAt', width: 160 },
  ];

  const overviewContent = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={4}><Card><Statistic title={<Space><TeamOutlined /> 代理数</Space>} value={agentOverview.length} suffix="个" valueStyle={{ color: '#FF5562' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><ShopOutlined /> 网吧数</Space>} value={platformSummary.cafeCount} suffix="家" valueStyle={{ color: '#FF5562' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={platformSummary.terminalScaleCount} suffix="台" valueStyle={{ color: '#FAAD14' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><ThunderboltOutlined /> 已活跃终端</Space>} value={platformSummary.terminalCount} suffix="台" valueStyle={{ color: '#52C41A' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><DollarCircleOutlined /> 实际流水</Space>} value={platformSummary.monthRevenue} prefix="¥" groupSeparator="," valueStyle={{ color: '#FFD66B' }} /></Card></Col>
        <Col xs={12} md={4}><Card><Statistic title={<Space><HourglassOutlined /> 待审核</Space>} value={pending.length} suffix="单" valueStyle={{ color: '#FAAD14' }} /></Card></Col>
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
              <Alert type="warning" showIcon message={`${pending.length} 条网吧录入申请待审核`} />
              <Alert type="info" showIcon message={`${platformSummary.pendingLaunchCount} 家网吧审核通过后待铺设`} />
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
            { title: '待审核/待铺设', key: 'pending', align: 'right' as const, render: (_: any, r: any) => `${r.pendingAuditCount} / ${r.pendingLaunchCount}` },
            { title: '终端规模', dataIndex: 'terminalScaleCount', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '已活跃终端', dataIndex: 'activeTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '日活终端', dataIndex: 'dailyActiveTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '月活终端', dataIndex: 'monthlyActiveTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
            { title: '实际流水', dataIndex: 'monthRevenue', align: 'right' as const, render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
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
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>平台 · 总览 / 网吧明细 / 审核记录</div>
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
          description="平台可查看全量代理、网吧、终端、活跃与实际流水数据；代理端看板是平台视角按代理过滤后的子集。平台不直接录入网吧，只处理资料审核。"
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
                  <Table rowKey={(r) => r.id || r.tempId || r.externalCafeId} columns={cafeColumns} dataSource={allCafes} scroll={{ x: 1500 }} pagination={{ pageSize: 10 }} />
                </Card>
              ),
            },
            {
              key: 'audit',
              label: <span><AuditOutlined /> 审核记录（{pending.length} 待审）</span>,
              children: (
                <Card>
                  <Tabs
                    items={[
                      {
                        key: 'pending',
                        label: <span><AuditOutlined /> 待审核（{pending.length}）</span>,
                        children: <Table rowKey={(r) => r.tempId || r.id} columns={pendingColumns} dataSource={pending} scroll={{ x: 1400 }} pagination={{ pageSize: 10 }} />,
                      },
                      {
                        key: 'history',
                        label: <span>已审核（{history.length}）</span>,
                        children: <Table rowKey={(r) => r.id || r.tempId || ''} columns={historyColumns} dataSource={history} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} />,
                      },
                    ]}
                  />
                </Card>
              ),
            },
          ]}
        />

        <Modal
          title={decideModal?.type === 'approve' ? '通过录入申请' : '驳回录入申请'}
          open={!!decideModal}
          onOk={submit}
          onCancel={() => setDecideModal(null)}
          okText={decideModal?.type === 'approve' ? '确认通过' : '确认驳回'}
          okButtonProps={{ danger: decideModal?.type === 'reject' }}
          width={580}
        >
          {decideModal && (
            <>
              <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
                <Descriptions.Item label="网吧名称">{decideModal.cafe.name}</Descriptions.Item>
                <Descriptions.Item label="网吧 ID"><Tag color="blue">{decideModal.cafe.externalCafeId}</Tag></Descriptions.Item>
                <Descriptions.Item label="临时编号"><Tag>{decideModal.cafe.tempId}</Tag></Descriptions.Item>
                <Descriptions.Item label="归属代理"><Space><Tag color="red">{decideModal.cafe.agentId}</Tag>{decideModal.cafe.agentName}</Space></Descriptions.Item>
                <Descriptions.Item label="所在地区">{decideModal.cafe.province}·{decideModal.cafe.city}</Descriptions.Item>
                <Descriptions.Item label="详细地址">{decideModal.cafe.address}</Descriptions.Item>
                <Descriptions.Item label="终端规模">{decideModal.cafe.terminalScaleCount} 台</Descriptions.Item>
                <Descriptions.Item label="联系方式">{decideModal.cafe.contact} · {decideModal.cafe.phone}</Descriptions.Item>
              </Descriptions>
              <Alert
                type={decideModal.type === 'approve' ? 'success' : 'warning'} showIcon style={{ marginBottom: 12 }}
                message={decideModal.type === 'approve'
                  ? '通过后该网吧资料审核完成，代理可继续安排线下铺设上线'
                  : '驳回后代理可重新提交录入申请，请填写明确驳回原因'}
              />
              <Input.TextArea rows={3} value={decideRemark} onChange={(e) => setDecideRemark(e.target.value)} placeholder={decideModal.type === 'approve' ? '审核备注（选填）' : '驳回原因（必填）'} maxLength={200} showCount />
            </>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}
