import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, Button, Card, Tabs, Checkbox, Typography, Space, message } from 'antd';
import { LockOutlined, ReloadOutlined, CheckCircleFilled, QqOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import brandLogo from '../../assets/brand-logo.png';

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
 *    挂载后 5 秒进入「已扫码」，再 2 秒「确认登录」自动跳转 dashboard；60 秒不操作则二维码过期。
 *  右侧二维码用 SVG 自绘（伪二维码点阵 + 中间企鹅头像），不引第三方包。
 */
export default function AgentLogin() {
  const navigate = useNavigate();
  const onLogin = () => {
    message.success('登录成功');
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
            终端规模 / 活跃 / 流水<br />
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
            使用 QQ 账号一键登录手助网吧加盟平台
          </div>
          <Tabs
            defaultActiveKey="qrcode"
            items={[
              {
                key: 'qrcode',
                label: '扫码登录',
                children: <QQQrcodePane onLogin={onLogin} />,
              },
              {
                key: 'password',
                label: 'QQ 号登录',
                children: <QQPasswordPane onLogin={onLogin} navigate={navigate} />,
              },
            ]}
          />
          <div style={{ textAlign: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.12)' }}>
            <a style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} onClick={() => navigate('/admin/audit')}>
              🔐 平台审核员入口（迪越 / 应用宝手助 内部）
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================== QQ 号 + 密码登录 ============================== */
function QQPasswordPane({ onLogin, navigate }: { onLogin: () => void; navigate: (path: string) => void }) {
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
          安全登录
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
        没有 QQ 号？
        <a style={{ color: QQ_BLUE, marginLeft: 4 }} onClick={() => message.info('请前往 QQ 注册中心')}>
          注册账号
        </a>
        <span style={{ margin: '0 8px' }}>·</span>
        <a style={{ color: QQ_BLUE }} onClick={() => navigate('/register')}>
          完善代理 / 网吧主资料
        </a>
      </div>
    </Form>
  );
}

/* ============================== QQ 扫码登录 ============================== */
type QrStatus = 'waiting' | 'scanned' | 'confirmed' | 'expired';

function QQQrcodePane({ onLogin }: { onLogin: () => void }) {
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
        <a
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}
          onClick={refresh}
        >
          <ReloadOutlined /> 刷新二维码
        </a>
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
