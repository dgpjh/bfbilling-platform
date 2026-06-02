import { useState } from 'react';
import { Card, Table, Tag, Space, Button, Modal, Input, Descriptions, message, Row, Col, Statistic } from 'antd';
import { FileProtectOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, AuditOutlined } from '@ant-design/icons';
import { adminContractQueue } from '../../mock/data';

const { TextArea } = Input;

export default function AdminContractAudit() {
  const [detail, setDetail] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const stats = {
    pending: adminContractQueue.filter((c) => c.status === 'pending').length,
    reviewing: adminContractQueue.filter((c) => c.status === 'reviewing').length,
    rejected: adminContractQueue.filter((c) => c.status === 'rejected').length,
    today: 2,
  };

  const handleApprove = (row: any) => {
    Modal.confirm({
      title: '确认审核通过？',
      content: `合同 ${row.id}（${row.agent}）将进入生效状态，对应代理可发起提现。`,
      okText: '确认通过',
      cancelText: '取消',
      onOk: () => message.success('审核通过，合同已生效'),
    });
  };

  const handleReject = () => {
    if (!reason.trim()) {
      message.error('请填写驳回原因');
      return;
    }
    message.success('已驳回，已通知代理');
    setRejectOpen(false);
    setReason('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>合同审核</h2>
        <div style={{ color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>
          法务/运营审核代理录入的合同；通过后代理方可参与月度结算与提现。
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="待审核" value={stats.pending} suffix="份" valueStyle={{ color: '#FAAD14' }} prefix={<AuditOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="审核中" value={stats.reviewing} suffix="份" valueStyle={{ color: '#2B5BD7' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="近期驳回" value={stats.rejected} suffix="份" valueStyle={{ color: '#FF2E3E' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日已处理" value={stats.today} suffix="份" valueStyle={{ color: '#52C41A' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title={<span><FileProtectOutlined /> &nbsp;待审核合同队列</span>}>
        <Table
          rowKey="id"
          pagination={{ pageSize: 10 }}
          dataSource={adminContractQueue}
          columns={[
            { title: '合同编号', dataIndex: 'id', width: 160 },
            { title: '提交代理', dataIndex: 'agent', width: 140 },
            { title: '合同类型', dataIndex: 'type', width: 130, render: (v) => <Tag>{v}</Tag> },
            { title: '关键条款', dataIndex: 'amount', width: 160 },
            { title: '提交时间', dataIndex: 'uploadAt', width: 170 },
            {
              title: '风险',
              dataIndex: 'risk',
              width: 90,
              render: (v: string) =>
                v === 'low' ? <Tag color="success">低</Tag> :
                  v === 'medium' ? <Tag color="warning">中</Tag> :
                    <Tag color="error">高</Tag>,
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 110,
              render: (v: string) =>
                v === 'pending' ? <Tag color="processing">待审核</Tag> :
                  v === 'reviewing' ? <Tag color="warning">审核中</Tag> :
                    v === 'rejected' ? <Tag color="error">已驳回</Tag> :
                      <Tag color="success">已通过</Tag>,
            },
            {
              title: '操作',
              key: 'op',
              width: 220,
              render: (_, r: any) => (
                <Space>
                  <a onClick={() => setDetail(r)}><EyeOutlined /> 详情</a>
                  {(r.status === 'pending' || r.status === 'reviewing') && (
                    <>
                      <a style={{ color: '#52C41A' }} onClick={() => handleApprove(r)}>
                        <CheckCircleOutlined /> 通过
                      </a>
                      <a style={{ color: '#FF2E3E' }} onClick={() => { setDetail(r); setRejectOpen(true); }}>
                        <CloseCircleOutlined /> 驳回
                      </a>
                    </>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* 详情 */}
      <Modal
        title="合同详情"
        open={!!detail && !rejectOpen}
        onCancel={() => setDetail(null)}
        footer={[
          <Button key="dl">下载合同</Button>,
          <Button key="close" type="primary" onClick={() => setDetail(null)}>关闭</Button>,
        ]}
        width={680}
      >
        {detail && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="合同编号" span={2}>{detail.id}</Descriptions.Item>
            <Descriptions.Item label="提交代理">{detail.agent}</Descriptions.Item>
            <Descriptions.Item label="合同类型">{detail.type}</Descriptions.Item>
            <Descriptions.Item label="关键条款" span={2}>{detail.amount}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{detail.uploadAt}</Descriptions.Item>
            <Descriptions.Item label="风险等级">
              {detail.risk === 'low' ? <Tag color="success">低</Tag> : detail.risk === 'medium' ? <Tag color="warning">中</Tag> : <Tag color="error">高</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="附件" span={2}>
              <a>📎 {detail.agent}-{detail.type}.pdf</a>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 驳回 */}
      <Modal
        title="驳回合同"
        open={rejectOpen}
        onCancel={() => { setRejectOpen(false); setReason(''); }}
        onOk={handleReject}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p style={{ marginBottom: 12 }}>
          合同：<b>{detail?.id}</b>（{detail?.agent}）
        </p>
        <TextArea
          rows={4}
          placeholder="请填写驳回原因，将通知给代理"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
