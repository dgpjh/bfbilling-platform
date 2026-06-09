// ===========================================================================
// 代理单角色版 demo 数据（v3.0）
// 核心变化：
//   1) 取消网吧主角色，不再维护 ownerId / ownerProfile / LinkRequest
//   2) 所有网吧由代理直接录入、直接管理，代理负责铺设与后续数据查看
//   3) 平台仅审核「网吧录入资料」并分配 MC ID；不再参与代理↔网吧主关联审批
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
//   A. 代理注册 / 登录
//   B. 代理录入网吧资料 → status='pending'，platformAuditStatus='pending'，生成临时编号 P-XXXX
//   C. 平台审核通过 → 进入 status='normal' + platformAuditStatus='approved'
//   D. 代理线下铺设霸服 → setCafeLaunched 写入 launchedAt + 已活跃终端/流水
//   E. 上线后展示终端规模、已活跃终端、月活、日活、本月流水
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
    id: '', tempId: 'P-A8F2', externalCafeId: 'BAFU-SZ-0004', name: '星辰电竞·福田 COCO PARK 店',
    province: '广东', city: '深圳', address: '福田区益田路 6028 号 4 楼',
    terminalScaleCount: 110, terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0, monthRevenue: 0,
    contact: '刘店长', phone: '135****2299',
    status: 'pending', platformAuditStatus: 'pending',
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
  externalCafeId: string;
  name: string;
  province: string;
  city: string;
  address: string;
  declaredTerminalCount: number;
  terminalScaleCount: number;
  contact: string;
  phone: string;
  agentId?: string;
  agentName?: string;
}): MyCafe {
  _tempSeq += 1;
  const tempId = `P-${Math.random().toString(36).slice(2, 6).toUpperCase()}${String(_tempSeq).padStart(2, '0')}`;
  const cafe: MyCafe = {
    id: '',
    tempId,
    externalCafeId: input.externalCafeId,
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
    declaredTerminalCount: input.declaredTerminalCount,
    status: 'pending',
    platformAuditStatus: 'pending',
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
  { time: '6/01 10:12', type: 'info', content: '代理提交「星辰电竞·福田 COCO PARK 店」录入申请，待平台审核' },
  { time: '5/29 16:20', type: 'success', content: '「星辰电竞·盐田店」资料审核通过，待代理安排铺设' },
  { time: '5/25 14:00', type: 'success', content: '代理完成「星辰电竞·龙华店」霸服铺设，已活跃终端数据开始回传' },
  { time: '5/12 11:20', type: 'success', content: '门店「星辰电竞·南山旗舰店」月活终端突破 100 台' },
  { time: '5/10 16:00', type: 'warning', content: '门店「星辰电竞·罗湖店」当日活跃终端较上周下降 12%' },
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
