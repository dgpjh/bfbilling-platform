import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Form, Input, Button, Card, Tabs, Checkbox, Typography, Space, message,
  Alert, Steps, Radio, Cascader, Divider, Row, Col,
} from 'antd';
import {
  LockOutlined, ReloadOutlined, CheckCircleFilled, QqOutlined, CustomerServiceOutlined,
  SafetyCertificateOutlined, ScanOutlined, UserOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/brand-logo.png';
import { provinceCityOptions } from '../../mock/data';

const { Title, Paragraph, Text } = Typography;

// QQ 品牌色
const QQ_BLUE = '#12B7F5';
const QQ_BLUE_DEEP = '#0A8DD0';

/**
 * 登录页 v2.3：接入 QQ 登录
 *  · QQ 号 + 密码 登录
 *  · QQ 扫码登录（4 状态机：等待扫码 → 已扫码待确认 → 登录成功 → 二维码过期）
 *
 *  Demo 中没有真实 QQ 互联接入，扫码流程通过定时器模拟：
 *    挂载后 5 秒进入「已扫码」，再 2 秒「确认登录」切到完善资质 Tab；60 秒不操作则二维码过期。
 *  右侧二维码用 SVG 自绘（伪二维码点阵 + 中间企鹅头像），不引第三方包。
 */
export default function AgentLogin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('qrcode');
  const showContact = () => message.info('联系客服：请联系对应区域经理，或添加客服 QQ 8008208820（Demo）');
  const onLogin = () => {
    message.success('QQ 登录成功，请继续完善代理资质');
    setActiveTab('qualification');
  };
  const onPasswordLogin = () => {
    message.success('登录成功，代理资质认证已通过');
    navigate('/agent/dashboard');
  };

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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            <img
              src={brandLogo}
              alt="霸服俱乐部"
              style={{ height: 72, width: 'auto', display: 'block' }}
            />
          </div>
          <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 20, maxWidth: 460, marginBottom: 8 }}>
            代理录入 / 铺设跟进 / 规模数据<br />
            一站式总览
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
          <Space align="center" style={{ marginBottom: 24 }}>
            <QqOutlined style={{ fontSize: 28, color: QQ_BLUE }} />
            <Title level={3} style={{ margin: 0, color: '#fff' }}>
              QQ 登录
            </Title>
          </Space>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 16, marginTop: -16 }}>
            使用 QQ 账号一键登录代理结算管理平台
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'qrcode',
                label: '扫码登录',
                children: <QQQrcodePane onLogin={onLogin} navigate={navigate} />,
              },
              {
                key: 'password',
                label: '密码登录',
                children: <QQPasswordPane onLogin={onPasswordLogin} showContact={showContact} />,
              },
              {
                key: 'qualification',
                label: '完善资质',
                children: <QualificationPane navigate={navigate} showContact={showContact} />,
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

/* ============================== QQ 号 + 密码登录 ============================== */
function QQPasswordPane({ onLogin, showContact }: { onLogin: () => void; showContact: () => void }) {
  return (
    <Form layout="vertical" onFinish={onLogin} requiredMark={false}>
      <Form.Item
        label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>QQ 号</span>}
        name="qq"
        initialValue="123456789"
        rules={[
          { required: true, message: '请输入 QQ 号' },
          { pattern: /^[1-9]\d{4,11}$/, message: '请输入正确的 QQ 号（5-12 位数字，首位非 0）' },
        ]}
      >
        <Input
          prefix={<QqOutlined style={{ color: QQ_BLUE }} />}
          placeholder="请输入 QQ 号"
          size="large"
          maxLength={12}
        />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>QQ 密码</span>}
        name="password"
        initialValue="******"
        rules={[{ required: true, message: '请输入 QQ 密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} size="large" placeholder="请输入 QQ 密码" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox defaultChecked style={{ color: 'rgba(255,255,255,0.65)' }}>
            7 天内自动登录
          </Checkbox>
          <a style={{ color: QQ_BLUE, fontSize: 12 }} onClick={() => message.info('已为你打开 QQ 安全中心（演示）')}>
            找回密码
          </a>
        </div>
      </Form.Item>

      <Form.Item style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          style={{ background: QQ_BLUE, borderColor: QQ_BLUE, fontWeight: 600, height: 44 }}
        >
登录（模拟资质已认证）
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
        <Space split={<span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>} size={8}>
          <a style={{ color: QQ_BLUE }} onClick={() => message.info('请前往 QQ 注册中心注册 QQ 号（Demo）')}>注册账号</a>
          <a style={{ color: QQ_BLUE }} onClick={() => message.info('意见反馈已记录（Demo）')}>意见反馈</a>
          <a style={{ color: QQ_BLUE }} onClick={showContact}>联系客服</a>
        </Space>
      </div>
    </Form>
  );
}

/* ============================== 未完善资质流程 Demo ============================== */
function QualificationPane({ navigate, showContact }: { navigate: (path: string) => void; showContact: () => void }) {
  const [form] = Form.useForm();
  const [subject, setSubject] = useState<'personal' | 'company'>('company');
  const [faceVerified, setFaceVerified] = useState(false);

  const mockFace = () => {
    setFaceVerified(true);
    form.setFieldsValue({ realName: '王小明', idCard: '4403**********1234' });
    message.success('人脸校验通过，已回填实名信息（Demo）');
  };

  const onSubmit = () => {
    message.success('代理资质已提交审核，可先进入控制台录入网吧');
    navigate('/agent/dashboard?from=register');
  };

  return (
    <div style={{ paddingTop: 4 }}>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 12 }}
        message="当前 QQ 已登录，但代理资质未完善"
        description="请补充主体类型、营业执照/实名信息、联系方式后提交审核。"
      />
      <Steps
        size="small"
        current={subject === 'company' || faceVerified ? 2 : 1}
        style={{ marginBottom: 16 }}
        items={[
          { title: 'QQ 登录' },
          { title: '主体' },
          { title: subject === 'company' ? '执照' : '实名' },
          { title: '提交' },
        ]}
      />
      <Form form={form} layout="vertical" requiredMark onFinish={onSubmit}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="QQ 号" name="qq" initialValue="2727994919">
              <Input readOnly style={{ background: '#1A1212', color: 'rgba(255,255,255,0.65)', borderColor: '#2A1A1C' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="账号状态">
              <Input value="已登录，待完善资质" readOnly style={{ background: '#1A1212', color: 'rgba(255,255,255,0.65)', borderColor: '#2A1A1C' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="主体性质" name="subject" initialValue="company">
          <Radio.Group value={subject} onChange={(e) => setSubject(e.target.value)}>
            <Radio value="company">企业（上传营业执照认证）</Radio>
            <Radio value="personal">个人（人脸识别认证）</Radio>
          </Radio.Group>
        </Form.Item>

        {subject === 'company' ? (
          <>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="企业名称" name="companyName" rules={[{ required: true, message: '请输入企业名称' }]}>
                  <Input placeholder="请输入营业执照全称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="统一社会信用代码" name="creditCode" rules={[{ required: true, message: '请输入统一社会信用代码' }]}>
                  <Input placeholder="18 位信用代码" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="营业执照上传"
              name="license"
              rules={[{ required: true, message: '请上传营业执照' }]}
              extra="Demo 点击按钮仅展示交互；正式环境上传图片/扫描件。"
            >
              <Button icon={<SafetyCertificateOutlined />}>点击上传营业执照</Button>
            </Form.Item>
          </>
        ) : (
          <Row gutter={12}>
            <Col span={10}>
              <div style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>人脸校验</div>
              <div
                onClick={mockFace}
                style={{ cursor: 'pointer', border: '1px dashed #2A1A1C', borderRadius: 8, padding: 16, textAlign: 'center', background: faceVerified ? 'rgba(82,196,26,0.08)' : '#150C0E' }}
              >
                {faceVerified ? <CheckCircleFilled style={{ fontSize: 30, color: '#52C41A' }} /> : <ScanOutlined style={{ fontSize: 30, color: '#FF2E3E' }} />}
                <div style={{ color: faceVerified ? '#52C41A' : 'rgba(255,255,255,0.65)', marginTop: 8 }}>{faceVerified ? '已通过身份校验' : '点击模拟人脸校验'}</div>
              </div>
            </Col>
            <Col span={14}>
              <Form.Item label="姓名" name="realName">
                <Input readOnly placeholder="等待人脸校验拉取..." style={{ background: '#1A1212', color: 'rgba(255,255,255,0.65)', borderColor: '#2A1A1C' }} />
              </Form.Item>
              <Form.Item label="身份证" name="idCard">
                <Input readOnly placeholder="等待人脸校验拉取..." style={{ background: '#1A1212', color: 'rgba(255,255,255,0.65)', borderColor: '#2A1A1C' }} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider style={{ borderColor: '#2A1A1C', margin: '12px 0' }} />

        <Form.Item label="联系人" name="contact" rules={[{ required: true, message: '请输入联系人' }]}>
          <Input prefix={<UserOutlined />} placeholder="请输入联系人" />
        </Form.Item>
        <Form.Item label="手机号码" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
          <Input placeholder="请输入手机号码" />
        </Form.Item>
        <Form.Item label="邮箱地址" name="email" rules={[{ required: true, type: 'email', message: '请输入正确邮箱' }]}>
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>
        <Form.Item label="联系地址" required>
          <Form.Item name="region" rules={[{ required: true, message: '请选择省份城市' }]}>
            <Cascader options={provinceCityOptions} placeholder="请选择省份城市" />
          </Form.Item>
          <Form.Item name="address" style={{ marginBottom: 0 }} rules={[{ required: true, message: '请填写详细地址' }]}>
            <Input prefix={<EnvironmentOutlined />} placeholder="请输入详细地址" />
          </Form.Item>
        </Form.Item>

        <Form.Item name="agreeProtocol" valuePropName="checked" rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject(new Error('请同意合作协议')) }]}>
          <Checkbox style={{ color: 'rgba(255,255,255,0.75)' }}>同意《手助网吧加盟合作协议》</Checkbox>
        </Form.Item>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button type="link" icon={<CustomerServiceOutlined />} onClick={showContact}>联系客服</Button>
          <Button type="primary" htmlType="submit">提交代理资质审核</Button>
        </Space>
      </Form>
    </div>
  );
}

/* ============================== QQ 扫码登录 ============================== */
type QrStatus = 'waiting' | 'scanned' | 'confirmed' | 'expired';

function QQQrcodePane({ onLogin, navigate }: { onLogin: () => void; navigate: (path: string) => void }) {
  const [status, setStatus] = useState<QrStatus>('waiting');
  // 二维码 token，刷新时变化导致 SVG 重绘
  const [token, setToken] = useState(() => Math.random().toString(36).slice(2, 10));
  const timersRef = useRef<number[]>([]);

  // 清理定时器
  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // 启动模拟流程
  useEffect(() => {
    clearTimers();
    setStatus('waiting');
    // 5 秒：模拟手机扫到码
    const t1 = window.setTimeout(() => setStatus('scanned'), 5000);
    // 7 秒：模拟手机点击「确认登录」
    const t2 = window.setTimeout(() => {
      setStatus('confirmed');
      // 0.8 秒后跳转
      const t3 = window.setTimeout(() => onLogin(), 800);
      timersRef.current.push(t3);
    }, 7000);
    // 60 秒：模拟二维码过期
    const t4 = window.setTimeout(() => setStatus((prev) => (prev === 'waiting' ? 'expired' : prev)), 60000);
    timersRef.current.push(t1, t2, t4);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refresh = () => setToken(Math.random().toString(36).slice(2, 10));

  return (
    <div style={{ paddingTop: 8, paddingBottom: 8 }}>
      <div
        style={{
          width: 220,
          height: 220,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 8,
          padding: 12,
          position: 'relative',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        <FakeQrcode token={token} dimmed={status !== 'waiting'} />

        {/* 状态遮罩 */}
        {status === 'scanned' && (
          <Mask color="rgba(18,183,245,0.92)">
            <CheckCircleFilled style={{ fontSize: 44, color: '#fff' }} />
            <div style={{ color: '#fff', marginTop: 12, fontWeight: 600 }}>扫描成功</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>请在手机上点击确认登录</div>
          </Mask>
        )}
        {status === 'confirmed' && (
          <Mask color="rgba(82, 196, 26, 0.95)">
            <CheckCircleFilled style={{ fontSize: 44, color: '#fff' }} />
            <div style={{ color: '#fff', marginTop: 12, fontWeight: 600 }}>登录成功</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>正在跳转控制台…</div>
          </Mask>
        )}
        {status === 'expired' && (
          <Mask color="rgba(0,0,0,0.7)">
            <ReloadOutlined style={{ fontSize: 36, color: '#fff' }} />
            <div style={{ color: '#fff', marginTop: 12, fontWeight: 600 }}>二维码已过期</div>
            <Button
              type="primary"
              size="small"
              style={{ marginTop: 12, background: QQ_BLUE, borderColor: QQ_BLUE }}
              onClick={refresh}
            >
              点击刷新
            </Button>
          </Mask>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
          {status === 'waiting' && (
            <>
              请使用 <span style={{ color: QQ_BLUE, fontWeight: 600 }}>手机 QQ</span> 扫描二维码登录
            </>
          )}
          {status === 'scanned' && <span style={{ color: QQ_BLUE }}>请在手机上确认登录</span>}
          {status === 'confirmed' && <span style={{ color: '#52C41A' }}>登录成功，正在跳转…</span>}
          {status === 'expired' && <span style={{ color: 'rgba(255,255,255,0.45)' }}>二维码失效，请刷新后重试</span>}
        </Text>
      </div>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <Space split={<span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>} size={8}>
          <a style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} onClick={refresh}>
            <ReloadOutlined /> 刷新二维码
          </a>
          <a style={{ color: QQ_BLUE, fontSize: 12 }} onClick={() => message.info('请前往 QQ 注册中心注册 QQ 号（Demo）')}>注册账号</a>
          <a style={{ color: QQ_BLUE, fontSize: 12 }} onClick={() => message.info('意见反馈已记录（Demo）')}>意见反馈</a>
          <a style={{ color: QQ_BLUE, fontSize: 12 }} onClick={() => message.info('联系客服：请联系对应区域经理，或添加客服 QQ 8008208820（Demo）')}>联系客服</a>
        </Space>
      </div>
    </div>
  );
}

function Mask({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 12,
        borderRadius: 4,
        background: color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * 伪二维码：基于 token 生成确定性 17×17 点阵 + 三个定位角 + 中央 QQ 企鹅头
 * 不是真实二维码，仅用于 Demo 视觉。
 */
function FakeQrcode({ token, dimmed }: { token: string; dimmed: boolean }) {
  const SIZE = 17;
  const cells = useMemo(() => {
    const grid: boolean[][] = [];
    // 简单可重复哈希
    let h = 0;
    for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) & 0xffffffff;
    let seed = h;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return ((seed >>> 0) % 1000) / 1000;
    };
    for (let r = 0; r < SIZE; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < SIZE; c++) row.push(rnd() > 0.55);
      grid.push(row);
    }
    // 三个定位角清空（左上 / 右上 / 左下）
    const corners: [number, number][] = [
      [0, 0],
      [0, SIZE - 7],
      [SIZE - 7, 0],
    ];
    corners.forEach(([sr, sc]) => {
      for (let r = sr; r < sr + 7; r++) {
        for (let c = sc; c < sc + 7; c++) {
          grid[r][c] = false;
        }
      }
    });
    return grid;
  }, [token]);

  const corners: [number, number][] = [
    [0, 0],
    [0, SIZE - 7],
    [SIZE - 7, 0],
  ];

  const cellPx = 196 / SIZE;

  return (
    <svg
      viewBox="0 0 196 196"
      width="100%"
      height="100%"
      style={{ display: 'block', filter: dimmed ? 'blur(2px) opacity(0.6)' : undefined, transition: 'filter 0.3s' }}
    >
      {/* 点阵 */}
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellPx}
              y={r * cellPx}
              width={cellPx}
              height={cellPx}
              fill="#1d1d1d"
            />
          ) : null,
        ),
      )}
      {/* 三个定位角（外方块 + 内点） */}
      {corners.map(([sr, sc], i) => (
        <g key={`corner-${i}`}>
          <rect
            x={sc * cellPx}
            y={sr * cellPx}
            width={7 * cellPx}
            height={7 * cellPx}
            fill="none"
            stroke="#1d1d1d"
            strokeWidth={cellPx}
          />
          <rect
            x={(sc + 2) * cellPx}
            y={(sr + 2) * cellPx}
            width={3 * cellPx}
            height={3 * cellPx}
            fill="#1d1d1d"
          />
        </g>
      ))}
      {/* 中心 QQ 企鹅 logo */}
      <g>
        <circle cx="98" cy="98" r="26" fill="#fff" />
        <circle cx="98" cy="98" r="22" fill={QQ_BLUE} />
        {/* 企鹅简笔：白肚 + 黑眼 */}
        <ellipse cx="98" cy="105" rx="11" ry="13" fill="#fff" />
        <circle cx="93" cy="94" r="3" fill="#fff" />
        <circle cx="103" cy="94" r="3" fill="#fff" />
        <circle cx="93" cy="94" r="1.5" fill="#1d1d1d" />
        <circle cx="103" cy="94" r="1.5" fill="#1d1d1d" />
        {/* 红围巾 */}
        <path d="M 86 110 Q 98 116 110 110 L 110 114 Q 98 120 86 114 Z" fill="#FF2E3E" />
        {/* 嘴 */}
        <path d="M 95 100 Q 98 103 101 100 Z" fill="#F5A623" />
      </g>
      {/* 角标 QQ 字母带 */}
      <g>
        <rect x="0" y="180" width="196" height="16" fill={QQ_BLUE_DEEP} opacity="0.9" />
        <text x="98" y="192" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" letterSpacing="2">
          QQ LOGIN
        </text>
      </g>
    </svg>
  );
}
