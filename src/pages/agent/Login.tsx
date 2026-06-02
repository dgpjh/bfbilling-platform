import { Form, Input, Button, Card, Tabs, Checkbox, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function AgentLogin() {
  const navigate = useNavigate();

  const onLogin = () => navigate('/agent/dashboard');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#0A0A0A',
      }}
    >
      <div
        style={{
          flex: 1.4,
          background:
            'radial-gradient(ellipse at top left, #4A0E10 0%, #1A0608 50%, #0A0A0A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          padding: 48,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 右上角红色光晕 */}
        <div
          style={{
            position: 'absolute',
            top: -150,
            right: -150,
            width: 480,
            height: 480,
            background: 'radial-gradient(circle, rgba(255,46,62,0.30) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span className="brand-block" style={{ width: 44, height: 44, fontSize: 22 }}>
              霸
            </span>
            <span style={{ color: '#FF2E3E', fontSize: 13, fontWeight: 700, letterSpacing: 3 }}>
              HAND IN HAND
            </span>
          </div>
          <Title style={{ color: '#fff', fontSize: 56, marginBottom: 24, fontWeight: 800, lineHeight: 1.1 }}>
            手助网吧<br />代理结算平台
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 460 }}>
            实时收益看板 · 阶梯激励冲刺 · 一键提现<br />
            助你高效经营网吧菜单合作业务
          </Paragraph>
          <Space size="large" style={{ marginTop: 32 }}>
            <Card
              style={{
                background: 'rgba(255,46,62,0.08)',
                border: '1px solid rgba(255,46,62,0.25)',
                color: '#fff',
                minWidth: 140,
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>1,287</div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>全国网吧</div>
            </Card>
            <Card
              style={{
                background: 'rgba(255,46,62,0.08)',
                border: '1px solid rgba(255,46,62,0.25)',
                color: '#fff',
                minWidth: 140,
              }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>64,350</div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>覆盖终端</div>
            </Card>
          </Space>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#0A0A0A',
        }}
      >
        <Card
          style={{
            width: 420,
            padding: '24px 8px',
            background: '#1A1212',
            border: '1px solid #2A1A1C',
          }}
        >
          <Title level={3} style={{ marginBottom: 24, color: '#fff' }}>
            欢迎登录
          </Title>
          <Tabs
            defaultActiveKey="password"
            items={[
              {
                key: 'password',
                label: '账密登录',
                children: (
                  <Form layout="vertical" onFinish={onLogin}>
                    <Form.Item label="账号" name="username" initialValue="agent_demo">
                      <Input prefix={<UserOutlined />} placeholder="手机号 / 邮箱" size="large" />
                    </Form.Item>
                    <Form.Item label="密码" name="password" initialValue="******">
                      <Input.Password prefix={<LockOutlined />} size="large" />
                    </Form.Item>
                    <Form.Item label="验证码" name="captcha">
                      <Space.Compact style={{ width: '100%' }}>
                        <Input prefix={<SafetyCertificateOutlined />} placeholder="请输入验证码" size="large" />
                        <Button size="large" style={{ width: 100 }}>获取</Button>
                      </Space.Compact>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox defaultChecked>7 天内自动登录</Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" block>
                        登 录
                      </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
                      <a style={{ color: '#FF5562' }}>忘记密码?</a>
                      <span style={{ margin: '0 8px' }}>·</span>
                      <a style={{ color: '#FF5562' }} onClick={() => navigate('/register')}>申请加盟</a>
                    </div>
                  </Form>
                ),
              },
              {
                key: 'qrcode',
                label: '扫码登录',
                children: (
                  <div
                    style={{
                      height: 280,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    （扫码登录开发中）
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
