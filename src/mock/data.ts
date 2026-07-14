// ===========================================================================
// 代理单角色版 demo 数据（v3.0）
// 核心变化：
//   1) 取消网吧主角色，不再维护 ownerId / ownerProfile / LinkRequest
//   2) 所有网吧由代理直接录入、直接管理，代理负责铺设与后续数据查看
//   3) 网吧录入一期免审核；平台仅审核用户自助创建的母账号，母账号可创建子账号
// ===========================================================================
import dayjs from 'dayjs';

export type UserRole = 'agent';
export const currentRole: UserRole = 'agent';

export const agentInfo = {
  role: 'agent' as UserRole,
  name: '星辰文化传媒（代理）',
  contact: '李建国',
  province: '广东',
  startDate: '2026-01-01',
};

export const unreadMessages = 3;

// =================== 注册 ===================
export type RegisterRole = 'agent';
export const registerRoleOptions: { value: RegisterRole; label: string; desc: string }[] = [
  { value: 'agent', label: '代理', desc: '负责录入网吧、线下铺设、查看终端/活跃/流水数据' },
];

export function maskName(name: string): string {
  if (!name) return '';
  if (name.length === 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}

export const provinceCityOptions = [
  { value: '广东', label: '广东', children: [{ value: '深圳', label: '深圳' }, { value: '广州', label: '广州' }, { value: '东莞', label: '东莞' }] },
  { value: '湖南', label: '湖南', children: [{ value: '长沙', label: '长沙' }, { value: '株洲', label: '株洲' }] },
  { value: '四川', label: '四川', children: [{ value: '成都', label: '成都' }, { value: '绵阳', label: '绵阳' }] },
  { value: '河南', label: '河南', children: [{ value: '郑州', label: '郑州' }, { value: '洛阳', label: '洛阳' }] },
  { value: '浙江', label: '浙江', children: [{ value: '杭州', label: '杭州' }, { value: '宁波', label: '宁波' }] },
  { value: '江苏', label: '江苏', children: [{ value: '南京', label: '南京' }, { value: '苏州', label: '苏州' }] },
];

// =================== 网吧模型 ===================
// v3 主链路：
//   A. 母账号 / 子账号通过账密登录
//   B. 首次自助创建的母账号需平台审批；QQ 只做创号时一次鉴权
//   C. 母账号录入网吧资料 → 一期免审核，系统自动分配 BF 网吧 ID + MC 系统 ID
//   D. 母账号可创建子账号给子代理 / 网吧主，子账号数据自动关联母账号
//   E. 上线后展示终端规模、已活跃终端、月活跃结算终端、日活、本月流水
export type MyCafe = {
  id: string;
  tempId?: string;
  externalCafeId: string;              // 代理录入时填写的业务网吧 ID（不知道可联系区域经理）
  name: string;
  province: string;
  city: string;
  address: string;
  terminalScaleCount: number;            // 代理人工录入的终端规模数
  terminalCount: number;                 // 已活跃终端数
  monthlyActiveTerminal: number;
  dailyActiveTerminal: number;
  monthRevenue: number;
  contact: string;
  phone: string;
  cafePassword?: string;                 // 网吧密码（Demo 演示态：明文 mock；生产环境必须 hash 存储）
  status: 'pending' | 'normal';
  platformAuditStatus: 'pending' | 'approved' | 'rejected';
  platformAuditRemark?: string;
  platformAuditAt?: string;
  createdAt: string;
  launchedAt?: string;
  declaredTerminalCount: number;
  agentId: string;
  agentName: string;
};

export const CURRENT_AGENT_ID = 'A2001';
export const CURRENT_AGENT_NAME = '李建国';

// =================== 结算策略 ===================
export const MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_UNIT_PRICE = 4;
export const MONTHLY_ACTIVE_TERMINAL_ACTIVE_DAYS_THRESHOLD = 3;
export const MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_DESC = '单自然月内活跃 3 天及以上的终端，按 4 元 / 台 / 月结算';

export function calculateMonthlyTerminalSettlement(monthlyActiveTerminal: number) {
  return {
    eligibleTerminalCount: monthlyActiveTerminal,
    unitPrice: MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_UNIT_PRICE,
    amount: monthlyActiveTerminal * MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_UNIT_PRICE,
  };
}

// =================== 子母账号 ===================
export type SettlementAccountType = 'parent' | 'child';
export type ChildAccountRole = 'subAgent' | 'cafeOwner';

export type SettlementAccount = {
  accountId: string;
  accountType: SettlementAccountType;
  username: string;
  password: string;                    // Demo 演示态：明文 mock；生产环境必须 hash 存储
  displayName: string;
  roleLabel: string;
  parentAccountId?: string;
  parentAgentId: string;
  parentAgentName: string;
  qqVerified: boolean;
  authStatus: 'pending' | 'approved' | 'rejected';
  terminalScope: 'parent_all' | 'inherited';
  createdAt: string;
  lastLoginAt?: string;
};

export const CURRENT_PARENT_ACCOUNT_ID = 'PA1001';

const _settlementAccounts: SettlementAccount[] = [
  {
    accountId: CURRENT_PARENT_ACCOUNT_ID,
    accountType: 'parent',
    username: 'lijg',
    password: '123456',
    displayName: '李建国',
    roleLabel: '母账号 / 代理负责人',
    parentAgentId: CURRENT_AGENT_ID,
    parentAgentName: CURRENT_AGENT_NAME,
    qqVerified: true,
    authStatus: 'approved',
    terminalScope: 'parent_all',
    createdAt: '2026-01-01',
    lastLoginAt: '2026-06-08 09:20',
  },
  {
    accountId: 'CA3001',
    accountType: 'child',
    username: 'sub_sz',
    password: '123456',
    displayName: '深圳子代理账号',
    roleLabel: '子账号 / 子代理',
    parentAccountId: CURRENT_PARENT_ACCOUNT_ID,
    parentAgentId: CURRENT_AGENT_ID,
    parentAgentName: CURRENT_AGENT_NAME,
    qqVerified: false,
    authStatus: 'approved',
    terminalScope: 'inherited',
    createdAt: '2026-06-02',
    lastLoginAt: '2026-06-08 11:35',
  },
  {
    accountId: 'CA3002',
    accountType: 'child',
    username: 'cafe_nanshan',
    password: '123456',
    displayName: '南山旗舰店查看账号',
    roleLabel: '子账号 / 网吧主',
    parentAccountId: CURRENT_PARENT_ACCOUNT_ID,
    parentAgentId: CURRENT_AGENT_ID,
    parentAgentName: CURRENT_AGENT_NAME,
    qqVerified: false,
    authStatus: 'approved',
    terminalScope: 'inherited',
    createdAt: '2026-06-05',
    lastLoginAt: '2026-06-08 16:10',
  },
];

let _childAccountSeq = 3002;

export function getParentSettlementAccount(): SettlementAccount {
  return _settlementAccounts.find((a) => a.accountId === CURRENT_PARENT_ACCOUNT_ID)!;
}

export function getChildAccountsByParent(parentAccountId = CURRENT_PARENT_ACCOUNT_ID): SettlementAccount[] {
  return _settlementAccounts.filter((a) => a.accountType === 'child' && a.parentAccountId === parentAccountId);
}

export function loginSettlementAccount(username: string, password: string): { ok: boolean; account?: SettlementAccount; reason?: 'not_found' | 'pending' | 'rejected' } {
  const account = _settlementAccounts.find((a) => a.username === username.trim() && a.password === password);
  if (!account) return { ok: false, reason: 'not_found' };
  if (account.authStatus === 'pending') return { ok: false, account, reason: 'pending' };
  if (account.authStatus === 'rejected') return { ok: false, account, reason: 'rejected' };
  account.lastLoginAt = dayjs().format('YYYY-MM-DD HH:mm');
  return { ok: true, account };
}

export function createChildSettlementAccount(input: {
  username: string;
  password: string;
  displayName: string;
  role: ChildAccountRole;
  parentAccountId?: string;
}): SettlementAccount {
  _childAccountSeq += 1;
  const account: SettlementAccount = {
    accountId: `CA${_childAccountSeq}`,
    accountType: 'child',
    username: input.username.trim(),
    password: input.password,
    displayName: input.displayName,
    roleLabel: input.role === 'subAgent' ? '子账号 / 子代理' : '子账号 / 网吧主',
    parentAccountId: input.parentAccountId || CURRENT_PARENT_ACCOUNT_ID,
    parentAgentId: CURRENT_AGENT_ID,
    parentAgentName: CURRENT_AGENT_NAME,
    qqVerified: false,
    authStatus: 'approved',
    terminalScope: 'inherited',
    createdAt: dayjs().format('YYYY-MM-DD'),
  };
  _settlementAccounts.unshift(account);
  return account;
}

const _myCafes: MyCafe[] = [
  {
    id: 'MC0001', externalCafeId: 'BAFU-SZ-0001', name: '星辰电竞·南山旗舰店', province: '广东', city: '深圳',
    address: '南山区科技园南路 88 号 3 楼',
    terminalScaleCount: 128, terminalCount: 120, monthlyActiveTerminal: 112, dailyActiveTerminal: 96,
    monthRevenue: 38600,
    contact: '王店长', phone: '139****8821',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-02-16',
    createdAt: '2026-02-15', launchedAt: '2026-03-01',
    declaredTerminalCount: 120,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0002', externalCafeId: 'BAFU-SZ-0002', name: '星辰电竞·龙华店', province: '广东', city: '深圳',
    address: '龙华区民治大道 200 号 2 楼',
    terminalScaleCount: 86, terminalCount: 80, monthlyActiveTerminal: 72, dailyActiveTerminal: 60,
    monthRevenue: 22800,
    contact: '陈店长', phone: '136****6688',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-05-21',
    createdAt: '2026-05-20', launchedAt: '2026-05-25',
    declaredTerminalCount: 80,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0003', externalCafeId: 'BAFU-SZ-0003', name: '星辰电竞·宝安店', province: '广东', city: '深圳',
    address: '宝安区建安一路 56 号 4 楼',
    terminalScaleCount: 102, terminalCount: 95, monthlyActiveTerminal: 88, dailyActiveTerminal: 74,
    monthRevenue: 28400,
    contact: '赵经理', phone: '138****3322',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-03-11',
    createdAt: '2026-03-10', launchedAt: '2026-03-20',
    declaredTerminalCount: 95,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0004', externalCafeId: 'BF20260601', name: '星辰电竞·福田 COCO PARK 店',
    province: '广东', city: '深圳', address: '福田区益田路 6028 号 4 楼',
    terminalScaleCount: 110, terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0, monthRevenue: 0,
    contact: '刘店长', phone: '135****2299',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-06-01',
    createdAt: '2026-06-01', declaredTerminalCount: 110,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0005', externalCafeId: 'BAFU-SZ-0005', name: '星辰电竞·盐田店', province: '广东', city: '深圳',
    address: '盐田区深盐路 1166 号 2 楼',
    terminalScaleCount: 70, terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0, monthRevenue: 0,
    contact: '吴店长', phone: '139****1188',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-05-29',
    createdAt: '2026-05-28',
    declaredTerminalCount: 70,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
];

let _cafeSeq = 10;
let _tempSeq = 0;

export function getMyCafes(): MyCafe[] {
  return _myCafes;
}

export function getCafesByAgent(agentId: string): MyCafe[] {
  return _myCafes.filter((c) => c.agentId === agentId);
}

export function findCafeById(id: string): MyCafe | undefined {
  return _myCafes.find((c) => c.id === id.trim());
}

export function getPendingLaunchCafesForAgent(agentId: string): MyCafe[] {
  return _myCafes.filter((c) => c.agentId === agentId && c.platformAuditStatus === 'approved' && !c.launchedAt);
}

export function addMyCafe(input: {
  name: string;
  province: string;
  city: string;
  address: string;
  declaredTerminalCount: number;
  terminalScaleCount: number;
  contact: string;
  phone: string;
  cafePassword?: string;
  agentId?: string;
  agentName?: string;
}): MyCafe {
  // 一期取消审核流程：录入即生效，自动生成业务 ID + 系统 ID
  _cafeSeq += 1;
  const externalCafeId = `BF${String(Math.floor(10000000 + Math.random() * 89999999))}`; // BF + 8 位
  const cafe: MyCafe = {
    id: `MC${String(_cafeSeq).padStart(4, '0')}`,
    externalCafeId,
    name: input.name,
    province: input.province,
    city: input.city,
    address: input.address,
    terminalScaleCount: input.terminalScaleCount,
    terminalCount: 0,
    monthlyActiveTerminal: 0,
    dailyActiveTerminal: 0,
    monthRevenue: 0,
    contact: input.contact,
    phone: input.phone,
    cafePassword: input.cafePassword,
    declaredTerminalCount: input.declaredTerminalCount,
    status: 'normal',
    platformAuditStatus: 'approved',
    platformAuditAt: dayjs().format('YYYY-MM-DD'),
    platformAuditRemark: '一期免审核，系统自动登记',
    createdAt: dayjs().format('YYYY-MM-DD'),
    agentId: input.agentId || CURRENT_AGENT_ID,
    agentName: input.agentName || CURRENT_AGENT_NAME,
  };
  _myCafes.unshift(cafe);
  return cafe;
}

export function reviewCafeApprove(tempId: string, remark?: string): { ok: boolean; cafeId?: string } {
  const cafe = _myCafes.find((c) => c.tempId === tempId && c.platformAuditStatus === 'pending');
  if (!cafe) return { ok: false };
  _cafeSeq += 1;
  cafe.id = `MC${String(_cafeSeq).padStart(4, '0')}`;
  cafe.status = 'normal';
  cafe.platformAuditStatus = 'approved';
  cafe.platformAuditAt = dayjs().format('YYYY-MM-DD HH:mm');
  cafe.platformAuditRemark = remark || '资料齐全，审核通过';
  return { ok: true, cafeId: cafe.id };
}

export function reviewCafeReject(tempId: string, remark: string): boolean {
  const cafe = _myCafes.find((c) => c.tempId === tempId && c.platformAuditStatus === 'pending');
  if (!cafe) return false;
  cafe.platformAuditStatus = 'rejected';
  cafe.platformAuditAt = dayjs().format('YYYY-MM-DD HH:mm');
  cafe.platformAuditRemark = remark;
  return true;
}

export function getPendingPlatformReviews(): MyCafe[] {
  return _myCafes.filter((c) => c.platformAuditStatus === 'pending');
}

export function getPlatformReviewHistory(): MyCafe[] {
  return _myCafes.filter((c) => c.platformAuditStatus !== 'pending');
}

export function getPlatformCafes(): MyCafe[] {
  return _myCafes;
}

export function getPlatformAgentOverview() {
  const cafes = _myCafes;
  const summary = summarizeCafes(cafes);
  return [{
    agentId: CURRENT_AGENT_ID,
    agentName: CURRENT_AGENT_NAME,
    province: agentProfile.province,
    cafeCount: summary.cafeCount,
    launchedCafeCount: summary.launchedCafeCount,
    pendingAuditCount: summary.pendingAuditCount,
    pendingLaunchCount: summary.pendingLaunchCount,
    terminalScaleCount: summary.terminalScaleCount,
    activeTerminal: summary.terminalCount,
    dailyActiveTerminal: summary.dailyActiveTerminal,
    monthlyActiveTerminal: summary.monthlyActiveTerminal,
    monthRevenue: summary.monthRevenue,
  }];
}

// =================== 代理账号审核（一期由平台对代理注册申请做审核） ===================
export type AgentApplication = {
  applicationId: string;          // AA-xxxx
  accountName: string;            // 自定义登录名，审核通过后成为母账号
  accountType: 'parent';          // 用户自行创建的账号一定是母账号
  qq: string;                     // QQ 号，用于创号时一次鉴权
  qqVerified: boolean;
  contact: string;                // 申请人姓名
  phone: string;
  province: string;
  city: string;
  companyName: string;            // 公司 / 工作室名称
  idCardNo: string;               // 身份证号（脱敏展示）
  bankAccount: string;            // 银行账号（脱敏展示）
  submittedAt: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewRemark?: string;
  reviewAt?: string;
  reviewer?: string;              // 审核员
};

const _agentApplications: AgentApplication[] = [
  {
    applicationId: 'AA-2031', accountName: 'czq_gz', accountType: 'parent', qq: '882910xxx', qqVerified: true, contact: '陈志强', phone: '139****6612',
    province: '广东', city: '广州', companyName: '志强网络科技工作室',
    idCardNo: '4401**********1234', bankAccount: '6217 **** **** 4521',
    submittedAt: '2026-06-07 14:32', reviewStatus: 'pending',
  },
  {
    applicationId: 'AA-2030', accountName: 'lxt_xm', accountType: 'parent', qq: '519202xxx', qqVerified: true, contact: '林晓婷', phone: '186****3308',
    province: '福建', city: '厦门', companyName: '晓婷文化传媒有限公司',
    idCardNo: '3502**********0826', bankAccount: '6225 **** **** 9032',
    submittedAt: '2026-06-07 11:08', reviewStatus: 'pending',
  },
  {
    applicationId: 'AA-2029', accountName: 'hjh_hz', accountType: 'parent', qq: '460112xxx', qqVerified: true, contact: '黄建华', phone: '135****7741',
    province: '浙江', city: '杭州', companyName: '建华网咖管理有限公司',
    idCardNo: '3301**********5612', bankAccount: '6228 **** **** 1187',
    submittedAt: '2026-06-06 19:45', reviewStatus: 'pending',
  },
  // 历史已审核
  {
    applicationId: 'AA-2028', accountName: 'zhaowei_wh', accountType: 'parent', qq: '120384xxx', qqVerified: true, contact: '赵伟', phone: '187****2245',
    province: '湖北', city: '武汉', companyName: '伟业网络服务工作室',
    idCardNo: '4201**********9981', bankAccount: '6226 **** **** 7714',
    submittedAt: '2026-06-05 09:12',
    reviewStatus: 'approved', reviewRemark: '资料齐全，已通过', reviewAt: '2026-06-05 16:40', reviewer: '审核员-A',
  },
  {
    applicationId: 'AA-2027', accountName: 'sxf_cd', accountType: 'parent', qq: '991023xxx', qqVerified: true, contact: '孙小芳', phone: '152****8854',
    province: '四川', city: '成都', companyName: '小芳电竞工作室',
    idCardNo: '5101**********4423', bankAccount: '6217 **** **** 6608',
    submittedAt: '2026-06-04 15:20',
    reviewStatus: 'approved', reviewRemark: '资质齐全', reviewAt: '2026-06-04 17:55', reviewer: '审核员-A',
  },
  {
    applicationId: 'AA-2026', accountName: 'lhy_nj', accountType: 'parent', qq: '776205xxx', qqVerified: true, contact: '刘海洋', phone: '138****9913',
    province: '江苏', city: '南京', companyName: '海洋数码科技工作室',
    idCardNo: '3201**********3142', bankAccount: '6228 **** **** 5527',
    submittedAt: '2026-06-03 10:44',
    reviewStatus: 'rejected', reviewRemark: '银行账户与身份证姓名不一致，请核对后重新提交', reviewAt: '2026-06-03 14:08', reviewer: '审核员-B',
  },
];

export function submitParentAccountApplication(input: {
  accountName: string;
  password: string;
  qq: string;
  contact: string;
  phone: string;
  companyName: string;
}): AgentApplication {
  const seq = 2031 + _agentApplications.length + 1;
  const application: AgentApplication = {
    applicationId: `AA-${seq}`,
    accountName: input.accountName.trim(),
    accountType: 'parent',
    qq: input.qq.replace(/(\d{3})\d+(\d{2})/, '$1****$2'),
    qqVerified: true,
    contact: input.contact,
    phone: input.phone,
    province: '广东',
    city: '深圳',
    companyName: input.companyName,
    idCardNo: '待平台审核补充',
    bankAccount: '待平台审核补充',
    submittedAt: dayjs().format('YYYY-MM-DD HH:mm'),
    reviewStatus: 'pending',
  };
  _agentApplications.unshift(application);
  _settlementAccounts.unshift({
    accountId: `PA${seq}`,
    accountType: 'parent',
    username: input.accountName.trim(),
    password: input.password,
    displayName: input.contact,
    roleLabel: '母账号 / 待平台审批',
    parentAgentId: `A${seq}`,
    parentAgentName: input.contact,
    qqVerified: true,
    authStatus: 'pending',
    terminalScope: 'parent_all',
    createdAt: dayjs().format('YYYY-MM-DD'),
  });
  return application;
}

export function getPendingAgentApplications(): AgentApplication[] {
  return _agentApplications.filter((a) => a.reviewStatus === 'pending');
}
export function getAgentApplicationHistory(): AgentApplication[] {
  return _agentApplications.filter((a) => a.reviewStatus !== 'pending');
}
export function reviewAgentApprove(applicationId: string, remark?: string, reviewer = '审核员-A'): { ok: boolean } {
  const a = _agentApplications.find((x) => x.applicationId === applicationId && x.reviewStatus === 'pending');
  if (!a) return { ok: false };
  a.reviewStatus = 'approved';
  a.reviewRemark = remark || '资料齐全，审核通过';
  a.reviewAt = dayjs().format('YYYY-MM-DD HH:mm');
  a.reviewer = reviewer;
  const account = _settlementAccounts.find((x) => x.username === a.accountName && x.accountType === 'parent');
  if (account) {
    account.authStatus = 'approved';
    account.roleLabel = '母账号 / 代理负责人';
  }
  return { ok: true };
}
export function reviewAgentReject(applicationId: string, remark: string, reviewer = '审核员-A'): { ok: boolean } {
  const a = _agentApplications.find((x) => x.applicationId === applicationId && x.reviewStatus === 'pending');
  if (!a) return { ok: false };
  a.reviewStatus = 'rejected';
  a.reviewRemark = remark;
  a.reviewAt = dayjs().format('YYYY-MM-DD HH:mm');
  a.reviewer = reviewer;
  const account = _settlementAccounts.find((x) => x.username === a.accountName && x.accountType === 'parent');
  if (account) account.authStatus = 'rejected';
  return { ok: true };
}

export function setCafeLaunched(cafeId: string): boolean {
  const cafe = _myCafes.find((c) => c.id === cafeId && c.platformAuditStatus === 'approved');
  if (!cafe) return false;
  if (cafe.launchedAt) return false;
  cafe.launchedAt = dayjs().format('YYYY-MM-DD');
  const declared = cafe.terminalScaleCount || cafe.declaredTerminalCount || 60;
  cafe.terminalCount = Math.round(declared * (0.65 + Math.random() * 0.12));
  cafe.monthlyActiveTerminal = Math.round(cafe.terminalCount * (0.85 + Math.random() * 0.1));
  cafe.dailyActiveTerminal = Math.round(cafe.terminalCount * (0.6 + Math.random() * 0.15));
  cafe.monthRevenue = cafe.terminalCount * (260 + Math.round(Math.random() * 80));
  return true;
}

export type CafeRevenueRecord = {
  month: string;
  revenue: number;
  activeTerminal: number;
  dailyActiveTerminal: number;
  monthlyActiveTerminal: number;
  status: 'settled';
};

export function getCafeRevenueHistory(cafe: MyCafe): CafeRevenueRecord[] {
  if (!cafe.launchedAt) return [];
  const base = cafe.monthRevenue || cafe.terminalCount * 300;
  const active = cafe.terminalCount || 0;
  return [
    { month: '2026-05', revenue: Math.round(base * 0.92), activeTerminal: Math.max(0, active - 4), dailyActiveTerminal: Math.max(0, cafe.dailyActiveTerminal - 3), monthlyActiveTerminal: Math.max(0, cafe.monthlyActiveTerminal - 5), status: 'settled' },
    { month: '2026-04', revenue: Math.round(base * 0.86), activeTerminal: Math.max(0, active - 9), dailyActiveTerminal: Math.max(0, cafe.dailyActiveTerminal - 6), monthlyActiveTerminal: Math.max(0, cafe.monthlyActiveTerminal - 10), status: 'settled' },
    { month: '2026-03', revenue: Math.round(base * 0.78), activeTerminal: Math.max(0, active - 14), dailyActiveTerminal: Math.max(0, cafe.dailyActiveTerminal - 9), monthlyActiveTerminal: Math.max(0, cafe.monthlyActiveTerminal - 15), status: 'settled' },
    { month: '2026-02', revenue: Math.round(base * 0.7), activeTerminal: Math.max(0, active - 18), dailyActiveTerminal: Math.max(0, cafe.dailyActiveTerminal - 12), monthlyActiveTerminal: Math.max(0, cafe.monthlyActiveTerminal - 20), status: 'settled' },
  ];
}

// ============== 日级流水（用于历史流水查询页） ==============
export type CafeDailyRevenueRecord = {
  date: string;              // YYYY-MM-DD
  cafeId: string;            // 系统 ID（MCxxxx）
  cafeName: string;          // 网吧名称
  externalCafeId: string;    // 业务网吧 ID
  province: string;
  city: string;
  revenue: number;           // 当日流水
  activeTerminal: number;    // 当日活跃终端
  dailyActiveTerminal: number;
  status: 'settled';
};

// 简易确定性 hash（让同一家店每天数据稳定，刷新页面不变）
function _seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** 生成单店近 N 天日流水（只对已上线网吧生效）。已 settled，时间倒序。 */
export function getCafeDailyRevenue(cafe: MyCafe, days = 60): CafeDailyRevenueRecord[] {
  if (!cafe.launchedAt || !cafe.id) return [];
  const monthBase = cafe.monthRevenue || cafe.terminalCount * 300;
  // 估算单日基准：月流水 / 30
  const dailyBase = monthBase / 30;
  const now = new Date('2026-06-08T00:00:00'); // 与 mock 业务时点对齐，避免随机
  const records: CafeDailyRevenueRecord[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dow = d.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    // 工作日 0.85~1.05，周末 1.05~1.30
    const seed = _seedHash(`${cafe.id}-${dateStr}`) % 1000;
    const noise = (seed / 1000) * 0.2; // 0~0.2
    const factor = isWeekend ? 1.05 + noise + 0.05 : 0.85 + noise;
    const revenue = Math.round(dailyBase * factor);
    const activeTerminal = Math.max(
      0,
      Math.round((cafe.terminalCount || 0) * (isWeekend ? 0.95 : 0.78) + ((seed % 11) - 5)),
    );
    const dailyActiveTerminal = Math.max(
      0,
      Math.round((cafe.dailyActiveTerminal || 0) * (isWeekend ? 1.08 : 0.92) + ((seed % 7) - 3)),
    );
    records.push({
      date: dateStr,
      cafeId: cafe.id,
      cafeName: cafe.name,
      externalCafeId: cafe.externalCafeId,
      province: cafe.province,
      city: cafe.city,
      revenue,
      activeTerminal,
      dailyActiveTerminal,
      status: 'settled',
    });
  }
  return records;
}

/** 拿到代理名下所有已上线网吧的近 N 天日流水，合并后按时间倒序（同日内按流水降序）。 */
export function getAgentDailyRevenueRecords(agentId: string, days = 60): CafeDailyRevenueRecord[] {
  const cafes = getCafesByAgent(agentId).filter((c) => c.launchedAt);
  const all = cafes.flatMap((c) => getCafeDailyRevenue(c, days));
  return all.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.revenue - a.revenue;
  });
}

