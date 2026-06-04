// ===========================================================================
// 平台审核台（迪越 / 应用宝手助 内部审核员）
// 作用：业务流程 C 步——人工审核网吧主提交的录入申请，通过后分配正式 MC 网吧 ID
// 入口：登录页底部「平台审核员入口」 → /admin/audit
// ===========================================================================
import { useState } from 'react';
import {
  Layout, Table, Button, Card, Tag, Space, Modal, Input, Tabs, Statistic,
  Row, Col, message, Descriptions, Alert, Avatar,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined,
  HourglassOutlined, AuditOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getPendingPlatformReviews, getPlatformReviewHistory,
  reviewCafeApprove, reviewCafeReject,
  type MyCafe,
} from '../../mock/data';

const { Header, Content } = Layout;

export default function PlatformAudit() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const pending = getPendingPlatformReviews();
  const history = getPlatformReviewHistory();
  const approvedCount = history.filter((c) => c.platformAuditStatus === 'approved').length;
  const rejectedCount = history.filter((c) => c.platformAuditStatus === 'rejected').length;

  const [decideModal, setDecideModal] = useState<{ cafe: MyCafe; type: 'approve' | 'reject' } | null>(null);
  const [decideRemark, setDecideRemark] = useState('');

  const submit = () => {
    if (!decideModal) return;
    if (decideModal.type === 'reject' && !decideRemark.trim()) {
      message.warning('驳回需填写原因'); return;
    }
    if (decideModal.type === 'approve') {
      const r = reviewCafeApprove(decideModal.cafe.tempId!, decideRemark || '资料齐全，审核通过');
      if (r.ok) {
        message.success(`已通过，分配网吧 ID：${r.cafeId}`);
      } else {
        message.error('操作失败');
      }
    } else {
      const ok = reviewCafeReject(decideModal.cafe.tempId!, decideRemark);
      if (ok) message.success('已驳回该录入申请');
      else message.error('操作失败');
    }
    setDecideModal(null); setDecideRemark(''); refresh();
  };

  const pendingColumns = [
    { title: '临时编号', dataIndex: 'tempId', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '网吧名称', dataIndex: 'name', width: 220 },
    {
      title: '所在地区', key: 'region', width: 140,
      render: (_: any, r: MyCafe) => <span>{r.province}·{r.city}</span>,
    },
    { title: '详细地址', dataIndex: 'address', ellipsis: true },
    { title: '申报终端', dataIndex: 'declaredTerminalCount', width: 100, align: 'right' as const, render: (v: number) => `${v} 台` },
    {
      title: '联系人 / 电话', key: 'contact', width: 180,
      render: (_: any, r: MyCafe) => <Space direction="vertical" size={0}><span>{r.contact}</span><span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{r.phone}</span></Space>,
    },
    { title: '提交时间', dataIndex: 'createdAt', width: 110 },
    { title: '网吧主 ID', dataIndex: 'ownerId', width: 130, render: (v: string) => <Tag color="default">{v}</Tag> },
    {
      title: '操作', key: 'op', width: 200, fixed: 'right' as const,
      render: (_: any, r: MyCafe) => (
        <Space>
          <Button type="primary" icon={<CheckCircleOutlined />} size="small"
            onClick={() => { setDecideRemark(''); setDecideModal({ cafe: r, type: 'approve' }); }}>
            通过
          </Button>
          <Button danger icon={<CloseCircleOutlined />} size="small"
            onClick={() => { setDecideRemark(''); setDecideModal({ cafe: r, type: 'reject' }); }}>
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: '网吧 ID / 临时编号', key: 'id', width: 160,
      render: (_: any, r: MyCafe) => r.platformAuditStatus === 'approved'
        ? <Tag color="gold">{r.id}</Tag>
        : <Tag>{r.tempId}</Tag>,
    },
    { title: '网吧名称', dataIndex: 'name', width: 220 },
    {
      title: '审核结果', key: 'status', width: 110,
      render: (_: any, r: MyCafe) => r.platformAuditStatus === 'approved'
        ? <Tag color="success" icon={<CheckCircleOutlined />}>已通过</Tag>
        : <Tag color="error" icon={<CloseCircleOutlined />}>已驳回</Tag>,
    },
    { title: '审核备注', dataIndex: 'platformAuditRemark', ellipsis: true },
    { title: '审核时间', dataIndex: 'platformAuditAt', width: 160 },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <Header
        style={{
          background: '#1A1212', borderBottom: '1px solid #2A1A1C',
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Space size={16}>
          <Avatar style={{ background: '#FF2E3E' }} icon={<SafetyCertificateOutlined />} />
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>平台审核台</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>迪越 / 应用宝手助 · 网吧录入审核</div>
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
          message="网吧主提交录入 → 平台审核（本页） → 通过后分配正式网吧 ID（MCxxxx） → 代理可发起关联"
          description="审核维度：营业执照真实性、地址有效性、联系人真实性、是否为黑名单网吧。"
        />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={8}>
            <Card>
              <Statistic title={<Space><HourglassOutlined /> 待审核</Space>} value={pending.length} suffix="单"
                valueStyle={{ color: '#FAAD14' }} />
            </Card>
          </Col>
          <Col xs={8}>
            <Card>
              <Statistic title={<Space><CheckCircleOutlined /> 累计通过</Space>} value={approvedCount} suffix="单"
                valueStyle={{ color: '#52C41A' }} />
            </Card>
          </Col>
          <Col xs={8}>
            <Card>
              <Statistic title={<Space><CloseCircleOutlined /> 累计驳回</Space>} value={rejectedCount} suffix="单"
                valueStyle={{ color: '#FF4D4F' }} />
            </Card>
          </Col>
        </Row>

        <Card>
          <Tabs
            items={[
              {
                key: 'pending',
                label: <span><AuditOutlined /> 待审核（{pending.length}）</span>,
                children: <Table rowKey={(r) => r.tempId || r.id} columns={pendingColumns} dataSource={pending}
                  scroll={{ x: 1400 }} pagination={{ pageSize: 10 }} />,
              },
              {
                key: 'history',
                label: <span>历史记录（{history.length}）</span>,
                children: <Table rowKey={(r) => r.id || r.tempId || ''} columns={historyColumns} dataSource={history}
                  pagination={{ pageSize: 10 }} />,
              },
            ]}
          />
        </Card>

        {/* 审核弹窗 */}
        <Modal
          title={decideModal?.type === 'approve' ? '通过录入申请' : '驳回录入申请'}
          open={!!decideModal}
          onOk={submit}
          onCancel={() => setDecideModal(null)}
          okText={decideModal?.type === 'approve' ? '确认通过并分配 ID' : '确认驳回'}
          okButtonProps={{ danger: decideModal?.type === 'reject' }}
          width={580}
        >
          {decideModal && (
            <>
              <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
                <Descriptions.Item label="网吧名称">{decideModal.cafe.name}</Descriptions.Item>
                <Descriptions.Item label="临时编号"><Tag>{decideModal.cafe.tempId}</Tag></Descriptions.Item>
                <Descriptions.Item label="所在地区">{decideModal.cafe.province}·{decideModal.cafe.city}</Descriptions.Item>
                <Descriptions.Item label="详细地址">{decideModal.cafe.address}</Descriptions.Item>
                <Descriptions.Item label="申报终端">{decideModal.cafe.declaredTerminalCount} 台</Descriptions.Item>
                <Descriptions.Item label="联系方式">{decideModal.cafe.contact} · {decideModal.cafe.phone}</Descriptions.Item>
                <Descriptions.Item label="网吧主 ID"><Tag>{decideModal.cafe.ownerId}</Tag></Descriptions.Item>
              </Descriptions>
              <Alert
                type={decideModal.type === 'approve' ? 'success' : 'warning'} showIcon style={{ marginBottom: 12 }}
                message={decideModal.type === 'approve'
                  ? '通过后将自动分配 MCxxxx 网吧 ID，网吧主可分享给代理发起关联申请'
                  : '驳回后网吧主可重新提交录入申请，请填写明确驳回原因'}
              />
              <Input.TextArea rows={3} value={decideRemark} onChange={(e) => setDecideRemark(e.target.value)}
                placeholder={decideModal.type === 'approve' ? '审核备注（选填）' : '驳回原因（必填）'}
                maxLength={200} showCount />
            </>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}
