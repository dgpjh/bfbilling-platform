import { Layout, Menu, Avatar, Dropdown, Badge, Space, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  CalculatorOutlined,
  AuditOutlined,
  FileProtectOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '全局看板' },
    { key: '/admin/agents', icon: <TeamOutlined />, label: '代理管理' },
    { key: '/admin/contract-audit', icon: <FileProtectOutlined />, label: '合同审核', badge: 2 },
    { key: '/admin/settlement', icon: <CalculatorOutlined />, label: '结算引擎' },
    { key: '/admin/withdraw-approval', icon: <AuditOutlined />, label: '提现审批', badge: 4 },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#150C0E' }} theme="dark">
        <div
          style={{
            color: '#fff',
            padding: 20,
            fontSize: 16,
            fontWeight: 600,
            borderBottom: '1px solid #2A1A1C',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: '#fff',
              color: '#0A0A0A',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            ADMIN
          </div>
          <div>
            <div style={{ fontSize: 14 }}>结算运营后台</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Admin Console</div>
          </div>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems.map((m) => ({
            key: m.key,
            icon: m.icon,
            label: (
              <Space>
                {m.label}
                {m.badge ? <Badge count={m.badge} size="small" /> : null}
              </Space>
            ),
          }))}
          onClick={(e) => navigate(e.key)}
          style={{ marginTop: 8, background: '#150C0E' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#1A1212',
            padding: '0 24px',
            borderBottom: '1px solid #2A1A1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Tag color="red" style={{ borderColor: '#FF2E3E', color: '#FF5562', background: 'rgba(255,46,62,0.08)' }}>
              运营后台
            </Tag>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>当前角色：超级管理员</span>
          </Space>
          <Space size={20}>
            <Badge count={12} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: 'rgba(255,255,255,0.85)' }} />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
                  { type: 'divider' as const },
                  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => navigate('/') },
                ],
              }}
            >
              <Space style={{ cursor: 'pointer', color: '#fff' }}>
                <Avatar style={{ background: '#fff', color: '#0A0A0A', fontWeight: 700 }}>管</Avatar>
                <span>elsieeli</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: '#0A0A0A' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
