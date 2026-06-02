import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Modal, Form, InputNumber, Select, Upload, Input, Table, Tag, Space, Statistic, Steps, message, Alert, Tooltip } from 'antd';
import { WalletOutlined, BankOutlined, PlusOutlined, UploadOutlined, FileProtectOutlined, CheckCircleFilled, LockOutlined } from '@ant-design/icons';
import { withdrawHistory, heroStats, contractGate } from '../../mock/data';

export default function AgentWithdraw() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(heroStats.withdrawable);

  const canWithdraw = contractGate.hasActiveContract;
  const tax = (amount || 0) * 0.068;
  const actual = (amount || 0) - tax;

  const onSubmit = () => {
    message.success('提现申请已提交，预计 3-5 个工作日到账');
    setOpen(false);
  };

  const handleClickWithdraw = () => {
    if (!canWithdraw) {
      Modal.warning({
        title: '提现已锁定',
        content: '系统检测到您当前没有生效中的合作合同，无法发起提现。请先前往「合同管理」录入合同并完成审核。',
        okText: '前往合同管理',
        onOk: () => navigate('/agent/contracts'),
      });
      return;
    }
    setOpen(true);
  };

  const columns = [
    { title: '申请时间', dataIndex: 'applyTime', width: 160 },
    { title: '提现单号', dataIndex: 'id', width: 180 },
    {
      title: '金额',
      dataIndex: 'amount',
      align: 'right' as const,
      render: (v: number) => <span className="money">¥ {v.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>,
    },
    { title: '收款方式', dataIndex: 'account', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) =>
        v === 'paid' ? <Tag color="success">🟢 已到账</Tag> :
          v === 'failed' ? <Tag color="error">🔴 失败</Tag> :
            <Tag color="processing">🟡 处理中</Tag>,
    },
    { title: '备注', dataIndex: 'remark', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>提现管理</h2>
      </div>

      {/* 合同状态横幅 */}
      {canWithdraw ? (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          style={{ marginBottom: 16 }}
          message={
            <span>
              已检测到生效合同：<b>{contractGate.primaryContract?.name || '代理合作合同'}</b>
              <span style={{ marginLeft: 8, color: 'rgba(0,0,0,0.45)' }}>
                · 有效期至 {contractGate.primaryContract?.effectiveEnd || '—'}
              </span>
            </span>
          }
          action={<a onClick={() => navigate('/agent/contracts')}>查看合同</a>}
        />
      ) : (
        <Alert
          type="error"
          showIcon
          icon={<LockOutlined />}
          style={{ marginBottom: 16 }}
          message={<b>提现已锁定 · 请先签署合作合同</b>}
          description="按平台规则，代理需在签署「代理合作合同」并审核生效后，方可发起提现申请。"
          action={
            <Button danger type="primary" icon={<FileProtectOutlined />} onClick={() => navigate('/agent/contracts')}>
              前往录入合同
            </Button>
          }
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="可提现余额"
              value={heroStats.withdrawable}
              precision={2}
              prefix="¥"
              valueStyle={{ color: canWithdraw ? '#FF7A00' : 'rgba(0,0,0,0.35)', fontSize: 28 }}
            />
            <Tooltip title={canWithdraw ? '' : '当前合同未生效，无法提现'}>
              <Button
                type="primary"
                size="large"
                icon={canWithdraw ? <WalletOutlined /> : <LockOutlined />}
                disabled={!canWithdraw}
                style={{ marginTop: 16, width: '100%' }}
                onClick={handleClickWithdraw}
              >
                {canWithdraw ? '立即提现' : '提现已锁定'}
              </Button>
            </Tooltip>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="冻结中" value={0} precision={2} prefix="¥" valueStyle={{ color: 'rgba(0,0,0,0.45)' }} />
            <div style={{ marginTop: 16, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              异常审核 / 反作弊扣回 / 发票补正中
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="累计已提现" value={48392.55} precision={2} prefix="¥" />
            <div style={{ marginTop: 16, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              加入起算 · 共 18 笔
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="我的收款方式" style={{ marginBottom: 16 }} extra={<a><PlusOutlined /> 添加银行账户</a>}>
        <Card type="inner" style={{ background: '#fafbfc' }}>
          <Row align="middle">
            <Col flex="48px">
              <BankOutlined style={{ fontSize: 32, color: '#2B5BD7' }} />
            </Col>
            <Col flex="auto">
              <div>
                <strong>工商银行 ****8821</strong>
                <Tag color="blue" style={{ marginLeft: 8 }}>默认</Tag>
              </div>
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                户名：星辰文化传媒有限公司 · 开户行：工行深圳科技园支行
              </div>
            </Col>
            <Col>
              <Space><a>设为默认</a><a>删除</a></Space>
            </Col>
          </Row>
        </Card>
      </Card>

      <Card title="提现记录">
        <Table rowKey="id" columns={columns} dataSource={withdrawHistory} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="申请提现"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="确认提现"
        width={520}
      >
        <Steps
          current={0}
          size="small"
          style={{ marginBottom: 24 }}
          items={[
            { title: '填写信息' },
            { title: '财务审核' },
            { title: '银行打款' },
            { title: '到账' },
          ]}
        />
        <Form layout="vertical">
          <Form.Item label="可提现余额">
            <span className="money" style={{ fontSize: 18 }}>¥ {heroStats.withdrawable.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
          </Form.Item>
          <Form.Item label="提现金额" required>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                style={{ flex: 1 }}
                size="large"
                min={1000}
                max={heroStats.withdrawable}
                precision={2}
                value={amount}
                onChange={(v) => setAmount(v || 0)}
                prefix="¥"
              />
              <Button size="large" onClick={() => setAmount(heroStats.withdrawable)}>全部</Button>
            </Space.Compact>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 4 }}>
              代理提现 ≥ 1000 元起，单笔最高 50 万元
            </div>
          </Form.Item>
          <Form.Item label="收款方式" required>
            <Select size="large" defaultValue="工行 ****8821">
              <Select.Option value="工行 ****8821">🏦 工商银行 ****8821（默认）</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="上传发票" required>
            <Upload>
              <Button icon={<UploadOutlined />}>选择增值税普通发票（PDF/JPG）</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="备注">
            <Input.TextArea rows={2} placeholder="选填" />
          </Form.Item>

          <Card type="inner" style={{ background: '#fffbe6' }}>
            <Row justify="space-between"><Col>申请金额</Col><Col className="money">¥ {amount?.toFixed(2)}</Col></Row>
            <Row justify="space-between" style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)' }}>
              <Col>综合税费 (6.8%)</Col>
              <Col>-¥ {tax.toFixed(2)}</Col>
            </Row>
            <Row justify="space-between" style={{ marginTop: 8, fontSize: 16 }}>
              <Col><strong>应到账金额</strong></Col>
              <Col className="money" style={{ fontWeight: 700 }}>¥ {actual.toFixed(2)}</Col>
            </Row>
            <div style={{ marginTop: 8, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              预计到账时间：3-5 个工作日
            </div>
          </Card>
        </Form>
      </Modal>
    </div>
  );
}
