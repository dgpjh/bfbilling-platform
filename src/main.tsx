import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import App from './App';
import './index.css';

// 黑红白主题色板（对齐网吧菜单"霸服俱乐部"主色调）
const PRIMARY = '#FF2E3E';        // 品牌红
const PRIMARY_HOVER = '#FF5562';  // 红 hover
const PRIMARY_ACTIVE = '#C41E2A'; // 暗红（点击态）
const BG_BASE = '#0A0A0A';        // 全局背景
const BG_ELEVATED = '#1A1212';    // 容器/卡片
const BG_LAYOUT = '#0A0A0A';      // 布局底
const BORDER = '#2A1A1C';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: PRIMARY,
          colorPrimaryHover: PRIMARY_HOVER,
          colorPrimaryActive: PRIMARY_ACTIVE,
          colorSuccess: '#52C41A',
          colorWarning: '#FAAD14',
          colorError: '#F5222D',
          colorInfo: PRIMARY,
          colorBgBase: BG_BASE,
          colorBgLayout: BG_LAYOUT,
          colorBgContainer: BG_ELEVATED,
          colorBgElevated: '#241719',
          colorBorder: BORDER,
          colorBorderSecondary: '#1F1416',
          colorText: 'rgba(255,255,255,0.92)',
          colorTextSecondary: 'rgba(255,255,255,0.65)',
          colorTextTertiary: 'rgba(255,255,255,0.45)',
          colorTextQuaternary: 'rgba(255,255,255,0.30)',
          borderRadius: 6,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: BG_BASE,
            headerBg: BG_ELEVATED,
            siderBg: '#150C0E',
          },
          Menu: {
            darkItemBg: '#150C0E',
            darkSubMenuItemBg: '#0F0809',
            darkItemSelectedBg: PRIMARY,
            darkItemHoverBg: 'rgba(255,46,62,0.15)',
          },
          Card: {
            colorBgContainer: BG_ELEVATED,
            colorBorderSecondary: BORDER,
          },
          Table: {
            colorBgContainer: BG_ELEVATED,
            headerBg: '#221517',
            rowHoverBg: '#2A1A1C',
          },
          Button: {
            primaryShadow: '0 2px 8px rgba(255,46,62,0.35)',
          },
          Statistic: {
            colorTextDescription: 'rgba(255,255,255,0.55)',
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
