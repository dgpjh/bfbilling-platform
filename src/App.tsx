import { Routes, Route, Navigate } from 'react-router-dom';
import AgentLayout from './layouts/AgentLayout';
import Register from './pages/Register';
import Login from './pages/agent/Login';

import AgentDashboard from './pages/agent/Dashboard';
import AgentMyCafes from './pages/agent/MyCafes';
import AgentAccounts from './pages/agent/AccountManagement';
import AgentProfile from './pages/agent/Profile';

import PlatformAudit from './pages/admin/PlatformAudit';

export default function App() {
  return (
    <Routes>
      {/* 首页直接展示登录入口 */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 兼容旧入口 */}
      <Route path="/agent/login" element={<Navigate to="/" replace />} />

      {/* 代理控制台（单角色版） */}
      <Route path="/agent" element={<AgentLayout />}>
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="my-cafes" element={<AgentMyCafes />} />
        <Route path="accounts" element={<AgentAccounts />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* 平台审核台（平台内部审核员） */}
      <Route path="/admin/audit" element={<PlatformAudit />} />

      {/* 已下线路由统一回到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