export function deleteCafe(cafeIdOrTempId: string, agentId: string): { ok: boolean; reason?: 'not_found' | 'not_yours' } {
  const idx = _myCafes.findIndex((c) => (c.id || c.tempId) === cafeIdOrTempId);
  if (idx < 0) return { ok: false, reason: 'not_found' };
  if (_myCafes[idx].agentId !== agentId) return { ok: false, reason: 'not_yours' };
  _myCafes.splice(idx, 1);
  return { ok: true };
}

export function updateCafeInfo(cafeIdOrTempId: string, agentId: string, patch: Partial<Pick<MyCafe, 'name' | 'contact' | 'phone' | 'address' | 'terminalScaleCount'>>): { ok: boolean; reason?: 'not_found' | 'not_yours' } {
  const cafe = _myCafes.find((c) => (c.id || c.tempId) === cafeIdOrTempId);
  if (!cafe) return { ok: false, reason: 'not_found' };
  if (cafe.agentId !== agentId) return { ok: false, reason: 'not_yours' };
  Object.assign(cafe, patch);
  return { ok: true };
}

// =================== 聚合 ===================
export type CafeScaleSummary = {
  cafeCount: number;
  terminalScaleCount: number;
  terminalCount: number;
  monthlyActiveTerminal: number;
  dailyActiveTerminal: number;
  monthRevenue: number;
  pendingAuditCount: number;
  pendingLaunchCount: number;
  launchedCafeCount: number;
};

