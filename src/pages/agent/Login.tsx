import { useState } from 'react';
import {
  Form, Input, Button, Card, Tabs, Checkbox, Typography, Space, message,
  Modal, Alert, Descriptions, Tag, Row, Col, Cascader,
} from 'antd';

import {
  LockOutlined, CustomerServiceOutlined, SafetyCertificateOutlined,
  UserAddOutlined, LoginOutlined, QqOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/brand-logo.png';
import { loginSettlementAccount, provinceCityOptions, submitAgentAccountApplication } from '../../mock/data';


const { Title, Paragraph } = Typography;

const QQ_RULE = /^[1-9]\d{4,11}$/;

type LoginValues = { qq: string; password: string };
type RegisterValues = {
  qq: string;
  password: string;
  confirmPassword: string;
  realName: string;
  phone: string;
  region: string[];
  address: string;
  idCardNo: string;
};


type PendingInfo = {
  account: string;
  status: string;
};

export default function AgentLogin() {
  const navigate = useNavigate();
  const [registerForm] = Form.useForm<RegisterValues>();
  const [activeTab, setActiveTab] = useState('login');
  const [pendingInfo, setPendingInfo] = useState<PendingInfo | null>(null);

  const showContact = () => message.info('请联系平台客服');

  const onPasswordLogin = (values: LoginValues) => {
    const result = loginSettlementAccount(values.qq, values.password);
    if (!result.ok) {
      if (result.reason === 'pending') {
        setPendingInfo({
          account: result.account?.qq || values.qq,
          status: '审核中',
        });
        return;
      }
      if (result.reason === 'rejected') {
        message.error('账号审核未通过');
        return;
      }
      message.error('QQ号或密码不正确');
      return;
    }
    message.success('登录成功');
    navigate('/agent/dashboard');
  };

  const onCreateAgentAccount = (values: RegisterValues) => {
    const [province, city] = values.region || [];
    const app = submitAgentAccountApplication({
      password: values.password,
      contact: values.realName,
      qq: values.qq,
      realName: values.realName,
      phone: values.phone,
      province,
      city,
      address: values.address,
      idCardNo: values.idCardNo,
    });
    setPendingInfo({ account: app.qq, status: '审核中' });
    message.success('提交成功');
    registerForm.resetFields();
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
            结算平台
          </Paragraph>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0A0A0A' }}>
        <Card style={{ width: activeTab === 'register' ? 560 : 460, padding: '24px 8px', background: '#1A1212', border: '1px solid #2A1A1C' }}>

          <Space align="center" style={{ marginBottom: 24 }}>
            <SafetyCertificateOutlined style={{ fontSize: 28, color: '#FF5562' }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>结算平台登录</Title>
          </Space>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'login',
                label: <span><LoginOutlined /> QQ 登录</span>,
                children: <PasswordLoginPane onLogin={onPasswordLogin} showContact={showContact} />,
              },
              {
                key: 'register',
                label: <span><UserAddOutlined /> 创建账号</span>,
                children: <AgentAccountRegisterPane form={registerForm} onSubmit={onCreateAgentAccount} />,
              },
            ]}
          />

          <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.12)' }}>
            <Space split={<span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>} size={8}>
              <a style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} onClick={showContact}>
                <CustomerServiceOutlined /> 联系客服
              </a>
              <a style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} onClick={() => navigate('/admin/audit')}>
                平台管理
              </a>
            </Space>
          </div>
        </Card>
      </div>

      <PendingReviewModal info={pendingInfo} onClose={() => setPendingInfo(null)} />
    </div>
  );
}

function PendingReviewModal({ info, onClose }: { info: PendingInfo | null; onClose: () => void }) {
  return (
    <Modal title="审核中" open={!!info} onCancel={onClose} footer={null} width={600} destroyOnClose>
      {info && (
        <>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 18 }}
            message="您的账号正在审核中，请耐心等待，如需加急，请联系：13871535875"
          />
          <Descriptions column={1} labelStyle={{ width: 110, color: '#20304A' }} contentStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="用户账号">{info.account}</Descriptions.Item>
            <Descriptions.Item label="审核状态"><Tag>{info.status}</Tag></Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  );
}

function PasswordLoginPane({ onLogin, showContact }: { onLogin: (values: LoginValues) => void; showContact: () => void }) {
  return (
    <Form layout="vertical" onFinish={onLogin} requiredMark={false}>
      <Form.Item
        label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>QQ号</span>}
        name="qq"
        rules={[{ required: true, message: '请输入QQ号' }, { pattern: QQ_RULE, message: 'QQ号格式不正确' }]}
      >
        <Input prefix={<QqOutlined />} placeholder="请输入QQ号" size="large" maxLength={12} />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>登录密码</span>}
        name="password"
        rules={[{ required: true, message: '请输入登录密码' }, { min: 6, message: '密码至少 6 位' }]}
      >
        <Input.Password prefix={<LockOutlined />} size="large" placeholder="请输入密码" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox defaultChecked style={{ color: 'rgba(255,255,255,0.65)' }}>7 天内自动登录</Checkbox>
          <a style={{ color: '#FF5562', fontSize: 12 }} onClick={() => message.info('密码找回申请已提交')}>找回密码</a>
        </div>
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <Button type="primary" htmlType="submit" size="large" block style={{ fontWeight: 600, height: 44 }}>
          登录
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        <a style={{ color: '#FF5562', fontSize: 12 }} onClick={showContact}>登录遇到问题？联系客服</a>
      </div>
    </Form>
  );
}

function AgentAccountRegisterPane({
  form, onSubmit,
}: {
  form: ReturnType<typeof Form.useForm<RegisterValues>>[0];
  onSubmit: (values: RegisterValues) => void;
}) {
  return (
    <div style={{ paddingTop: 4 }}>
      <Form form={form} layout="vertical" requiredMark onFinish={onSubmit}>
        <Form.Item label="QQ号" name="qq" rules={[{ required: true, message: '请输入QQ号' }, { pattern: QQ_RULE, message: 'QQ号格式不正确' }]}>
          <Input prefix={<QqOutlined />} placeholder="请输入QQ号" maxLength={12} />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="登录密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少 6 位' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="确认密码" name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: '请再次输入密码' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('两次密码不一致')); } })]}>
              <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="姓名" name="realName" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入真实姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="电话" name="phone" rules={[{ required: true, message: '请输入电话' }, { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }]}>
              <Input placeholder="请输入电话" maxLength={11} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="地区" name="region" rules={[{ required: true, message: '请选择地区' }]}>
          <Cascader options={provinceCityOptions} placeholder="请选择省 / 市" />
        </Form.Item>
        <Form.Item label="地址" name="address" rules={[{ required: true, message: '请输入地址' }]}>
          <Input placeholder="请输入详细地址" />
        </Form.Item>
        <Form.Item
          label="身份证实名"
          name="idCardNo"
          rules={[
            { required: true, message: '请输入身份证号' },
            { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' },
          ]}
        >
          <Input placeholder="请输入本人身份证号" maxLength={18} />
        </Form.Item>
        <Button type="primary" htmlType="submit" block size="large">

          提交审核
        </Button>
      </Form>
    </div>
  );
}
