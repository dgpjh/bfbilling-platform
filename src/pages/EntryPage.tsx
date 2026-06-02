import { Card, Button, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShopOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function EntryPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top left, #4A0E10 0%, #1A0608 35%, #0A0A0A 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 右上角装饰光晕（致敬菜单"网吧特权"区的红色光晕） */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 420,
          height: 420,
          background: 'radial-gradient(circle, rgba(255,46,62,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ textAlign: 'center', color: '#fff', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span
            className="brand-block"
            style={{ width: 48, height: 48, fontSize: 24 }}
          >
            霸
          </span>
          <span style={{ color: '#FF2E3E', fontSize: 14, fontWeight: 700, letterSpacing: 4 }}>
            HAND IN HAND · 手助网吧
          </span>
        </div>
        <Title style={{ color: '#fff', fontSize: 48, marginBottom: 8, fontWeight: 800 }}>
          加盟结算平台
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16 }}>
          Demo · P0 演示版本（请选择进入端）
        </Paragraph>
      </div>

      <Row gutter={32} style={{ maxWidth: 900, width: '100%', position: 'relative', zIndex: 1 }}>
        <Col span={12}>
          <Card
            hoverable
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              borderRadius: 12,
              background: '#1A1212',
              border: '1px solid #2A1A1C',
            }}
            styles={{ body: { padding: 32 } }}
            onClick={() => navigate('/agent/login')}
          >
            <ShopOutlined style={{ fontSize: 64, color: '#FF2E3E', marginBottom: 16 }} />
            <Title level={3} style={{ color: '#fff' }}>代理端 · Console</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.55)' }}>
              查看收益、网吧规模、阶梯激励进度<br />
              申请提现、下载月度账单
            </Paragraph>
            <Button type="primary" size="large" block>
              进入代理端
            </Button>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            hoverable
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              borderRadius: 12,
              background: '#1A1212',
              border: '1px solid #2A1A1C',
            }}
            styles={{ body: { padding: 32 } }}
            onClick={() => navigate('/admin/dashboard')}
          >
            <SettingOutlined style={{ fontSize: 64, color: '#fff', marginBottom: 16 }} />
            <Title level={3} style={{ color: '#fff' }}>运营后台 · Admin</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.55)' }}>
              全国数据看板、代理管理<br />
              结算引擎、提现审批
            </Paragraph>
            <Button
              size="large"
              block
              style={{
                background: '#fff',
                color: '#0A0A0A',
                border: 'none',
                fontWeight: 600,
              }}
            >
              进入运营后台
            </Button>
          </Card>
        </Col>
      </Row>

      <Button
        type="link"
        size="large"
        style={{ marginTop: 32, color: '#FF5562', fontWeight: 600, position: 'relative', zIndex: 1 }}
        onClick={() => navigate('/register')}
      >
        还不是加盟商？点此申请入驻注册 →
      </Button>

      <div
        style={{
          marginTop: 24,
          color: 'rgba(255,255,255,0.35)',
          fontSize: 12,
          position: 'relative',
          zIndex: 1,
        }}
      >
        © 2026 手助网吧项目组 · 内部演示，数据均为模拟
      </div>
    </div>
  );
}