export function summarizeCafes(cafes: MyCafe[]): CafeScaleSummary {
  return {
    cafeCount: cafes.length,
    terminalScaleCount: cafes.reduce((s, c) => s + c.terminalScaleCount, 0),
    terminalCount: cafes.reduce((s, c) => s + c.terminalCount, 0),
    monthlyActiveTerminal: cafes.reduce((s, c) => s + c.monthlyActiveTerminal, 0),
    dailyActiveTerminal: cafes.reduce((s, c) => s + c.dailyActiveTerminal, 0),
    monthRevenue: cafes.reduce((s, c) => s + c.monthRevenue, 0),
    pendingAuditCount: cafes.filter((c) => c.platformAuditStatus === 'pending').length,
    pendingLaunchCount: cafes.filter((c) => c.platformAuditStatus === 'approved' && !c.launchedAt).length,
    launchedCafeCount: cafes.filter((c) => !!c.launchedAt).length,
  };
}

export const recentFeed = [
  { time: '6/08 11:35', type: 'success', content: '子账号「sub_sz」登录结算平台，数据自动关联母账号' },
  { time: '6/08 09:20', type: 'info', content: '母账号「lijg」查看月活跃终端结算字段' },
  { time: '6/02 15:16', type: 'success', content: '母账号创建「深圳子代理账号」，可直接账密登录' },
  { time: '5/25 14:00', type: 'success', content: '代理完成「星辰电竞·龙华店」霸服铺设，已活跃终端数据开始回传' },
  { time: '5/12 11:20', type: 'success', content: '门店「星辰电竞·南山旗舰店」月活跃结算终端突破 100 台' },
];

// =================== 个人信息 ===================
export type AccountProfile = {
  roleId: string;
  role: UserRole;
  subjectType: 'personal' | 'company';
  realName: string;
  idCard: string;
  companyName?: string;
  creditCode?: string;
  contact: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  address: string;
  authStatus: 'verified' | 'pending';
  registeredAt: string;
};

export const agentProfile: AccountProfile = {
  roleId: CURRENT_AGENT_ID,
  role: 'agent',
  subjectType: 'company',
  realName: '李建国',
  idCard: '4403**********1234',
  companyName: '星辰文化传媒有限公司',
  creditCode: '91440300MA5F****XL',
  contact: CURRENT_AGENT_NAME,
  phone: '139****8821',
  email: 'li****@xingchen.com',
  province: '广东',
  city: '深圳',
  address: '南山区科技园南路 88 号加盟广场大厦 12 楼',
  authStatus: 'verified',
  registeredAt: '2026-01-01',
};

export function getMyProfile(): AccountProfile {
  return agentProfile;
}
