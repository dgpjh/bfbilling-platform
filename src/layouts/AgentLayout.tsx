import { Layout, Menu, Avatar, Dropdown, Space, Tag, Button, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { agentInfo } from '../mock/data';
import brandLogo from '../assets/brand-logo.png';

const { Header, Sider, Content } = Layout;

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const me = agentInfo;
  const showContact = () => message.info('请联系平台客服');

  const menuItems = [
    { key: '/agent/dashboard', icon: <DashboardOutlined />, label: '概览首页' },
    { key: '/agent/my-cafes', icon: <ShopOutlined />, label: '网吧管理' },
    { key: '/agent/profile', icon: <UserOutlined />, label: '代理信息' },
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
            代理结算控制台
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
            <Tag color="red" style={{ marginLeft: 0 }}>代理商</Tag>
          </div>
          <Space size={20}>
            <Button size="small" ghost icon={<CustomerServiceOutlined />} onClick={showContact}>
              联系客服
            </Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <UserOutlined />, label: '代理信息', onClick: () => navigate('/agent/profile') },
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
