import { useState } from 'react';
import {
  Form, Input, Button, Card, Radio, Cascader, Select, Checkbox,
  Typography, Divider, Row, Col, Space, Steps, message, Tooltip,
} from 'antd';
import {
  ScanOutlined, SafetyCertificateOutlined, BankOutlined,
  UserOutlined, EnvironmentOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  registerRoleOptions, provinceCityOptions, bankOptions, type RegisterRole,
} from '../mock/data';
import LinkPicker from '../components/LinkPicker';

const { Title, Paragraph, Text } = Typography;

// 纯展示的"等待拉取"占位输入框（实名信息由人脸校验回填，demo 不交互）
function PulledInput({ value, placeholder }: { value?: string; placeholder: string }) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      readOnly
      style={{ background: '#1A1212', color: 'rgba(255,255,255,0.5)', borderColor: '#2A1A1C' }}
    />
  );
}

// 倒计时按钮（demo：点击仅提示"已发送"，无真实后台）
function CodeButton({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  const send = () => {
    if (count > 0) return;
    message.success(`${label}已发送（Demo 演示，无真实下发）`);
    setCount(60);
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };
  return (
    <Button onClick={send} disabled={count > 0} style={{ width: 110 }}>
      {count > 0 ? `${count}s` : '获取验证码'}
    </Button>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [role, setRole] = useState<RegisterRole>('agent');
  const [subject, setSubject] = useState<'personal' | 'company'>('personal');
  const [hasBank, setHasBank] = useState(true);
  const [faceVerified, setFaceVerified] = useState(false);

  const onSubmit = () => {
    message.success('注册提交成功！资质审核中，可先进入控制台录入网吧');
    // demo：注册成功后进入对应端，并带 ?from=register 触发"录入网吧"引导
    if (role === 'agent') navigate('/agent/dashboard?from=register');
    else {
      sessionStorage.setItem('demo_role', 'owner');
      navigate('/agent/dashboard?from=register');
    }
  };

  // 模拟人脸校验成功（点击二维码区域）
  const mockFace = () => {
    setFaceVerified(true);
    form.setFieldsValue({ realName: '王小明', idCard: '4403**********1234', accountName: '王小明' });
    message.success('人脸校验通过，已回填实名信息（Demo）');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* 顶部品牌 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <span className="brand-block" style={{ width: 40, height: 40, fontSize: 20 }}>霸</span>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>加盟入驻注册</Title>
          </Space>
          <Paragraph style={{ color: 'rgba(255,255,255,0.55)' }}>
            复用应用宝开发者认证能力 · 实名 / 联系方式 / 收款账户一站式登记
          </Paragraph>
        </div>

        <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
          <Steps
            size="small"
            current={faceVerified ? 1 : 0}
            style={{ marginBottom: 28 }}
            items={[
              { title: '选择主体' },
              { title: '实名认证' },
              { title: '联系方式' },
              { title: '收款账户' },
              { title: '提交审核' },
            ]}
          />

          <Form form={form} layout="vertical" requiredMark onFinish={onSubmit}>
            {/* ============ 区块 0：入驻角色 + 主体类型 ============ */}
            <Title level={5} style={{ color: '#FF5562' }}>① 入驻角色</Title>
            <Form.Item name="role" initialValue="agent">
              <Radio.Group
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%' }}
              >
                <Row gutter={12}>
                  {registerRoleOptions.map((opt) => (
                    <Col span={12} key={opt.value}>
                      <Radio.Button
                        value={opt.value}
                        style={{ width: '100%', height: 'auto', padding: 12, whiteSpace: 'normal', textAlign: 'left' }}
                      >
                        <div style={{ fontWeight: 600 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>{opt.desc}</div>
                      </Radio.Button>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>

            {role === 'owner' && (
              <Form.Item
                label="关联代理（选填）"
                name="agentLink"
                extra="输入代理 ID 可关联到对应代理；不填则由迪越直连结算"
              >
                <LinkPicker target="agent" />
              </Form.Item>
            )}
            {role === 'agent' && (
              <Form.Item
                label="关联已建网吧（选填）"
                name="cafeLink"
                extra="若你已有合作网吧，可输入网吧 ID 直接关联；也可创角后再录入网吧"
              >
                <LinkPicker target="cafe" />
              </Form.Item>
            )}

            <Form.Item label="主体性质" name="subject" initialValue="personal">
              <Radio.Group value={subject} onChange={(e) => setSubject(e.target.value)}>
                <Radio value="personal">个人（人脸识别认证）</Radio>
                <Radio value="company">企业（上传营业执照认证）</Radio>
              </Radio.Group>
            </Form.Item>

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 区块 1：实名认证（复用 YYB 人脸校验）============ */}
            <Title level={5} style={{ color: '#FF5562' }}>② 实名认证</Title>
            {subject === 'personal' ? (
              <Row gutter={24}>
                <Col span={10}>
                  <Text style={{ color: 'rgba(255,255,255,0.65)' }}>人脸校验</Text>
                  <div
                    onClick={mockFace}
                    style={{
                      marginTop: 8, cursor: 'pointer', border: '1px dashed #2A1A1C',
                      borderRadius: 8, padding: 20, textAlign: 'center',
                      background: faceVerified ? 'rgba(82,196,26,0.08)' : '#150C0E',
                    }}
                  >
                    {faceVerified ? (
                      <Space direction="vertical">
                        <CheckCircleFilled style={{ fontSize: 36, color: '#52C41A' }} />
                        <Text style={{ color: '#52C41A' }}>已通过身份校验</Text>
                      </Space>
                    ) : (
                      <Space direction="vertical">
                        <ScanOutlined style={{ fontSize: 36, color: '#FF2E3E' }} />
                        <Text style={{ color: 'rgba(255,255,255,0.65)' }}>微信扫码 → 关注应用宝 → 人脸核验</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>（Demo：点此模拟校验通过）</Text>
                      </Space>
                    )}
                  </div>
                </Col>
                <Col span={14}>
                  <Form.Item label="姓名" name="realName">
                    <PulledInput placeholder="等待人脸校验拉取..." />
                  </Form.Item>
                  <Form.Item label="身份证" name="idCard">
                    <PulledInput placeholder="等待人脸校验拉取..." />
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="企业名称" name="companyName" rules={[{ required: true }]}>
                    <Input placeholder="请输入营业执照全称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="统一社会信用代码" name="creditCode" rules={[{ required: true }]}>
                    <Input placeholder="18 位信用代码" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="营业执照上传" name="license">
                    <Button icon={<SafetyCertificateOutlined />}>点击上传营业执照（Demo 展示）</Button>
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 区块 2：联系方式 ============ */}
            <Title level={5} style={{ color: '#FF5562' }}>③ 联系方式</Title>
            <Form.Item label="联系人" name="contact" rules={[{ required: true, message: '请填写真实姓名' }]} extra="请填写真实姓名，虚假信息将影响资质审核">
              <Input prefix={<UserOutlined />} placeholder="请输入联系人" />
            </Form.Item>

            <Form.Item label="手机号码验证" required>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="phone" noStyle rules={[{ required: true, message: '请输入手机号' }]}>
                  <Input placeholder="请输入手机号码" />
                </Form.Item>
                <CodeButton label="手机验证码" />
              </Space.Compact>
              <Form.Item name="phoneCode" style={{ marginTop: 8, marginBottom: 0 }} rules={[{ required: true, message: '请输入手机验证码' }]}>
                <Input placeholder="请输入手机验证码" />
              </Form.Item>
            </Form.Item>

            <Form.Item label="邮箱地址验证" required>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="email" noStyle rules={[{ required: true, type: 'email', message: '请输入正确邮箱' }]}>
                  <Input placeholder="请输入邮箱地址" />
                </Form.Item>
                <CodeButton label="邮箱验证码" />
              </Space.Compact>
              <Form.Item name="emailCode" style={{ marginTop: 8, marginBottom: 0 }} rules={[{ required: true, message: '请输入邮箱验证码' }]}>
                <Input placeholder="请输入邮箱验证码" />
              </Form.Item>
            </Form.Item>

            <Form.Item label="联系地址" required>
              <Form.Item name="region" rules={[{ required: true, message: '请选择省份城市' }]}>
                <Cascader options={provinceCityOptions} placeholder="请选择省份城市" />
              </Form.Item>
              <Form.Item name="address" style={{ marginBottom: 0 }} rules={[{ required: true, message: '请填写详细地址' }]} extra="请填写真实地址，需具体到门牌号或房间号">
                <Input prefix={<EnvironmentOutlined />} placeholder="请输入有效地址" />
              </Form.Item>
            </Form.Item>

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 区块 3：银行账号（结算提现核心）============ */}
            <Title level={5} style={{ color: '#FF5562' }}>④ 收款账户（结算提现）</Title>
            <Form.Item label="是否有银行账号" name="hasBank" initialValue="yes">
              <Radio.Group value={hasBank ? 'yes' : 'no'} onChange={(e) => setHasBank(e.target.value === 'yes')}>
                <Radio value="yes">是</Radio>
                <Radio value="no">否（可先入驻，提现前补全）</Radio>
              </Radio.Group>
            </Form.Item>

            {hasBank && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={
                    <span>开户名 <Tooltip title="须与实名 / 企业主体一致，否则提现会因'户名不符'失败"><SafetyCertificateOutlined style={{ color: '#FAAD14' }} /></Tooltip></span>
                  } name="accountName">
                    <PulledInput placeholder="等待实名信息拉取..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="开户行" name="bank" rules={[{ required: true, message: '请选择开户行' }]}>
                    <Select placeholder="请选择开户行" prefix={<BankOutlined />} options={bankOptions.map((b) => ({ value: b, label: b }))} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="银行账号" name="bankAccount" rules={[{ required: true, message: '请输入银行账号' }]}>
                    <Input placeholder="请输入银行账号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="确认银行账号" name="bankAccountConfirm"
                    dependencies={['bankAccount']}
                    rules={[
                      { required: true, message: '请再次输入银行账号' },
                      ({ getFieldValue }) => ({
                        validator(_, v) {
                          if (!v || getFieldValue('bankAccount') === v) return Promise.resolve();
                          return Promise.reject(new Error('两次输入的银行账号不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input placeholder="请确认银行账号" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 协议 + 提交 ============ */}
            <Form.Item name="agreeSms" valuePropName="checked" rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject(new Error('请同意接收审核通知短信')) }]}>
              <Checkbox style={{ color: 'rgba(255,255,255,0.75)' }}>同意接受审核通知短信到此手机号码，手机号将严格保密</Checkbox>
            </Form.Item>
            <Form.Item name="agreeProtocol" valuePropName="checked" rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject(new Error('请同意合作协议')) }]}>
              <Checkbox style={{ color: 'rgba(255,255,255,0.75)' }}>
                同意接受 <a style={{ color: '#FF5562' }}>《手助网吧加盟合作协议》</a>，在网吧终端分发应用并参与结算
              </Checkbox>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Space>
                <Button onClick={() => navigate('/')}>返回</Button>
                <Button type="primary" htmlType="submit" size="large" style={{ paddingInline: 40 }}>
                  提交注册
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          © 2026 手助网吧项目组 · 内部演示，数据均为模拟
        </div>
      </div>
    </div>
  );
}
