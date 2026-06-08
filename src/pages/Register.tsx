import { useState } from 'react';
import {
  Form, Input, Button, Card, Radio, Cascader, Checkbox,
  Typography, Divider, Row, Col, Space, Steps, Alert, message,
} from 'antd';
import {
  ScanOutlined, SafetyCertificateOutlined,
  UserOutlined, EnvironmentOutlined, CheckCircleFilled, CustomerServiceOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  registerRoleOptions, provinceCityOptions,
} from '../mock/data';

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
  const [subject, setSubject] = useState<'personal' | 'company'>('personal');
  const [faceVerified, setFaceVerified] = useState(false);

  const showContact = () => message.info('联系客服：请联系对应区域经理，或添加客服 QQ 8008208820（Demo）');

  const onSubmit = () => {
    message.success('资质提交成功！审核中，可先进入代理控制台录入网吧');
    navigate('/agent/dashboard?from=register');
  };

  const mockFace = () => {
    setFaceVerified(true);
    form.setFieldsValue({ realName: '王小明', idCard: '4403**********1234' });
    message.success('人脸校验通过，已回填实名信息（Demo）');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* 顶部品牌 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <span className="brand-block" style={{ width: 40, height: 40, fontSize: 20 }}>霸</span>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>完善代理资质</Title>
          </Space>
          <Paragraph style={{ color: 'rgba(255,255,255,0.55)' }}>
现有 QQ 号登录 · 企业/个人主体认证 · 营业执照/实名/联系方式一站式登记
          </Paragraph>
          <Button size="small" type="link" icon={<CustomerServiceOutlined />} onClick={showContact}>
            联系客服
          </Button>
        </div>

        <Card style={{ background: '#1A1212', border: '1px solid #2A1A1C' }}>
          <Steps
            size="small"
            current={faceVerified ? 2 : 1}
            style={{ marginBottom: 28 }}
            items={[
              { title: 'QQ 创号' },
              { title: '选择主体' },
              { title: subject === 'company' ? '上传执照' : '实名认证' },
              { title: '联系方式' },
              { title: '提交审核' },
            ]}
          />

          <Form form={form} layout="vertical" requiredMark onFinish={onSubmit}>
            <Title level={5} style={{ color: '#FF5562' }}>① QQ 登录账号</Title>
            <Alert
              type="success" showIcon style={{ marginBottom: 16 }}
              message="QQ 账号已创建 / 已授权"
              description="Demo 中默认使用 QQ 号 123456789 作为登录账号。正式流程中，代理先完成 QQ 注册或授权登录，再继续完善代理主体资质。"
            />
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="QQ 号" name="qq" initialValue="123456789">
                  <Input readOnly style={{ background: '#1A1212', color: 'rgba(255,255,255,0.65)', borderColor: '#2A1A1C' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="账号状态">
                  <Input value="已登录，待完善代理资质" readOnly style={{ background: '#1A1212', color: 'rgba(255,255,255,0.65)', borderColor: '#2A1A1C' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 区块 0：入驻角色 + 主体类型 ============ */}
            <Title level={5} style={{ color: '#FF5562' }}>② 入驻角色与主体类型</Title>
            <Form.Item name="role" initialValue="agent">
              <Radio.Group value="agent" style={{ width: '100%' }}>
                <Row gutter={12}>
                  {registerRoleOptions.map((opt) => (
                    <Col span={24} key={opt.value}>
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

            <Alert
              type="info" showIcon style={{ marginBottom: 24 }}
              message="当前版本仅保留代理角色"
              description="代理完成资质提交后，可直接录入网吧信息、跟进平台审核、线下铺设霸服系统，并查看终端规模、活跃与流水数据；不再创建网吧主账号，也不再给网吧主分成。"
            />

            <Form.Item label="主体性质" name="subject" initialValue="personal">
              <Radio.Group value={subject} onChange={(e) => setSubject(e.target.value)}>
                <Radio value="personal">个人（人脸识别认证）</Radio>
                <Radio value="company">企业（上传营业执照认证）</Radio>
              </Radio.Group>
            </Form.Item>

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 区块 1：实名认证（复用 YYB 人脸校验）============ */}
            <Title level={5} style={{ color: '#FF5562' }}>③ {subject === 'company' ? '企业资质与营业执照' : '个人实名认证'}</Title>
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
                  <Form.Item
                    label="营业执照上传"
                    name="license"
                    extra="正式环境需上传营业执照照片/扫描件；Demo 点击按钮仅展示交互，不真实上传文件。"
                    rules={[{ required: true, message: '请上传营业执照' }]}
                  >
                    <Button icon={<SafetyCertificateOutlined />}>点击上传营业执照（Demo 展示）</Button>
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Divider style={{ borderColor: '#2A1A1C' }} />

            {/* ============ 区块 2：联系方式 ============ */}
            <Title level={5} style={{ color: '#FF5562' }}>④ 联系方式</Title>
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

            {/* ============ 协议 + 提交 ============ */}
            <Form.Item name="agreeSms" valuePropName="checked" rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject(new Error('请同意接收审核通知短信')) }]}>
              <Checkbox style={{ color: 'rgba(255,255,255,0.75)' }}>同意接受审核通知短信到此手机号码，手机号将严格保密</Checkbox>
            </Form.Item>
            <Form.Item name="agreeProtocol" valuePropName="checked" rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject(new Error('请同意合作协议')) }]}>
              <Checkbox style={{ color: 'rgba(255,255,255,0.75)' }}>
                同意接受 <a style={{ color: '#FF5562' }}>《手助网吧加盟合作协议》</a>，加入手助网吧加盟体系
              </Checkbox>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Space>
                <Button onClick={() => navigate('/')}>返回</Button>
                <Button type="primary" htmlType="submit" size="large" style={{ paddingInline: 40 }}>
                  提交代理资质审核
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
