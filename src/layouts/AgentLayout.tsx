import { Layout, Menu, Avatar, Dropdown, Badge, Space, Tag, Segmented } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  AccountBookOutlined,
  WalletOutlined,
  FileProtectOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { unreadMessages, currentRole, agentInfo, ownerInfo, contractGate } from '../mock/data';

const { Header, Sider, Content } = Layout;

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAgent = currentRole === 'agent';
  const me = isAgent ? agentInfo : ownerInfo;

  const menuItems = [
    { key: '/agent/dashboard', icon: <DashboardOutlined />, label: '概览首页' },
    { key: '/agent/my-cafes', icon: <ShopOutlined />, label: '我的网吧' },
    { key: '/agent/terminals', icon: <ShopOutlined />, label: isAgent ? '终端管理' : '我的终端' },
    { key: '/agent/contracts', icon: <FileProtectOutlined />, label: (
      <span>
        合同管理
        {!contractGate.hasActiveContract && (
          <Badge dot offset={[6, -2]} status="error" />
        )}
      </span>
    ) },
    { key: '/agent/billing', icon: <AccountBookOutlined />, label: '财务结算' },
    { key: '/agent/withdraw', icon: <WalletOutlined />, label: '提现管理' },
    { key: '/agent/profile', icon: <UserOutlined />, label: '个人信息' },
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
            className="brand-block"
            style={{
              width: 32,
              height: 32,
              fontSize: 14,
            }}
          >
            霸
          </div>
          <div>
            <div style={{ fontSize: 14 }}>手助网吧</div>
            <div style={{ fontSize: 11, opacity: 0.55 }}>{isAgent ? '代理结算平台' : '网吧主结算平台'}</div>
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
            {/* Demo 身份切换器：仅原型阶段使用，正式上线由账号体系决定 */}
            <Segmented
              size="small"
              value={currentRole}
              options={[
                { label: '代理视角', value: 'agent' },
                { label: '网吧主视角', value: 'owner' },
              ]}
              onChange={(val) => {
                // 仅前端 demo：写入 sessionStorage 后强制刷新切换身份
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
