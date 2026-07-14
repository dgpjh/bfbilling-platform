import { useMemo, useState } from 'react';
import {
  Alert, Button, Card, Col, Descriptions, Form, Input, Modal, Row, Select,
  Space, Statistic, Table, Tag, Typography, message,
} from 'antd';
import {
  PlusOutlined, TeamOutlined, UserOutlined, LockOutlined, ApartmentOutlined,
  DesktopOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import {
  CURRENT_AGENT_ID,
  calculateMonthlyTerminalSettlement,
  createChildSettlementAccount,
  getCafesByAgent,
  getChildAccountsByParent,
  getParentSettlementAccount,
  summarizeCafes,
  type ChildAccountRole,
  type SettlementAccount,
} from '../../mock/data';

const { Text, Title, Paragraph } = Typography;

type ChildFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: ChildAccountRole;
};

export default function AccountManagement() {
  const parentAccount = getParentSettlementAccount();
  const [childAccounts, setChildAccounts] = useState<SettlementAccount[]>(() => getChildAccountsByParent(parentAccount.accountId));
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<ChildFormValues>();

  const summary = useMemo(() => summarizeCafes(getCafesByAgent(CURRENT_AGENT_ID)), []);
  const settlement = calculateMonthlyTerminalSettlement(summary.monthlyActiveTerminal);

  const submitChildAccount = async () => {
    const values = await form.validateFields();
    const account = createChildSettlementAccount({
      username: values.username,
      password: values.password,
      displayName: values.displayName,
      role: values.role,
      parentAccountId: parentAccount.accountId,
    });
    setChildAccounts(getChildAccountsByParent(parentAccount.accountId));
    setOpen(false);
    form.resetFields();
    message.success(`子账号已创建：${account.username}，可直接使用账密登录结算平台`);
  };

  const columns = [
    { title: '账号 ID', dataIndex: 'accountId', width: 120, render: (v: string) => <Tag color="blue">{v}</Tag> },
    {
      title: '登录账号', dataIndex: 'username', width: 160,
      render: (v: string, r: SettlementAccount) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.displayName}</Text>
        </Space>
      ),
    },
    { title: '账号角色', dataIndex: 'roleLabel', width: 160, render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: '归属母账号', key: 'parent', width: 160, render: () => <Tag color="gold">{parentAccount.username}</Tag> },
    { title: '数据范围', key: 'scope', width: 220, render: () => '自动继承母账号的终端、网吧、流水数据' },
    { title: '状态', dataIndex: 'authStatus', width: 110, render: () => <Tag color="success" icon={<CheckCircleOutlined />}>可登录</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', width: 120 },
    { title: '最近登录', dataIndex: 'lastLoginAt', width: 150, render: (v?: string) => v || '-' },
  ];

  return (
    <div>
      <Card
        style={{ background: 'linear-gradient(135deg,#2A1416 0%,#1A1212 100%)', border: '1px solid #3A2024', marginBottom: 16 }}
        styles={{ body: { padding: 22 } }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="auto">
            <Space align="center" wrap>
              <ApartmentOutlined style={{ color: '#FF5562', fontSize: 28 }} />
              <Title level={4} style={{ color: '#fff', margin: 0 }}>子母账号管理</Title>
              <Tag color="gold">母账号创建子账号</Tag>
              <Tag color="green">子账号可直接账密登录</Tag>
            </Space>
            <Paragraph style={{ color: 'rgba(255,255,255,0.58)', margin: '10px 0 0' }}>
              当前登录界面自助创建的一定是母账号，需平台审批；母账号审批通过后，可在此创建关联子账号给子代理或网吧主使用，子账号的终端、网吧、流水数据自动归属母账号。
            </Paragraph>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>创建子账号</Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card title={<span style={{ color: '#fff' }}>母账号信息</span>} style={{ height: '100%' }}>
            <Descriptions column={1} size="middle" labelStyle={{ color: 'rgba(255,255,255,0.45)', width: 110 }} contentStyle={{ color: 'rgba(255,255,255,0.92)' }}>
              <Descriptions.Item label="账号 ID"><Tag color="gold">{parentAccount.accountId}</Tag></Descriptions.Item>
              <Descriptions.Item label="登录账号">{parentAccount.username}</Descriptions.Item>
              <Descriptions.Item label="联系人">{parentAccount.displayName}</Descriptions.Item>
              <Descriptions.Item label="账号类型"><Tag color="red">母账号 / 代理负责人</Tag></Descriptions.Item>
              <Descriptions.Item label="QQ 鉴权">{parentAccount.qqVerified ? <Tag color="success">已完成</Tag> : <Tag>未鉴权</Tag>}</Descriptions.Item>
              <Descriptions.Item label="审批状态"><Tag color="success">已通过</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<span style={{ color: '#fff' }}>子账号继承数据范围</span>} style={{ height: '100%' }}>
            <Row gutter={16}>
              <Col span={8}><Statistic title="关联网吧" value={summary.cafeCount} suffix="家" prefix={<TeamOutlined />} /></Col>
              <Col span={8}><Statistic title="终端规模" value={summary.terminalScaleCount} suffix="台" prefix={<DesktopOutlined />} /></Col>
              <Col span={8}><Statistic title="预估结算" value={settlement.amount} prefix="¥" groupSeparator="," /></Col>
            </Row>
            <Alert
              type="info"
              showIcon
              style={{ marginTop: 16 }}
              message="子账号不单独产生结算主体"
              description="子账号仅作为协作登录入口，查看和操作的数据均自动关联到母账号，终端结算也统一汇总到母账号。"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<span style={{ color: '#fff' }}>已创建子账号（{childAccounts.length}）</span>}
        extra={<Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>新增子账号</Button>}
      >
        <Table rowKey="accountId" columns={columns} dataSource={childAccounts} scroll={{ x: 1250 }} pagination={false} />
      </Card>

      <Modal
        title="创建子账号"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submitChildAccount}
        okText="创建并启用"
        cancelText="取消"
        width={620}
        destroyOnClose
      >
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 14 }}
          message="子账号无需平台审批，创建后可直接账密登录结算平台"
          description="子账号终端、网吧、流水和结算数据自动关联当前母账号。"
        />
        <Form form={form} layout="vertical" requiredMark>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="登录账号" name="username" rules={[{ required: true, message: '请输入登录账号' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/, message: '需以字母开头，4-20 位字母/数字/下划线' }]}>
                <Input prefix={<UserOutlined />} placeholder="如 sub_baoan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="展示名称" name="displayName" rules={[{ required: true, message: '请输入展示名称' }]}>
                <Input placeholder="如 宝安子代理" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="账号用途" name="role" initialValue="subAgent" rules={[{ required: true, message: '请选择账号用途' }]}>
            <Select
              options={[
                { value: 'subAgent', label: '子代理：协助管理名下网吧和流水' },
                { value: 'cafeOwner', label: '网吧主：查看关联网吧数据' },
              ]}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="登录密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少 6 位' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="确认密码" name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: '请再次输入密码' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('两次密码不一致')); } })]}>
                <Input.Password prefix={<LockOutlined />} placeholder="再次输入密码" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
