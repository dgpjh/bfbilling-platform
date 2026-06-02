import { Routes, Route, Navigate } from 'react-router-dom';
import AgentLayout from './layouts/AgentLayout';
import AdminLayout from './layouts/AdminLayout';
import EntryPage from './pages/EntryPage';
import Register from './pages/Register';

// 代理端
import AgentDashboard from './pages/agent/Dashboard';
import AgentTerminals from './pages/agent/Terminals';
import AgentMyCafes from './pages/agent/MyCafes';
import AgentBilling from './pages/agent/Billing';
import AgentWithdraw from './pages/agent/Withdraw';
import AgentContracts from './pages/agent/Contracts';
import AgentProfile from './pages/agent/Profile';
import AgentLogin from './pages/agent/Login';

// 后台
import AdminDashboard from './pages/admin/Dashboard';
import AdminAgents from './pages/admin/Agents';
import AdminSettlement from './pages/admin/Settlement';
import AdminWithdrawApproval from './pages/admin/WithdrawApproval';
import AdminContractAudit from './pages/admin/ContractAudit';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/register" element={<Register />} />

      {/* 代理端 */}
      <Route path="/agent" element={<AgentLayout />}>
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="my-cafes" element={<AgentMyCafes />} />
        <Route path="terminals" element={<AgentTerminals />} />
        <Route path="billing" element={<AgentBilling />} />
        <Route path="withdraw" element={<AgentWithdraw />} />
        <Route path="contracts" element={<AgentContracts />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* 后台 */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="settlement" element={<AdminSettlement />} />
        <Route path="withdraw-approval" element={<AdminWithdrawApproval />} />
        <Route path="contract-audit" element={<AdminContractAudit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
