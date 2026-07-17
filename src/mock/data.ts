import dayjs from 'dayjs';

export type UserRole = 'agent';
export const currentRole: UserRole = 'agent';

export const agentInfo = {
  role: 'agent' as UserRole,
  name: '李建国',
  contact: '李建国',
  province: '广东',
  startDate: '2026-01-01',
};

export const unreadMessages = 3;

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

export type MyCafe = {
  id: string;
  tempId?: string;
  externalCafeId: string;
  name: string;
  province: string;
  city: string;
  address: string;
  terminalScaleCount: number;            // 代理人工录入的终端规模数
  terminalCount: number;                 // 已活跃终端数
  monthlyActiveTerminal: number;
  dailyActiveTerminal: number;
  contact: string;
  phone: string;
  cafePassword?: string;
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

export function generateCafeLoginAccount(): string {
  return `BF${dayjs().format('YYYYMM')}${String(_cafeSeq + 1).padStart(4, '0')}`;
}


// =================== 结算策略 ===================
export const MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_UNIT_PRICE = 4;
export const MONTHLY_ACTIVE_TERMINAL_ACTIVE_DAYS_THRESHOLD = 3;
export const MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_DESC = '单自然月内活跃 3 天及以上的终端计入月活跃终端';

export function calculateMonthlyTerminalSettlement(monthlyActiveTerminal: number) {
  return {
    eligibleTerminalCount: monthlyActiveTerminal,
    unitPrice: MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_UNIT_PRICE,
    amount: monthlyActiveTerminal * MONTHLY_ACTIVE_TERMINAL_SETTLEMENT_UNIT_PRICE,
  };
}

export type SettlementAccount = {
  accountId: string;
  qq: string;
  password: string;
  displayName: string;
  realName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  idCardNo: string;
  roleLabel: string;
  agentId: string;

  agentName: string;
  authStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastLoginAt?: string;
};

const _settlementAccounts: SettlementAccount[] = [
  {
    accountId: 'AG1001',
    qq: '2727994919',
    password: '123456',
    displayName: '李建国',
    realName: '李建国',
    phone: '13971535875',
    province: '广东',
    city: '深圳',
    address: '南山区科技园南路 88 号 12 楼',
    idCardNo: '440305199001011234',
    roleLabel: '代理商',

    agentId: CURRENT_AGENT_ID,
    agentName: CURRENT_AGENT_NAME,
    authStatus: 'approved',
    createdAt: '2026-01-01',
    lastLoginAt: '2026-06-08 09:20',
  },
];

export function loginSettlementAccount(qq: string, password: string): { ok: boolean; account?: SettlementAccount; reason?: 'not_found' | 'pending' | 'rejected' } {
  const account = _settlementAccounts.find((a) => a.qq === qq.trim() && a.password === password);
  if (!account) return { ok: false, reason: 'not_found' };
  if (account.authStatus === 'pending') return { ok: false, account, reason: 'pending' };
  if (account.authStatus === 'rejected') return { ok: false, account, reason: 'rejected' };
  account.lastLoginAt = dayjs().format('YYYY-MM-DD HH:mm');
  return { ok: true, account };
}

const _myCafes: MyCafe[] = [
  {
    id: 'MC0001', externalCafeId: 'BAFU-SZ-0001', name: '星辰电竞·南山旗舰店', province: '广东', city: '深圳',
    address: '南山区科技园南路 88 号 3 楼',
    terminalScaleCount: 128, terminalCount: 120, monthlyActiveTerminal: 112, dailyActiveTerminal: 96,
    contact: '王店长', phone: '139****8821', cafePassword: 'bf123456',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-02-16',
    createdAt: '2026-02-15', launchedAt: '2026-03-01',
    declaredTerminalCount: 120,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0002', externalCafeId: 'BAFU-SZ-0002', name: '星辰电竞·龙华店', province: '广东', city: '深圳',
    address: '龙华区民治大道 200 号 2 楼',
    terminalScaleCount: 86, terminalCount: 80, monthlyActiveTerminal: 72, dailyActiveTerminal: 60,
    contact: '陈店长', phone: '136****6688', cafePassword: 'lh123456',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-05-21',
    createdAt: '2026-05-20', launchedAt: '2026-05-25',
    declaredTerminalCount: 80,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0003', externalCafeId: 'BAFU-SZ-0003', name: '星辰电竞·宝安店', province: '广东', city: '深圳',
    address: '宝安区建安一路 56 号 4 楼',
    terminalScaleCount: 102, terminalCount: 95, monthlyActiveTerminal: 88, dailyActiveTerminal: 74,
    contact: '赵经理', phone: '138****3322', cafePassword: 'ba123456',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-03-11',
    createdAt: '2026-03-10', launchedAt: '2026-03-20',
    declaredTerminalCount: 95,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0004', externalCafeId: 'BF2026060004', name: '星辰电竞·福田 COCO PARK 店',
    province: '广东', city: '深圳', address: '福田区益田路 6028 号 4 楼',
    terminalScaleCount: 110, terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0,
    contact: '刘店长', phone: '135****2299', cafePassword: 'ft123456',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-06-01',
    createdAt: '2026-06-01', declaredTerminalCount: 110,
    agentId: CURRENT_AGENT_ID, agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'MC0005', externalCafeId: 'BF2026050005', name: '星辰电竞·盐田店', province: '广东', city: '深圳',
    address: '盐田区深盐路 1166 号 2 楼',
    terminalScaleCount: 70, terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0,
    contact: '吴店长', phone: '139****1188', cafePassword: 'yt123456',
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
  externalCafeId: string;
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
  _cafeSeq += 1;
  const cafe: MyCafe = {
    id: `MC${String(_cafeSeq).padStart(4, '0')}`,
    externalCafeId: input.externalCafeId,
    name: input.name,
    province: input.province,
    city: input.city,
    address: input.address,
    terminalScaleCount: input.terminalScaleCount,
    terminalCount: 0,
    monthlyActiveTerminal: 0,
    dailyActiveTerminal: 0,
    contact: input.contact,
    phone: input.phone,
    cafePassword: input.cafePassword,
    declaredTerminalCount: input.declaredTerminalCount,
    status: 'normal',
    platformAuditStatus: 'approved',
    platformAuditAt: dayjs().format('YYYY-MM-DD'),
    platformAuditRemark: '已登记',
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
  }];
}

// =================== 代理账号审核（一期由平台对代理注册申请做审核） ===================
export type AgentApplication = {
  applicationId: string;
  accountType: 'agent';
  qq: string;
  contact: string;
  realName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  idCardNo: string;
  submittedAt: string;

  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewRemark?: string;
  reviewAt?: string;
  reviewer?: string;
};

const _agentApplications: AgentApplication[] = [
  {
    applicationId: 'AA-2031', accountType: 'agent', qq: '882910123', contact: '陈志强',
    realName: '陈志强', phone: '13800138001', province: '广东', city: '深圳', address: '南山区粤海街道科技园 18 号', idCardNo: '440305198809091238',
    submittedAt: '2026-06-07 14:32', reviewStatus: 'pending',
  },
  {
    applicationId: 'AA-2030', accountType: 'agent', qq: '519202886', contact: '林晓婷',
    realName: '林晓婷', phone: '13800138002', province: '广东', city: '广州', address: '天河区体育西路 66 号', idCardNo: '440106199203155624',
    submittedAt: '2026-06-07 11:08', reviewStatus: 'pending',
  },
  {
    applicationId: 'AA-2029', accountType: 'agent', qq: '460112774', contact: '黄建华',
    realName: '黄建华', phone: '13800138003', province: '湖南', city: '长沙', address: '岳麓区麓谷大道 99 号', idCardNo: '430104198512206819',
    submittedAt: '2026-06-06 19:45', reviewStatus: 'pending',
  },
  {
    applicationId: 'AA-2028', accountType: 'agent', qq: '120384224', contact: '赵伟',
    realName: '赵伟', phone: '13800138004', province: '四川', city: '成都', address: '高新区天府大道中段 588 号', idCardNo: '510107198701018231',
    submittedAt: '2026-06-05 09:12',
    reviewStatus: 'approved', reviewRemark: '资料齐全，已通过', reviewAt: '2026-06-05 16:40', reviewer: '审核员-A',
  },
  {
    applicationId: 'AA-2027', accountType: 'agent', qq: '991023885', contact: '孙小芳',
    realName: '孙小芳', phone: '13800138005', province: '浙江', city: '杭州', address: '西湖区文三路 128 号', idCardNo: '330106199406082014',
    submittedAt: '2026-06-04 15:20',
    reviewStatus: 'approved', reviewRemark: '资质齐全', reviewAt: '2026-06-04 17:55', reviewer: '审核员-A',
  },
  {
    applicationId: 'AA-2026', accountType: 'agent', qq: '776205991', contact: '刘海洋',
    realName: '刘海洋', phone: '13800138006', province: '江苏', city: '南京', address: '玄武区珠江路 88 号', idCardNo: '320102198811113326',
    submittedAt: '2026-06-03 10:44',
    reviewStatus: 'rejected', reviewRemark: '资料不完整，请核对后重新提交', reviewAt: '2026-06-03 14:08', reviewer: '审核员-B',
  },
];


export function submitAgentAccountApplication(input: {
  password: string;
  contact: string;
  qq: string;
  realName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  idCardNo: string;
}): AgentApplication {

  const seq = 2031 + _agentApplications.length + 1;
  const application: AgentApplication = {
    applicationId: `AA-${seq}`,
    accountType: 'agent',
    qq: input.qq.trim(),
    contact: input.contact,
    realName: input.realName,
    phone: input.phone,
    province: input.province,
    city: input.city,
    address: input.address,
    idCardNo: input.idCardNo,
    submittedAt: dayjs().format('YYYY-MM-DD HH:mm'),

    reviewStatus: 'pending',
  };
  _agentApplications.unshift(application);
  _settlementAccounts.unshift({
    accountId: `AG${seq}`,
    qq: input.qq.trim(),
    password: input.password,
    displayName: input.realName,
    realName: input.realName,
    phone: input.phone,
    province: input.province,
    city: input.city,
    address: input.address,
    idCardNo: input.idCardNo,
    roleLabel: '代理商',

    agentId: `A${seq}`,
    agentName: input.contact,
    authStatus: 'pending',
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
  const account = _settlementAccounts.find((x) => x.qq === a.qq);
  if (account) {
    account.authStatus = 'approved';
    account.roleLabel = '代理商';
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
  const account = _settlementAccounts.find((x) => x.qq === a.qq);
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
  return true;
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
    pendingAuditCount: cafes.filter((c) => c.platformAuditStatus === 'pending').length,
    pendingLaunchCount: cafes.filter((c) => c.platformAuditStatus === 'approved' && !c.launchedAt).length,
    launchedCafeCount: cafes.filter((c) => !!c.launchedAt).length,
  };
}

export const recentFeed = [
  { time: '6/08 09:20', type: 'info', content: '代理商登录成功' },
  { time: '6/02 15:16', type: 'success', content: '代理商账号创建成功' },
  { time: '5/25 14:00', type: 'success', content: '「星辰电竞·龙华店」已上线' },
  { time: '5/12 11:20', type: 'success', content: '「星辰电竞·南山旗舰店」月活跃终端突破 100 台' },
];

// =================== 个人信息 ===================
export type AccountProfile = {
  roleId: string;
  role: UserRole;
  contact: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  address: string;
  idCardNo: string;
  registeredAt: string;
};

export const agentProfile: AccountProfile = {
  roleId: CURRENT_AGENT_ID,
  role: 'agent',
  contact: CURRENT_AGENT_NAME,
  phone: '139****8821',
  email: 'li****@xingchen.com',
  province: '广东',
  city: '深圳',
  address: '南山区科技园南路 88 号 12 楼',
  idCardNo: '440305199001011234',
  registeredAt: '2026-01-01',
};

export function getMyProfile(): AccountProfile {
  return agentProfile;
}
