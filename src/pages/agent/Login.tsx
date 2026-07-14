import { useState } from 'react';
import {
  Form, Input, Button, Card, Tabs, Checkbox, Typography, Space, message,
  Alert, Steps, Divider, Row, Col, Tag,
} from 'antd';
import {
  LockOutlined, QqOutlined, CustomerServiceOutlined, SafetyCertificateOutlined,
  UserOutlined, UserAddOutlined, LoginOutlined, TeamOutlined, CheckCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/brand-logo.png';
import { loginSettlementAccount, submitParentAccountApplication } from '../../mock/data';

const { Title, Paragraph, Text } = Typography;
const QQ_BLUE = '#12B7F5';

type LoginValues = { username: string; password: string };
type RegisterValues = {
  accountName: string;
  password: string;
  confirmPassword: string;
  contact: string;
  phone: string;
  companyName: string;
};

export default function AgentLogin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [qqVerified, setQqVerified] = useState(false);
  const [qqAccount, setQqAccount] = useState('');
  const [registerForm] = Form.useForm<RegisterValues>();

  const showContact = () => message.info('联系客服：请联系对应区域经理，或添加客服 QQ 8008208820（Demo）');

  const onPasswordLogin = (values: LoginValues) => {
    const result = loginSettlementAccount(values.username, values.password);
    if (!result.ok) {
      if (result.reason === 'pending') {
        message.warning('该母账号仍在平台审批中，通过后才能登录');
        return;
      }
      if (result.reason === 'rejected') {
        message.error('该母账号申请已被驳回，请按原因重新提交');
        return;
      }
      message.error('账号或密码不正确。可试用：lijg / 123456，子账号：sub_sz / 123456');
      return;
    }
    message.success(result.account?.accountType === 'child'
      ? '子账号登录成功，终端与流水数据已自动关联母账号'
      : '母账号登录成功');
    navigate('/agent/dashboard');
  };

  const mockQqVerify = () => {
    setQqVerified(true);
    setQqAccount('2727994919');
    message.success('QQ 一次鉴权通过，已绑定本次母账号创建申请（Demo）');
  };

  const onCreateParentAccount = (values: RegisterValues) => {
    if (!qqVerified) {
      message.warning('请先完成 QQ 一次鉴权');
      return;
    }
    const app = submitParentAccountApplication({
      accountName: values.accountName,
      password: values.password,
      qq: qqAccount,
      contact: values.contact,
      phone: values.phone,
      companyName: values.companyName,
    });
    message.success(`母账号创建申请已提交平台审批：${app.applicationId}`);
    registerForm.resetFields();
    setQqVerified(false);
    setQqAccount('');
    setActiveTab('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0A0A0A' }}>
      <div
        style={{
          flex: 1.4,
          background: 'radial-gradient(ellipse at top left, #4A0E10 0%, #1A0608 50%, #0A0A0A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 48,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -150, right: -150, width: 480, height: 480, background: 'radial-gradient(circle, rgba(255,46,62,0.30) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            <img src={brandLogo} alt="霸服俱乐部" style={{ height: 72, width: 'auto', display: 'block' }} />
          </div>
          <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 20, maxWidth: 520, marginBottom: 8 }}>
            账密登录 / 母账号审批 / 子账号分发<br />
            结算平台统一入口
          </Paragraph>
          <Space size="large" style={{ marginTop: 32 }} wrap>
            <InfoCard value="母账号" label="用户自助创号后走平台审批" />
            <InfoCard value="子账号" label="母账号创建后可直接登录" />
            <InfoCard value="QQ鉴权" label="仅用于创号时一次核验" />
          </Space>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0A0A0A' }}>
        <Card style={{ width: 460, padding: '24px 8px', background: '#1A1212', border: '1px solid #2A1A1C' }}>
          <Space align="center" style={{ marginBottom: 24 }}>
            <SafetyCertificateOutlined style={{ fontSize: 28, color: '#FF5562' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>结算平台登录</Title>
          </Space>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 16, marginTop: -16 }}>
            全流程改为自定义账号 + 密码登录；QQ 仅在首次创号时做一次鉴权。
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'login',
                label: <span><LoginOutlined /> 账密登录</span>,
                children: <PasswordLoginPane onLogin={onPasswordLogin} showContact={showContact} />,
              },
              {
                key: 'register',
                label: <span><UserAddOutlined /> 创建母账号</span>,
                children: (
                  <ParentAccountRegisterPane
                    form={registerForm}
                    qqVerified={qqVerified}
                    qqAccount={qqAccount}
                    onQqVerify={mockQqVerify}
                    onSubmit={onCreateParentAccount}
                  />
                ),
              },
            ]}
          />

          <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.12)' }}>
            <Space split={<span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>} size={8}>
              <a style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} onClick={showContact}>
                <CustomerServiceOutlined /> 联系客服
              </a>
              <a style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} onClick={() => navigate('/admin/audit')}>
                🔐 平台审核员入口
              </a>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ value, label }: { value: string; label: string }) {
  return (
    <Card style={{ background: 'rgba(255,46,62,0.08)', border: '1px solid rgba(255,46,62,0.25)', color: '#fff', minWidth: 140 }} styles={{ body: { padding: 16 } }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{label}</div>
    </Card>
  );
}

function PasswordLoginPane({ onLogin, showContact }: { onLogin: (values: LoginValues) => void; showContact: () => void }) {
  return (
    <Form layout="vertical" onFinish={onLogin} requiredMark={false}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 14 }}
        message="母账号需平台审批通过；子账号由母账号创建后可直接账密登录。"
      />
      <Form.Item
        label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>登录账号</span>}
        name="username"
        initialValue="lijg"
        rules={[{ required: true, message: '请输入登录账号' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="请输入自定义账号" size="large" />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>登录密码</span>}
        name="password"
        initialValue="123456"
        rules={[{ required: true, message: '请输入登录密码' }, { min: 6, message: '密码至少 6 位' }]}
      >
        <Input.Password prefix={<LockOutlined />} size="large" placeholder="请输入密码" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox defaultChecked style={{ color: 'rgba(255,255,255,0.65)' }}>7 天内自动登录</Checkbox>
          <a style={{ color: '#FF5562', fontSize: 12 }} onClick={() => message.info('已提交密码找回申请（Demo）')}>找回密码</a>
        </div>
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <Button type="primary" htmlType="submit" size="large" block style={{ fontWeight: 600, height: 44 }}>
          登录结算平台
        </Button>
      </Form.Item>

      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.8 }}>
        <div>演示母账号：<Text code>lijg / 123456</Text></div>
        <div>演示子账号：<Text code>sub_sz / 123456</Text>，数据自动归属母账号。</div>
        <a style={{ color: '#FF5562' }} onClick={showContact}>登录遇到问题？联系客服</a>
      </div>
    </Form>
  );
}

