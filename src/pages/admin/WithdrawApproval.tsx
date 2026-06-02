import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, message, Row, Col, Statistic, Alert, Descriptions, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FileImageOutlined } from '@ant-design/icons';
import { withdrawApprovals } from '../../mock/data';

export default function WithdrawApproval() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);

  const onApprove = () => {
    message.success(`已批准 ${current.applicant} 的提现申请 ¥${current.amount}`);
    setReviewOpen(false);
  };

  const onReject = () => {
    message.warning(`已驳回 ${current.applicant} 的提现申请`);
    setRejectOpen(false);
  };

  const columns = [
    { title: '申请时间', dataIndex: 'applyTime', width: 160 },
    { title: '提现单号', dataIndex: 'id', width: 180 },
    {
      title: '申请方', dataIndex: 'applicant', width: 160,
      render: (v: string, r: any) => (
        <Space>
          <span>{v}</span>
          <Tag color={r.type === 'agent' ? 'blue' : 'green'}>{r.type === 'agent' ? '代理' : '网吧主'}</Tag>
        </Space>
      ),
    },
    {
      title: '金额', dataIndex: 'amount', align: 'right' as const, width: 130,
      render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span>,
    },
    { title: '收款账户', dataIndex: 'account', width: 180 },
    {
      title: '合同状态', key: 'contract', width: 120,
      render: (_: any, r: any) => {
        // demo 规则：仅 'auto'（小额自动）以外的代理需要校验合同；这里 demo 都设为已生效
        const has = r.applicant !== '燕赵网络'; // 给一个反例：燕赵网络无合同
        return has
          ? <Tag color="success">✓ 已生效</Tag>
          : <Tag color="error">✗ 缺合同</Tag>;
      },
    },
    {
      title: '发票', dataIndex: 'invoice', width: 100,
      render: (v: boolean, r: any) => r.type === 'cafe' ? <Tag>免</Tag> : v ? <Tag color="success">已上传</Tag> : <Tag color="error">缺失</Tag>,
    },
    {
      title: '风险等级', dataIndex: 'risk', width: 110,
      render: (v: string) =>
        v === 'low' ? <Tag color="success">低</Tag> :
          v === 'medium' ? <Tag color="warning">中</Tag> :
            <Tag color="error">高</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', width: 130,
      render: (v: string) => {
        const map: any = {
          pending: { color: 'processing', text: '🟡 待审核' },
          reviewing: { color: 'blue', text: '🔵 审核中' },
          auto: { color: 'success', text: '🟢 自动放行' },
          rejected: { color: 'error', text: '🔴 已驳回' },
        };
        return <Tag color={map[v].color}>{map[v].text}</Tag>;
      },
    },
    {
      title: '操作', width: 200, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Space>
          <a onClick={() => { setCurrent(r); setReviewOpen(true); }}>
            <EyeOutlined /> 审核
          </a>
          {r.status === 'pending' && (
            <>
              <a style={{ color: '#52C41A' }} onClick={() => { setCurrent(r); setReviewOpen(true); }}>
                通过
              </a>
              <a style={{ color: '#F5222D' }} onClick={() => { setCurrent(r); setRejectOpen(true); }}>
                驳回
              </a>
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = withdrawApprovals.filter((w) => w.status === 'pending').length;
  const totalAmount = withdrawApprovals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>提现审批</h2>
      </div>

      {pendingCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`您有 ${pendingCount} 笔提现申请待审批，涉及金额 ¥${totalAmount.toLocaleString()}`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="今日待审批" value={pendingCount} suffix="笔" valueStyle={{ color: '#FAAD14' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待审批金额" value={totalAmount} prefix="¥" valueStyle={{ color: '#FF7A00' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="本月已审批" value={48} suffix="笔" valueStyle={{ color: '#52C41A' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="本月驳回率" value={2.1} suffix="%" /></Card>
        </Col>
      </Row>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={withdrawApprovals}
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 审核弹窗 */}
      <Modal
        title="提现审批"
        open={reviewOpen}
        onCancel={() => setReviewOpen(false)}
        width={680}
        footer={
          <Space>
            <Button onClick={() => setReviewOpen(false)}>取消</Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => { setReviewOpen(false); setRejectOpen(true); }}>
              驳回
            </Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={onApprove}>
              通过
            </Button>
          </Space>
        }
      >
        {current && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="提现单号">{current.id}</Descriptions.Item>
              <Descriptions.Item label="申请时间">{current.applyTime}</Descriptions.Item>
              <Descriptions.Item label="申请方">
                {current.applicant} <Tag color={current.type === 'agent' ? 'blue' : 'green'}>{current.type === 'agent' ? '代理' : '网吧主'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="风险等级">
                {current.risk === 'low' ? <Tag color="success">低</Tag> :
                  current.risk === 'medium' ? <Tag color="warning">中</Tag> : <Tag color="error">高</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="提现金额">
                <span className="money" style={{ fontSize: 18 }}>¥ {current.amount.toLocaleString()}</span>
              </Descriptions.Item>
              <Descriptions.Item label="收款账户">{current.account}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="📊 申请方近 3 个月提现记录" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="累计提现" value={3680} prefix="¥" />
                </Col>
                <Col span={8}>
                  <Statistic title="提现笔数" value={3} suffix="笔" />
                </Col>
                <Col span={8}>
                  <Statistic title="账户余额" value={5720} prefix="¥" />
                </Col>
              </Row>
            </Card>

            {current.invoice && (
              <Card size="small" title={<><FileImageOutlined /> 发票预览</>}>
                <div style={{ height: 180, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'rgba(0,0,0,0.35)' }}>
                  [增值税普通发票预览图]
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
                  发票号：04401200<strong>26052812</strong> · 开票金额：¥{current.amount.toLocaleString()} · 开票日期：2026-05-17
                </div>
              </Card>
            )}

            <Divider />
            <Alert type="info" showIcon message="审批通过后系统将自动调用银行代付接口，预计 3-5 工作日打款" />
          </>
        )}
      </Modal>

      {/* 驳回弹窗 */}
      <Modal
        title="驳回原因"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={onReject}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical">
          <Form.Item label="驳回原因" required>
            <Input.TextArea rows={4} placeholder="请说明驳回原因，将通知申请方" />
          </Form.Item>
          <Form.Item label="是否扣回已结算金额">
            <Space direction="vertical">
              <span>反作弊扣回 / 错算扣回时，应在此处勾选</span>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
