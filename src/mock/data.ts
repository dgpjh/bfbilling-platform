// ===========================================================================
// 简化版 demo 数据（v2.1 简化版 + 双向解绑审批）
// 三个核心展示对象：
//   1) 角色（代理 / 网吧主）创建 + 角色 ID
//   2) 角色之间关联（代理 ↔ 网吧主），以及角色与网吧的关联
//   3) 网吧的规模数据：终端规模、活跃规模、流水（仅展示）
//
// v2.1 关键变更：
//   - 关联（link）和 解绑（unlink）都走"申请池 + 双向审批"
//   - 新增 UnlinkRequest：任一方（代理 / 网吧主）发起 → 对方审批
//   - 新增 deleteCafe(): 网吧主可强删门店（强提醒由 UI 控制），删除时若有代理关联会一并解除
// ===========================================================================
import dayjs from 'dayjs';

export type UserRole = 'agent' | 'owner';

const _stored = typeof window !== 'undefined' ? window.sessionStorage.getItem('demo_role') : null;
export const currentRole: UserRole = (_stored === 'owner' ? 'owner' : 'agent');

export const agentInfo = {
  role: 'agent' as UserRole,
  name: '星辰文化传媒（代理）',
  contact: '李代理',
  province: '广东',
  startDate: '2026-01-01',
};

export const ownerInfo = {
  role: 'owner' as UserRole,
  name: '星辰电竞（网吧主）',
  contact: '王老板',
  province: '广东',
  startDate: '2026-02-15',
};

export const unreadMessages = 5;