function ParentAccountRegisterPane({
  form, qqVerified, qqAccount, onQqVerify, onSubmit,
}: {
  form: ReturnType<typeof Form.useForm<RegisterValues>>[0];
  qqVerified: boolean;
  qqAccount: string;
  onQqVerify: () => void;
  onSubmit: (values: RegisterValues) => void;
}) {
  return (
    <div style={{ paddingTop: 4 }}>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 12 }}
        message="首次创建的账号一定是母账号，需平台审批后才能登录"
        description="创号流程使用自定义名称和密码；QQ 登录仅用于本次一次鉴权，不再作为日常登录方式。"
      />
      <Steps
        size="small"
        current={qqVerified ? 2 : 1}
        style={{ marginBottom: 16 }}
        items={[
          { title: '账密' },
          { title: 'QQ鉴权' },
          { title: '提交审批' },
        ]}
      />
      <Form form={form} layout="vertical" requiredMark onFinish={onSubmit}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="自定义账号名" name="accountName" rules={[{ required: true, message: '请输入账号名' }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/, message: '需以字母开头，4-20 位字母/数字/下划线' }]}>
              <Input prefix={<UserOutlined />} placeholder="如 lijg_sz" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="联系人" name="contact" rules={[{ required: true, message: '请输入联系人' }]}>
              <Input placeholder="请输入真实联系人" />
            </Form.Item>
          </Col>
        </Row>
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
        <Form.Item label="公司 / 工作室" name="companyName" rules={[{ required: true, message: '请输入公司或工作室名称' }]}>
          <Input placeholder="请输入主体名称" />
        </Form.Item>
        <Form.Item label="手机号码" name="phone" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}>
          <Input placeholder="用于平台审核联系" />
        </Form.Item>

        <Divider style={{ borderColor: '#2A1A1C', margin: '12px 0' }} />

        <Card size="small" style={{ background: '#150C0E', border: '1px solid #2A1A1C', marginBottom: 12 }}>
          <Space direction="vertical" size={10} style={{ width: '100%' }}>
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <Space>
                <QqOutlined style={{ color: QQ_BLUE }} />
                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>QQ 一次鉴权</Text>
                {qqVerified ? <Tag color="success" icon={<CheckCircleFilled />}>已鉴权 {qqAccount}</Tag> : <Tag icon={<ClockCircleOutlined />}>待鉴权</Tag>}
              </Space>
              <Button size="small" type={qqVerified ? 'default' : 'primary'} onClick={onQqVerify}>
                {qqVerified ? '重新鉴权' : '使用 QQ 鉴权'}
              </Button>
            </Space>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              QQ 仅用于证明创建人身份和后续客服核验；日常进入结算平台统一使用上方账密。
            </Text>
          </Space>
        </Card>

        <Button type="primary" htmlType="submit" block size="large" icon={<TeamOutlined />} disabled={!qqVerified}>
          提交母账号审批
        </Button>
      </Form>
    </div>
  );
}
