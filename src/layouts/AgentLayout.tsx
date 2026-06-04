import { Layout, Menu, Avatar, Dropdown, Badge, Space, Tag, Segmented } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {
  unreadMessages, currentRole, agentInfo, ownerInfo,
  getLinkRequestsForOwner, getUnlinkRequestsForOwner, getUnlinkRequestsForAgent,
  CURRENT_OWNER_ID, CURRENT_AGENT_ID,
} from '../mock/data';
import brandLogo from '../assets/brand-logo.png';

const { Header, Sider, Content } = Layout;

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAgent = currentRole === 'agent';
  const me = isAgent ? agentInfo : ownerInfo;

  // 网吧主：待我审批的「关联申请 + 解绑申请（代理发起）」
  // 代理：待我审批的「解绑申请（网吧主发起）」
  const ownerPendingCount = !isAgent
    ? getLinkRequestsForOwner(CURRENT_OWNER_ID).length
      + getUnlinkRequestsForOwner(CURRENT_OWNER_ID).length
    : 0;
  const agentPendingCount = isAgent
    ? getUnlinkRequestsForAgent(CURRENT_AGENT_ID).length
    : 0;
  const pendingCount = isAgent ? agentPendingCount : ownerPendingCount;

  const menuItems = [
    { key: '/agent/dashboard', icon: <DashboardOutlined />, label: '概览首页' },
    {
      key: '/agent/my-cafes',
      icon: <ShopOutlined />,
      label: (
        <span>
          {isAgent ? '我托管的网吧' : '我的网吧'}
          {pendingCount > 0 && (
            <Badge count={pendingCount} size="small" style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
    },
    { key: '/agent/profile', icon: <UserOutlined />, label: '个人信息' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#150C0E' }} theme="dark">
        <div
          style={{
            color: '#fff',
            padding: '20px 16px',
            borderBottom: '1px solid #2A1A1C',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 6,
          }}
        >
          <img
            src={brandLogo}
            alt="霸服俱乐部"
            style={{ height: 28, width: 'auto', display: 'block' }}
          />
          <div style={{ fontSize: 11, opacity: 0.55, color: '#fff', letterSpacing: 1 }}>
            {isAgent ? '代理控制台' : '网吧主控制台'}
          </div>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
          style={{ marginTop: 8 }}
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
          <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>欢迎，{me.contact}</span>
            <Tag color={isAgent ? 'red' : 'gold'} style={{ marginLeft: 0 }}>
              {isAgent ? '代理' : '网吧主'}
            </Tag>
          </div>
          <Space size={20}>
            <Segmented
              size="small"
              value={currentRole}
              options={[
                { label: '代理视角', value: 'agent' },
                { label: '网吧主视角', value: 'owner' },
              ]}
              onChange={(val) => {
                sessionStorage.setItem('demo_role', String(val));
                window.location.reload();
              }}
            />
            <Badge count={unreadMessages} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: 'rgba(255,255,255,0.85)' }} />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <UserOutlined />, label: '个人信息', onClick: () => navigate('/agent/profile') },
                  { type: 'divider' as const },
                  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => navigate('/') },
                ],
              }}
            >
              <Space style={{ cursor: 'pointer', color: '#fff' }}>
                <Avatar style={{ background: '#FF2E3E' }}>{me.contact.slice(0, 1)}</Avatar>
                <span>{me.contact}</span>
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