// =================== 注册 ===================
export type RegisterRole = 'agent' | 'owner';
export const registerRoleOptions: { value: RegisterRole; label: string; desc: string }[] = [
  { value: 'agent', label: '代理', desc: '托管多家网吧；注册后可向网吧发起关联申请' },
  { value: 'owner', label: '网吧主', desc: '经营网吧；可管理多家门店并分别接受不同代理的关联申请' },
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

export type LinkAgent = { id: string; name: string; province: string };
export const linkableAgents: LinkAgent[] = [
  { id: 'A1001', name: '董子霄', province: '广东' },
  { id: 'A1002', name: '李建国', province: '湖南' },
  { id: 'A1003', name: '王明远', province: '四川' },
  { id: 'A1004', name: '赵晓彤', province: '浙江' },
  { id: 'A1005', name: '孙立伟', province: '江苏' },
];

export type LinkCafe = { id: string; name: string; province: string };
export const linkableCafes: LinkCafe[] = [
  { id: 'CC0001', name: '星辰电竞南山店', province: '广东' },
  { id: 'CC0002', name: '鏖战网吧龙华店', province: '广东' },
  { id: 'CC0003', name: '热血电竞长沙店', province: '湖南' },
  { id: 'CC0004', name: '天翼网咖成都店', province: '四川' },
  { id: 'CC0005', name: '电竞之星杭州店', province: '浙江' },
];

export function findLinkAgentById(id: string): LinkAgent | undefined {
  return linkableAgents.find((a) => a.id === id.trim());
}
export function findLinkCafeById(id: string): LinkCafe | undefined {
  return linkableCafes.find((c) => c.id === id.trim());
}

// =================== 网吧 + 关联模型 ===================
// v2.2 业务流程闭环（与"迪越/应用宝手助"业务实际链路对齐）：
//   B. 网吧主提交录入申请 → status='pending'，platformAuditStatus='pending'，无 ID（显示"待平台分配"）
//   C. 平台（迪越/应用宝手助）审核员在 /admin/audit 通过/驳回；通过后才分配 MCxxxx，进入 status='normal' + platformAuditStatus='approved'
//   D. 代理通过 ID 全平台查询并发起关联申请（输入网吧 ID 即可）
//   E. 网吧主审批通过 → 关联建立，但此时 launchedAt=undefined 表示"待铺设"（无终端/流水）
//   F. 代理线下铺设霸服 → 后台调 setCafeLaunched 写入 launchedAt + 终端/流水（demo 中由"模拟铺设上线"按钮触发）
//   G. 上线后展示终端/月活/流水
export type MyCafe = {
  id: string;                        // C 步审核通过后才有正式 ID（pending 期用 tempId 占位）
  tempId?: string;                   // 平台审核前的临时编号（如 P-XXXX）
  name: string;
  province: string;
  city: string;
  address: string;
  terminalCount: number;             // 仅在已上线（launchedAt 存在）后才有意义
  monthlyActiveTerminal: number;
  dailyActiveTerminal: number;
  monthRevenue: number;
  contact: string;
  phone: string;
  status: 'pending' | 'normal';      // pending = 平台审核中；normal = 已通过审核
  platformAuditStatus: 'pending' | 'approved' | 'rejected';
  platformAuditRemark?: string;
  platformAuditAt?: string;
  createdAt: string;                 // 提交录入时间
  launchedAt?: string;               // 霸服铺设上线时间；空 = 待铺设
  declaredTerminalCount: number;     // 录入时申报的预计终端数（不同于实际终端）
  ownerId: string;
  agentId?: string;
  agentName?: string;
};

// 关联申请（代理 → 网吧主审批）
export type CafeLinkRequest = {
  id: string;
  cafeId: string;
  cafeName: string;
  ownerId: string;
  agentId: string;
  agentName: string;
  agentProvince: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt?: string;
  decideRemark?: string;
};

// 解绑申请（任一方发起 → 对方审批）
//   initiator='agent'  → 代理发起，由网吧主审批
//   initiator='owner'  → 网吧主发起，由代理审批
export type CafeUnlinkRequest = {
  id: string;
  cafeId: string;
  cafeName: string;
  ownerId: string;
  agentId: string;
  agentName: string;
  initiator: 'agent' | 'owner';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedAt?: string;
  decideRemark?: string;
};

export const CURRENT_AGENT_ID = 'A2001';
export const CURRENT_OWNER_ID = 'O20260215';

const _myCafes: MyCafe[] = [
  // 已审核 + 已铺设 + 已关联代理（完整闭环）
  {
    id: 'MC0001', name: '星辰电竞·南山旗舰店', province: '广东', city: '深圳',
    address: '南山区科技园南路 88 号 3 楼',
    terminalCount: 120, monthlyActiveTerminal: 112, dailyActiveTerminal: 96,
    monthRevenue: 38600,
    contact: '王老板', phone: '139****8821',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-02-16',
    createdAt: '2026-02-15', launchedAt: '2026-03-01',
    declaredTerminalCount: 120,
    ownerId: CURRENT_OWNER_ID, agentId: CURRENT_AGENT_ID, agentName: '李**',
  },
  // 已审核 + 已铺设 + 散店（待代理关联）
  {
    id: 'MC0002', name: '星辰电竞·龙华店', province: '广东', city: '深圳',
    address: '龙华区民治大道 200 号 2 楼',
    terminalCount: 80, monthlyActiveTerminal: 72, dailyActiveTerminal: 60,
    monthRevenue: 22800,
    contact: '陈店长', phone: '136****6688',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-05-21',
    createdAt: '2026-05-20', launchedAt: '2026-05-25',
    declaredTerminalCount: 80,
    ownerId: CURRENT_OWNER_ID,
  },
  // 已审核 + 已铺设 + 已关联代理
  {
    id: 'MC0003', name: '星辰电竞·宝安店', province: '广东', city: '深圳',
    address: '宝安区建安一路 56 号 4 楼',
    terminalCount: 95, monthlyActiveTerminal: 88, dailyActiveTerminal: 74,
    monthRevenue: 28400,
    contact: '赵经理', phone: '138****3322',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-03-11',
    createdAt: '2026-03-10', launchedAt: '2026-03-20',
    declaredTerminalCount: 95,
    ownerId: CURRENT_OWNER_ID, agentId: CURRENT_AGENT_ID, agentName: '李**',
  },
  // 已审核 + 已铺设 + 散店
  {
    id: 'MC0004', name: '星辰电竞·罗湖店', province: '广东', city: '深圳',
    address: '罗湖区深南东路 1008 号 5 楼',
    terminalCount: 60, monthlyActiveTerminal: 50, dailyActiveTerminal: 38,
    monthRevenue: 15200,
    contact: '林老板', phone: '137****5511',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-04-06',
    createdAt: '2026-04-05', launchedAt: '2026-04-12',
    declaredTerminalCount: 60,
    ownerId: CURRENT_OWNER_ID,
  },
  // 待平台审核（B/C 之间）
  {
    id: '', tempId: 'P-A8F2', name: '星辰电竞·福田 COCO PARK 店',
    province: '广东', city: '深圳', address: '福田区益田路 6028 号 4 楼',
    terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0, monthRevenue: 0,
    contact: '刘店长', phone: '135****2299',
    status: 'pending', platformAuditStatus: 'pending',
    createdAt: '2026-06-01', declaredTerminalCount: 110,
    ownerId: CURRENT_OWNER_ID,
  },
  // 已审核 + 已关联 + 待铺设（E→F 之间，演示"待铺设"占位）
  {
    id: 'MC0005', name: '星辰电竞·盐田店', province: '广东', city: '深圳',
    address: '盐田区深盐路 1166 号 2 楼',
    terminalCount: 0, monthlyActiveTerminal: 0, dailyActiveTerminal: 0, monthRevenue: 0,
    contact: '吴店长', phone: '139****1188',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-05-29',
    createdAt: '2026-05-28', // launchedAt 缺失 = 待铺设
    declaredTerminalCount: 70,
    ownerId: CURRENT_OWNER_ID, agentId: CURRENT_AGENT_ID, agentName: '李**',
  },
  // 其它网吧主名下、已审核但散店（用于代理"全平台 ID 查询"演示）
  {
    id: 'MC0010', name: '鏖战网吧·龙华民治店', province: '广东', city: '深圳',
    address: '龙华区民治街道民乐路 8 号',
    terminalCount: 65, monthlyActiveTerminal: 58, dailyActiveTerminal: 49,
    monthRevenue: 18900,
    contact: '钱店长', phone: '188****7766',
    status: 'normal', platformAuditStatus: 'approved', platformAuditAt: '2026-04-15',
    createdAt: '2026-04-14', launchedAt: '2026-04-28',
    declaredTerminalCount: 65,
    ownerId: 'O20260301',
  },
];

const _cafeLinkRequests: CafeLinkRequest[] = [
  {
    id: 'LR000001',
    cafeId: 'MC0002', cafeName: '星辰电竞·龙华店',
    ownerId: CURRENT_OWNER_ID,
    agentId: CURRENT_AGENT_ID, agentName: '李**', agentProvince: '广东',
    reason: '本人在广东深圳运营多家加盟网吧，希望接入贵店共享经营资源。',
    status: 'pending',
    createdAt: '2026-05-25',
  },
];

const _cafeUnlinkRequests: CafeUnlinkRequest[] = [];

export function getMyCafes(): MyCafe[] {
  return _myCafes;
}
export function getCafesByAgent(agentId: string): MyCafe[] {
  return _myCafes.filter((c) => c.agentId === agentId);
}
export function getCafesByOwner(ownerId: string): MyCafe[] {
  return _myCafes.filter((c) => c.ownerId === ownerId);
}
export function findCafeById(id: string): MyCafe | undefined {
  return _myCafes.find((c) => c.id === id.trim());
}
// 代理"全平台 ID 查询"：只能查到平台审核通过的网吧
export function findApprovedCafeById(id: string): MyCafe | undefined {
  return _myCafes.find((c) => c.id === id.trim() && c.platformAuditStatus === 'approved');
}
// 代理视角"待铺设"清单（已通过关联，但还未上线）
export function getPendingLaunchCafesForAgent(agentId: string): MyCafe[] {
  return _myCafes.filter((c) => c.agentId === agentId && !c.launchedAt);
}

// ============ 关联申请 ============
export function getLinkRequestsForOwner(ownerId: string, opts?: { all?: boolean }): CafeLinkRequest[] {
  return _cafeLinkRequests.filter((r) =>
    r.ownerId === ownerId && (opts?.all ? true : r.status === 'pending')
  );
}
export function getLinkRequestsByAgent(agentId: string): CafeLinkRequest[] {
  return _cafeLinkRequests.filter((r) => r.agentId === agentId);
}

// ============ 解绑申请 ============
// 网吧主收到的待审批解绑申请（initiator=agent，需网吧主审批）
export function getUnlinkRequestsForOwner(ownerId: string, opts?: { all?: boolean }): CafeUnlinkRequest[] {
  return _cafeUnlinkRequests.filter((r) =>
    r.ownerId === ownerId && r.initiator === 'agent' && (opts?.all ? true : r.status === 'pending')
  );
}
// 代理收到的待审批解绑申请（initiator=owner，需代理审批）
export function getUnlinkRequestsForAgent(agentId: string, opts?: { all?: boolean }): CafeUnlinkRequest[] {
  return _cafeUnlinkRequests.filter((r) =>
    r.agentId === agentId && r.initiator === 'owner' && (opts?.all ? true : r.status === 'pending')
  );
}
// 当前角色发起的全部解绑申请记录
export function getUnlinkRequestsInitiatedBy(role: 'agent' | 'owner', myId: string): CafeUnlinkRequest[] {
  return _cafeUnlinkRequests.filter((r) =>
    r.initiator === role && (role === 'agent' ? r.agentId === myId : r.ownerId === myId)
  );
}
// 某网吧是否已有 pending 解绑申请（用于按钮置灰）
export function getPendingUnlinkForCafe(cafeId: string): CafeUnlinkRequest | undefined {
  return _cafeUnlinkRequests.find((r) => r.cafeId === cafeId && r.status === 'pending');
}

let _cafeSeq = 10;     // MC0010 已用，下一个分配 ID 从 11 起
let _tempSeq = 0;
let _linkSeq = _cafeLinkRequests.length;
let _unlinkSeq = 0;

// B 步：网吧主提交录入申请
//   - 不立即分配 MC ID，仅生成 P-XXXX 临时编号
//   - status='pending'、platformAuditStatus='pending'，等待平台审核
export function addMyCafe(input: {
  name: string;
  province: string;
  city: string;
  address: string;
  declaredTerminalCount: number;     // 录入时申报终端数
  contact: string;
  phone: string;
  ownerId?: string;
}): MyCafe {
  _tempSeq += 1;
  const tempId = `P-${Math.random().toString(36).slice(2, 6).toUpperCase()}${String(_tempSeq).padStart(2, '0')}`;
  const cafe: MyCafe = {
    id: '',
    tempId,
    name: input.name,
    province: input.province,
    city: input.city,
    address: input.address,
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
    ownerId: input.ownerId || CURRENT_OWNER_ID,
  };
  _myCafes.unshift(cafe);
  return cafe;
}

// C 步：平台审核员审批通过 → 分配正式 MC ID
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

// C 步：平台审核员驳回
export function reviewCafeReject(tempId: string, remark: string): boolean {
  const cafe = _myCafes.find((c) => c.tempId === tempId && c.platformAuditStatus === 'pending');
  if (!cafe) return false;
  cafe.platformAuditStatus = 'rejected';
  cafe.platformAuditAt = dayjs().format('YYYY-MM-DD HH:mm');
  cafe.platformAuditRemark = remark;
  return true;
}

// 平台审核台：所有待审核申请
export function getPendingPlatformReviews(): MyCafe[] {
  return _myCafes.filter((c) => c.platformAuditStatus === 'pending');
}
export function getPlatformReviewHistory(): MyCafe[] {
  return _myCafes.filter((c) => c.platformAuditStatus !== 'pending');
}

// F 步：模拟"代理线下铺设霸服上线"
//   写入 launchedAt + 终端/活跃/流水（按申报数 ±10% 随机）
export function setCafeLaunched(cafeId: string): boolean {
  const cafe = _myCafes.find((c) => c.id === cafeId);
  if (!cafe) return false;
  if (cafe.launchedAt) return false;     // 已上线
  cafe.launchedAt = dayjs().format('YYYY-MM-DD');
  const declared = cafe.declaredTerminalCount || 60;
  cafe.terminalCount = Math.round(declared * (0.95 + Math.random() * 0.1));
  cafe.monthlyActiveTerminal = Math.round(cafe.terminalCount * (0.85 + Math.random() * 0.1));
  cafe.dailyActiveTerminal = Math.round(cafe.terminalCount * (0.6 + Math.random() * 0.15));
  cafe.monthRevenue = cafe.terminalCount * (260 + Math.round(Math.random() * 80));
  return true;
}

// 删除门店：仅网吧主可调用；强提醒由 UI 控制
//   - 若该门店有代理关联，会一并解除（不再走审批，因为门店已不存在）
//   - 同时把该门店的所有 pending 关联/解绑申请置为 rejected
export function deleteCafe(cafeId: string, ownerId: string): { ok: boolean; reason?: string } {
  const idx = _myCafes.findIndex((c) => c.id === cafeId);
  if (idx < 0) return { ok: false, reason: 'not_found' };
  if (_myCafes[idx].ownerId !== ownerId) return { ok: false, reason: 'not_yours' };

  // 把所有 pending 申请直接 reject
  _cafeLinkRequests.forEach((r) => {
    if (r.cafeId === cafeId && r.status === 'pending') {
      r.status = 'rejected';
      r.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
      r.decideRemark = '门店已被网吧主删除';
    }
  });
  _cafeUnlinkRequests.forEach((r) => {
    if (r.cafeId === cafeId && r.status === 'pending') {
      r.status = 'rejected';
      r.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
      r.decideRemark = '门店已被网吧主删除';
    }
  });

  _myCafes.splice(idx, 1);
  return { ok: true };
}

export type RequestLinkResult =
  | { ok: true; request: CafeLinkRequest }
  | { ok: false; reason: 'cafe_not_found' | 'cafe_not_approved' | 'already_linked_other' | 'already_linked_self' | 'duplicate_pending' };

export function requestLinkCafe(input: { agentId: string; agentName: string; agentProvince: string; cafeId: string; reason: string }): RequestLinkResult {
  const cafe = findCafeById(input.cafeId);
  if (!cafe) return { ok: false, reason: 'cafe_not_found' };
  if (cafe.platformAuditStatus !== 'approved') return { ok: false, reason: 'cafe_not_approved' };
  if (cafe.agentId === input.agentId) return { ok: false, reason: 'already_linked_self' };
  if (cafe.agentId && cafe.agentId !== input.agentId) return { ok: false, reason: 'already_linked_other' };

  const dup = _cafeLinkRequests.find(
    (r) => r.cafeId === cafe.id && r.agentId === input.agentId && r.status === 'pending'
  );
  if (dup) return { ok: false, reason: 'duplicate_pending' };

  _linkSeq += 1;
  const req: CafeLinkRequest = {
    id: `LR${String(_linkSeq).padStart(6, '0')}`,
    cafeId: cafe.id, cafeName: cafe.name,
    ownerId: cafe.ownerId,
    agentId: input.agentId, agentName: input.agentName, agentProvince: input.agentProvince,
    reason: input.reason,
    status: 'pending',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };
  _cafeLinkRequests.unshift(req);
  return { ok: true, request: req };
}

export function approveLinkRequest(requestId: string, remark?: string): boolean {
  const req = _cafeLinkRequests.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;
  const cafe = findCafeById(req.cafeId);
  if (!cafe) return false;

  cafe.agentId = req.agentId;
  cafe.agentName = req.agentName;

  req.status = 'approved';
  req.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
  req.decideRemark = remark || '审批通过';

  _cafeLinkRequests.forEach((r) => {
    if (r.id !== req.id && r.cafeId === req.cafeId && r.status === 'pending') {
      r.status = 'rejected';
      r.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
      r.decideRemark = '该网吧已选择其它代理';
    }
  });
  return true;
}

export function rejectLinkRequest(requestId: string, remark: string): boolean {
  const req = _cafeLinkRequests.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;
  req.status = 'rejected';
  req.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
  req.decideRemark = remark;
  return true;
}

// ============ 解绑申请 API ============
export type RequestUnlinkResult =
  | { ok: true; request: CafeUnlinkRequest }
  | { ok: false; reason: 'cafe_not_found' | 'not_linked' | 'not_yours' | 'duplicate_pending' };

export function requestUnlinkCafe(input: {
  cafeId: string;
  initiator: 'agent' | 'owner';
  myId: string;     // 发起方的 ID（agentId 或 ownerId）
  reason: string;
}): RequestUnlinkResult {
  const cafe = findCafeById(input.cafeId);
  if (!cafe) return { ok: false, reason: 'cafe_not_found' };
  if (!cafe.agentId) return { ok: false, reason: 'not_linked' };
  if (input.initiator === 'agent' && cafe.agentId !== input.myId) return { ok: false, reason: 'not_yours' };
  if (input.initiator === 'owner' && cafe.ownerId !== input.myId) return { ok: false, reason: 'not_yours' };

  const dup = _cafeUnlinkRequests.find((r) => r.cafeId === cafe.id && r.status === 'pending');
  if (dup) return { ok: false, reason: 'duplicate_pending' };

  _unlinkSeq += 1;
  const req: CafeUnlinkRequest = {
    id: `UR${String(_unlinkSeq).padStart(6, '0')}`,
    cafeId: cafe.id, cafeName: cafe.name,
    ownerId: cafe.ownerId,
    agentId: cafe.agentId,
    agentName: cafe.agentName || '',
    initiator: input.initiator,
    reason: input.reason,
    status: 'pending',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
  };
  _cafeUnlinkRequests.unshift(req);
  return { ok: true, request: req };
}

export function approveUnlinkRequest(requestId: string, remark?: string): boolean {
  const req = _cafeUnlinkRequests.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;
  const cafe = findCafeById(req.cafeId);
  if (!cafe) return false;

  cafe.agentId = undefined;
  cafe.agentName = undefined;

  req.status = 'approved';
  req.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
  req.decideRemark = remark || '同意解绑';
  return true;
}

export function rejectUnlinkRequest(requestId: string, remark: string): boolean {
  const req = _cafeUnlinkRequests.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') return false;
  req.status = 'rejected';
  req.decidedAt = dayjs().format('YYYY-MM-DD HH:mm');
  req.decideRemark = remark;
  return true;
}

// =================== 聚合 ===================
export type CafeScaleSummary = {
  cafeCount: number;
  terminalCount: number;
  monthlyActiveTerminal: number;
  dailyActiveTerminal: number;
  monthRevenue: number;
  linkedAgentCafeCount: number;
  standaloneCafeCount: number;
};

export function summarizeCafes(cafes: MyCafe[]): CafeScaleSummary {
  return {
    cafeCount: cafes.length,
    terminalCount: cafes.reduce((s, c) => s + c.terminalCount, 0),
    monthlyActiveTerminal: cafes.reduce((s, c) => s + c.monthlyActiveTerminal, 0),
    dailyActiveTerminal: cafes.reduce((s, c) => s + c.dailyActiveTerminal, 0),
    monthRevenue: cafes.reduce((s, c) => s + c.monthRevenue, 0),
    linkedAgentCafeCount: cafes.filter((c) => !!c.agentId).length,
    standaloneCafeCount: cafes.filter((c) => !c.agentId).length,
  };
}

export const recentFeed = [
  { time: '5/25 14:00', type: 'info', content: '代理 李** 对「星辰电竞·龙华店」发起关联申请，待审批' },
  { time: '5/20 09:30', type: 'info', content: '新增门店「星辰电竞·龙华店」，状态 待审核' },
  { time: '5/12 11:20', type: 'success', content: '门店「星辰电竞·南山旗舰店」月活终端突破 100 台' },
  { time: '5/10 16:00', type: 'warning', content: '门店「星辰电竞·罗湖店」当日活跃终端较上周下降 12%' },
  { time: '5/05 18:00', type: 'success', content: '代理 李** 与「星辰电竞·宝安店」关联成功' },
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
  roleId: 'A2001',
  role: 'agent',
  subjectType: 'company',
  realName: '李建国',
  idCard: '4403**********1234',
  companyName: '星辰文化传媒有限公司',
  creditCode: '91440300MA5F****XL',
  contact: '李代理',
  phone: '139****8821',
  email: 'li****@xingchen.com',
  province: '广东',
  city: '深圳',
  address: '南山区科技园南路 88 号迪越大厦 12 楼',
  authStatus: 'verified',
  registeredAt: '2026-01-01',
};

export const ownerProfile: AccountProfile = {
  roleId: 'O20260215',
  role: 'owner',
  subjectType: 'personal',
  realName: '王明远',
  idCard: '4403**********5678',
  contact: '王老板',
  phone: '136****6688',
  email: 'wang****@163.com',
  province: '广东',
  city: '深圳',
  address: '南山区科技园南路 88 号 3 楼',
  authStatus: 'verified',
  registeredAt: '2026-02-15',
};

export function getMyProfile(): AccountProfile {
  return currentRole === 'owner' ? ownerProfile : agentProfile;
}
