// 全部 demo 数据，集中管理
import dayjs from 'dayjs';

// 用户身份：代理可管多家网吧，网吧主仅管自己 1 家。两者收入结构相同（首装激励 + CPS 分成）
export type UserRole = 'agent' | 'owner';
// demo：从 sessionStorage 读身份，便于在 Header 用 Segmented 切换
const _stored = typeof window !== 'undefined' ? window.sessionStorage.getItem('demo_role') : null;
export const currentRole: UserRole = (_stored === 'owner' ? 'owner' : 'agent');

export const agentInfo = {
  role: 'agent' as UserRole,
  name: '星辰文化传媒（代理）',
  contact: '李代理',
  province: '广东',
  startDate: '2026-01-01',
  cafeCount: 50,                  // 代理：托管 50 家网吧
  terminalCount: 5000,            // 总终端数 = 50 家 × 100 台/家
  // CPS 结算方式拆分：
  // 区域结算（按省渠道号分母）→ 已配置渠道号的终端 3200 台
  // 全局结算（按全国总分母）→ 未配置或未走区域的终端 1800 台
  regionalTerminals: 3200,
  globalTerminals: 1800,
  monthlyActiveTerminal: 4700,    // 月活率 ~94%
  dailyActiveTerminal: 3950,      // 日活率 ~79%
};

// 网吧主信息（demo 单店）
export const ownerInfo = {
  role: 'owner' as UserRole,
  name: '星辰电竞·南山店',
  contact: '王老板',
  province: '广东',
  startDate: '2026-02-15',
  terminalCount: 100,             // 单家网吧默认 100 台
  regionalTerminals: 80,          // 80 台已打省渠道号
  globalTerminals: 20,            // 20 台走全局结算
  monthlyActiveTerminal: 94,
  dailyActiveTerminal: 79,
};

// 结算周期：每月最后一天作为结算日（粗拍口径）
export const settlementCycle = {
  cycleType: 'monthly',
  cutoffRule: '每月最后一天 23:59 截止',
  // 下个结算日（动态计算：本月最后一天）
  nextSettleDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  daysToNextSettle: dayjs().endOf('month').diff(dayjs(), 'day'),
};

// 单台终端单价口径（核心模型）
// 首装激励：¥50/台 一次性 → 按 12 个月分摊（每月 ¥4.17/台 × 12 期）
// CPS 分成：按月按活跃抽成（约 ¥8.5/台·月 月均预估）
export const unitPrice = {
  installTotal: 50,                   // 单台首装激励总额（元/台）
  installMonths: 12,                  // 分摊月数
  installPerMonth: 4.17,              // 单台首装激励每月分摊（50 / 12 ≈ 4.17）
  cpsPerTerminalMonth: 8.5,           // 单台 CPS 月均预估
  totalPerTerminalMonth: 12.67,       // 单台月单价合计 = 首装分摊 + CPS（4.17 + 8.5）
};

// Hero 数据（按当前角色取值，这里用代理的）
export const heroStats = {
  terminalCount: 5000,
  totalPerTerminalMonth: 12.67,
  monthIncome: Math.round(5000 * 12.67 * 100) / 100,         // 本月预估 = 终端数 × 单台月单价
  monthIncomeInstall: Math.round(5000 * 4.17 * 100) / 100,   // 首装分摊
  monthIncomeCps: Math.round(5000 * 8.5 * 100) / 100,        // CPS 分成
  balance: 12480.5,
  withdrawable: 8920.0,
  totalIncome: 138420.5,
};

// 首装激励"分摊年金"：每台首装 50 元 × 12 期分摊
// 用于展示：当前还有多少台终端处于"首装分摊期"，剩余应分摊总额
export const installAnnuity = {
  totalTerminals: 5000,                                  // 总终端数
  inAnnuityTerminals: 4600,                              // 仍在 12 期分摊期内的终端数
  totalRemaining: Math.round(4600 * 4.17 * 7 * 100) / 100, // 平均剩 7 个月 × ¥4.17/月
  avgRemainingMonths: 7,                                 // 平均剩余分摊月数
  thisMonthAmount: Math.round(4600 * 4.17 * 100) / 100,  // 本月首装分摊金额
};

// 收益趋势 30 天
export const incomeTrend = Array.from({ length: 30 }, (_, i) => {
  const date = dayjs().subtract(29 - i, 'day').format('MM-DD');
  return {
    date,
    cps: Math.round((Math.random() * 30 + 30) * 100) / 100,
    incentive: Math.round((Math.random() * 15 + 8) * 100) / 100,
  };
});

// 网吧分布
export const cafeProvinceDistribution = [
  { province: '广东', count: 28, terminal: 1380, income: 432.5 },
  { province: '湖南', count: 18, terminal: 920, income: 298.2 },
  { province: '四川', count: 14, terminal: 720, income: 256.8 },
  { province: '河南', count: 12, terminal: 580, income: 188.4 },
  { province: '浙江', count: 9, terminal: 480, income: 158.6 },
  { province: '江苏', count: 8, terminal: 400, income: 132.0 },
  { province: '湖北', count: 6, terminal: 280, income: 98.4 },
  { province: '其他', count: 5, terminal: 240, income: 78.5 },
];

// ========== 省份分成矩阵：区域结算的核心数据 ==========
// 按省份维度展示：代理在该省的终端数、已配/未配渠道号台数、本月该省区域池分成
// channelCode: 配置在该省的渠道号 ID，未配置则为空
// regionalIncome: 来自本省渠道号区域池的本月分成
export const provinceMatrix = [
  {
    province: '广东',
    channelCode: 'GD-XCWH-2026',
    cafeCount: 18,
    terminalTotal: 1820,
    terminalConfigured: 1820,
    terminalUnconfigured: 0,
    regionalPoolTotal: 18500,        // 全省本月区域池总金额
    regionalIncome: 6850.0,          // 我从该池分得
    monthLastChange: '2026-04-15',
  },
  {
    province: '湖南',
    channelCode: 'HN-XCWH-2026',
    cafeCount: 11,
    terminalTotal: 1080,
    terminalConfigured: 1080,
    terminalUnconfigured: 0,
    regionalPoolTotal: 9200,
    regionalIncome: 3680.0,
    monthLastChange: '2026-04-15',
  },
  {
    province: '四川',
    channelCode: 'SC-XCWH-2026',
    cafeCount: 8,
    terminalTotal: 780,
    terminalConfigured: 300,
    terminalUnconfigured: 480,        // ⚠️ 480 台未配号
    regionalPoolTotal: 4200,
    regionalIncome: 1280.0,
    monthLastChange: '2026-05-02',
  },
  {
    province: '河南',
    channelCode: '',                  // ⚠️ 整个省都没配号
    cafeCount: 7,
    terminalTotal: 620,
    terminalConfigured: 0,
    terminalUnconfigured: 620,
    regionalPoolTotal: 0,
    regionalIncome: 0,
    monthLastChange: '',
  },
  {
    province: '浙江',
    channelCode: 'ZJ-XCWH-2026',
    cafeCount: 4,
    terminalTotal: 380,
    terminalConfigured: 0,
    terminalUnconfigured: 380,        // ⚠️ 渠道号已建但未下发
    regionalPoolTotal: 5600,          // 该省区域池金额，但我没分到（终端未配号）
    regionalIncome: 0,
    monthLastChange: '2026-04-20',
  },
  {
    province: '江苏',
    channelCode: 'JS-XCWH-2026',
    cafeCount: 2,
    terminalTotal: 220,
    terminalConfigured: 0,
    terminalUnconfigured: 220,
    regionalPoolTotal: 3800,
    regionalIncome: 0,
    monthLastChange: '2026-05-10',
  },
  {
    province: '湖北',
    channelCode: '',
    cafeCount: 0,
    terminalTotal: 100,                // 跨省网吧也可能有少量终端
    terminalConfigured: 0,
    terminalUnconfigured: 100,
    regionalPoolTotal: 0,
    regionalIncome: 0,
    monthLastChange: '',
  },
];

// 全国全局池金额（用于 demo 展示）
export const globalPoolStats = {
  totalAmount: 18000,                 // 全国未打号终端创造的总池子
  totalNationalTerminals: 100000,     // 全国总终端数（区域池+全局池统一分母）
  myShareTerminals: 5000,             // 我的终端数
  myGlobalIncome: Math.round((18000 / 100000) * 5000 * 100) / 100, // 5000 × 0.18 = 900
};

// 网吧列表（增加 channelCode / 配号状态）
export const cafeList = Array.from({ length: 100 }).map((_, i) => {
  const provinces = ['广东', '湖南', '四川', '河南', '浙江', '江苏'];
  // 仅作为网吧名样例，不再代表"连锁"概念
  const namePool = ['星辰电竞', '天翼网咖', '鏖战网吧', '电竞之星', '热血网吧', '风云网咖'];
  const namePrefix = namePool[i % namePool.length];
  const province = provinces[i % provinces.length];
  // 模拟：广东/湖南 100% 已配号，四川 ~40%，浙江/江苏全未配，河南全未配
  const channelMap: Record<string, string> = {
    '广东': 'GD-XCWH-2026',
    '湖南': 'HN-XCWH-2026',
    '四川': 'SC-XCWH-2026',
    '浙江': 'ZJ-XCWH-2026',
    '江苏': 'JS-XCWH-2026',
  };
  // 决定本店是否已下发渠道号
  let configured = false;
  if (province === '广东' || province === '湖南') configured = true;
  else if (province === '四川') configured = i % 5 < 2; // ~40%
  else configured = false; // 河南 / 浙江 / 江苏
  const channelCode = configured ? channelMap[province] || '' : '';
  return {
    id: `CC${String(i + 1).padStart(4, '0')}`,
    name: `${namePrefix}·${i + 1}店`,
    province,
    channelCode,                     // 已下发渠道号（区域结算）
    settleMode: configured ? 'regional' : 'global', // 结算方式
    terminalCount: Math.floor(Math.random() * 50) + 30,
    activeRate: (Math.random() * 15 + 80).toFixed(1),
    monthIncome: (Math.random() * 300 + 100).toFixed(2),
    status: i % 13 === 0 ? 'abnormal' : 'normal',
    menuVersion: i % 4 === 0 ? 'v1.2.5' : 'v1.2.4',
    onlineDate: dayjs().subtract(Math.floor(Math.random() * 120), 'day').format('YYYY-MM-DD'),
  };
});

// 历史账单
export const billingHistory = [
  { period: '2026-05', amount: 1530.8, paid: 1484.88, status: 'paid', tax: 45.92 },
  { period: '2026-04', amount: 1420.5, paid: 1377.89, status: 'paid', tax: 42.61 },
  { period: '2026-03', amount: 980.0, paid: 0, status: 'processing', tax: 29.4 },
  { period: '2026-02', amount: 850.2, paid: 824.69, status: 'paid', tax: 25.51 },
  { period: '2026-01', amount: 620.0, paid: 601.4, status: 'paid', tax: 18.6 },
];

// 提现记录
export const withdrawHistory = [
  { id: 'W20260515001', applyTime: '2026-05-15 14:00', amount: 1200, account: '工行 ****8821', status: 'paid', remark: '' },
  { id: 'W20260410001', applyTime: '2026-04-10 09:30', amount: 980, account: '工行 ****8821', status: 'paid', remark: '' },
  { id: 'W20260312001', applyTime: '2026-03-12 16:45', amount: 800, account: '工行 ****8821', status: 'failed', remark: '户名不符' },
  { id: 'W20260210001', applyTime: '2026-02-10 11:20', amount: 650, account: '工行 ****8821', status: 'paid', remark: '' },
];

// 最近动态
export const recentFeed = [
  { time: '5/18 14:00', type: 'success', content: '提现 ¥1,200 已到账' },
  { time: '5/17 09:30', type: 'info', content: '新增网吧"星辰电竞·12店"加盟' },
  { time: '5/15 18:00', type: 'info', content: '5 月度账单已生成，应结金额 ¥1,530.80' },
  { time: '5/12 11:20', type: 'warning', content: '阶梯档位距下一档还差 200 家' },
  { time: '5/10 16:00', type: 'error', content: '网吧 CC0013 触发反作弊预警，已自动暂停结算' },
];

// =================== 后台数据 ===================
export const adminGlobalStats = {
  cafeCount: 1287,
  terminalCount: 64350,
  monthCps: 385200,
  pendingSettle: 48000,
};

export const topAgents = [
  { name: '星辰文化', province: '广东', cafe: 100, terminal: 4820, cps: 12500 },
  { name: '蜀风传媒', province: '四川', cafe: 85, terminal: 4250, cps: 10800 },
  { name: '湘江科技', province: '湖南', cafe: 78, terminal: 3900, cps: 9920 },
  { name: '中原网络', province: '河南', cafe: 65, terminal: 3250, cps: 8200 },
  { name: '钱塘传媒', province: '浙江', cafe: 52, terminal: 2600, cps: 6850 },
];

export const adminAgentList = Array.from({ length: 32 }).map((_, i) => {
  const names = ['星辰文化', '蜀风传媒', '湘江科技', '中原网络', '钱塘传媒', '燕赵网络', '岭南传媒', '塞北电竞'];
  const tiers = ['前100家', '前300家', '前1000家', '前2000家'];
  return {
    id: `A${String(1001 + i).padStart(4, '0')}`,
    name: `${names[i % names.length]}·${i + 1}`,
    contact: `代理${i + 1}`,
    province: ['广东', '四川', '湖南', '河南', '浙江', '江苏'][i % 6],
    cafeCount: Math.floor(Math.random() * 90) + 10,
    terminalCount: (Math.floor(Math.random() * 90) + 10) * 50,
    tier: tiers[Math.floor(Math.random() * 4)],
    monthCps: Math.floor(Math.random() * 12000) + 1000,
    guaranteePct: Math.floor(Math.random() * 80) + 30,
    status: i % 11 === 0 ? 'frozen' : 'active',
    startDate: dayjs().subtract(Math.floor(Math.random() * 200) + 30, 'day').format('YYYY-MM-DD'),
  };
});

// 月度结算批次
export const settlementBatches = [
  { period: '2026-05', status: 'generated', startTime: '2026-06-01 00:05', cost: '12 分钟', amount: 385200, exception: 0 },
  { period: '2026-04', status: 'paid', startTime: '2026-05-01 00:05', cost: '11 分钟', amount: 362800, exception: 2 },
  { period: '2026-03', status: 'paid', startTime: '2026-04-01 00:06', cost: '10 分钟', amount: 298500, exception: 1 },
  { period: '2026-02', status: 'paid', startTime: '2026-03-01 00:05', cost: '9 分钟', amount: 245200, exception: 0 },
  { period: '2026-01', status: 'paid', startTime: '2026-02-01 00:05', cost: '8 分钟', amount: 198400, exception: 0 },
];

// 提现审批队列
export const withdrawApprovals = [
  { id: 'W202605181430', applyTime: '2026-05-18 14:30', applicant: '星辰文化', type: 'agent', amount: 1500, account: '工行 ****8821', invoice: true, status: 'pending', risk: 'low' },
  { id: 'W202605181420', applyTime: '2026-05-18 14:20', applicant: '老王（散店主）', type: 'cafe', amount: 250, account: '微信 ****6688', invoice: false, status: 'auto', risk: 'low' },
  { id: 'W202605181410', applyTime: '2026-05-18 14:10', applicant: '蜀风传媒', type: 'agent', amount: 8500, account: '建行 ****1234', invoice: true, status: 'pending', risk: 'medium' },
  { id: 'W202605181030', applyTime: '2026-05-18 10:30', applicant: '湘江科技', type: 'agent', amount: 12000, account: '招行 ****5588', invoice: true, status: 'reviewing', risk: 'low' },
  { id: 'W202605180920', applyTime: '2026-05-18 09:20', applicant: '老李（散店主）', type: 'cafe', amount: 380, account: '微信 ****1188', invoice: false, status: 'auto', risk: 'low' },
  { id: 'W202605180830', applyTime: '2026-05-18 08:30', applicant: '燕赵网络', type: 'agent', amount: 6800, account: '中行 ****9988', invoice: false, status: 'rejected', risk: 'high' },
];

// 代理端：导航栏未读消息数
export const unreadMessages = 5;

// =================== 合同管理 ===================
// 合同状态：draft 草稿 / pending 待审核 / signing 待对方签署 / active 已生效 / expired 已过期 / rejected 驳回
export type ContractStatus = 'draft' | 'pending' | 'signing' | 'active' | 'expired' | 'rejected';

export const contractStatusLabel: Record<ContractStatus, { text: string; color: string }> = {
  draft:    { text: '草稿',     color: 'default' },
  pending:  { text: '待审核',   color: 'processing' },
  signing:  { text: '待签署',   color: 'warning' },
  active:   { text: '已生效',   color: 'success' },
  expired:  { text: '已过期',   color: 'default' },
  rejected: { text: '驳回',     color: 'error' },
};

// 我（当前代理）的合同列表
// demo 默认：有一份已生效合同 → 允许提现
export const myContracts = [
  {
    id: 'CT2026010001',
    name: '《手助网吧菜单铺设合作协议（2026 版）》',
    party: '星辰文化传媒（甲方）× 深圳迪越科技（乙方）',
    type: '代理合作合同',
    signedAt: '2026-01-05',
    effectiveStart: '2026-01-05',
    effectiveEnd: '2027-01-04',
    amountClause: '首装激励 ¥50/台 + CPS 分成（区域 / 全局双池）',
    status: 'active' as ContractStatus,
    fileName: '星辰文化-手助网吧合作协议-2026.pdf',
    fileSize: '1.2 MB',
    uploadBy: '李代理',
    auditBy: '迪越法务·张',
    auditAt: '2026-01-08 16:20',
    auditRemark: '审核通过，正式生效',
  },
  {
    id: 'CT2026040002',
    name: '《终端规模扩展补充协议》',
    party: '星辰文化传媒（甲方）× 深圳迪越科技（乙方）',
    type: '补充协议',
    signedAt: '2026-04-15',
    effectiveStart: '2026-04-15',
    effectiveEnd: '2027-01-04',
    amountClause: '终端规模扩展至 5,000 台，首装激励单价不变',
    status: 'active' as ContractStatus,
    fileName: '星辰文化-补充协议-终端扩展.pdf',
    fileSize: '0.4 MB',
    uploadBy: '李代理',
    auditBy: '迪越法务·张',
    auditAt: '2026-04-17 10:30',
    auditRemark: '审核通过',
  },
  {
    id: 'CT2026050003',
    name: '《2026 Q3 销售激励补充协议》',
    party: '星辰文化传媒（甲方）× 深圳迪越科技（乙方）',
    type: '激励协议',
    signedAt: '2026-05-12',
    effectiveStart: '2026-07-01',
    effectiveEnd: '2026-09-30',
    amountClause: 'Q3 期间新增网吧每家额外奖励 ¥500',
    status: 'pending' as ContractStatus,
    fileName: '星辰文化-Q3激励补充协议.pdf',
    fileSize: '0.3 MB',
    uploadBy: '李代理',
    auditBy: '',
    auditAt: '',
    auditRemark: '',
  },
];

// 当前合同状态汇总（用于全局判断"是否允许提现"）
export const contractGate = {
  // 是否存在有效合同（status === 'active' 且当前日期在有效期内）
  hasActiveContract: myContracts.some((c) => c.status === 'active'),
  activeCount: myContracts.filter((c) => c.status === 'active').length,
  pendingCount: myContracts.filter((c) => c.status === 'pending').length,
  signingCount: myContracts.filter((c) => c.status === 'signing').length,
  // 主合同（最早一份生效合同）
  primaryContract: myContracts.find((c) => c.status === 'active' && c.type === '代理合作合同'),
};

// 合同模板列表（代理录入时可下载）
export const contractTemplates = [
  { id: 'TPL01', name: '代理合作合同（标准版）', version: 'v2026.1', updatedAt: '2026-01-01', size: '78 KB' },
  { id: 'TPL02', name: '终端规模扩展补充协议', version: 'v2026.1', updatedAt: '2026-01-01', size: '32 KB' },
  { id: 'TPL03', name: '销售激励补充协议', version: 'v2026.1', updatedAt: '2026-03-01', size: '36 KB' },
  { id: 'TPL04', name: '终止合作协议', version: 'v2026.1', updatedAt: '2026-01-01', size: '28 KB' },
];

// 后台：所有代理的合同审核队列
export const adminContractQueue = [
  { id: 'CT2026050003', agent: '星辰文化', type: '激励协议', uploadAt: '2026-05-12 10:20', amount: '—', status: 'pending', risk: 'low' },
  { id: 'CT2026051104', agent: '蜀风传媒', type: '代理合作合同', uploadAt: '2026-05-11 16:40', amount: '首装¥50/台', status: 'pending', risk: 'low' },
  { id: 'CT2026051005', agent: '湘江科技', type: '补充协议', uploadAt: '2026-05-10 09:15', amount: '扩展至8000台', status: 'reviewing', risk: 'medium' },
  { id: 'CT2026050906', agent: '中原网络', type: '代理合作合同', uploadAt: '2026-05-09 14:30', amount: '首装¥50/台', status: 'rejected', risk: 'high' },
];

// =================== 注册 / 入驻 ===================
// 入驻角色：仅两种 —— 代理 / 网吧主。两者均可「选择性」关联：
// 网吧主可关联代理（也可不关联，直连迪越）；代理可关联已建网吧。
export type RegisterRole = 'agent' | 'owner';

export const registerRoleOptions: { value: RegisterRole; label: string; desc: string }[] = [
  { value: 'agent', label: '代理', desc: '托管多家网吧，享 CPS 20% + 阶梯激励 + 保底；可关联已建网吧' },
  { value: 'owner', label: '网吧主', desc: '经营网吧并参与结算；可关联代理，也可不关联直连迪越' },
];

// 名字脱敏：保留姓氏，其余用 * 替换（如 董子霄 → 董**，王五 → 王*）
export function maskName(name: string): string {
  if (!name) return '';
  if (name.length === 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}

// 可被关联的「代理」候选（网吧主关联代理时，输入 ID 精确匹配，名字脱敏模糊展示）
export type LinkAgent = { id: string; name: string; province: string };
export const linkableAgents: LinkAgent[] = [
  { id: 'A1001', name: '董子霄', province: '广东' },
  { id: 'A1002', name: '李建国', province: '湖南' },
  { id: 'A1003', name: '王明远', province: '四川' },
  { id: 'A1004', name: '赵晓彤', province: '浙江' },
  { id: 'A1005', name: '孙立伟', province: '江苏' },
];

// 可被关联的「网吧」候选（代理关联已建网吧时，输入 ID 精确匹配，名字脱敏模糊展示）
export type LinkCafe = { id: string; name: string; province: string };
export const linkableCafes: LinkCafe[] = [
  { id: 'CC0001', name: '星辰电竞南山店', province: '广东' },
  { id: 'CC0002', name: '鏖战网吧龙华店', province: '广东' },
  { id: 'CC0003', name: '热血电竞长沙店', province: '湖南' },
  { id: 'CC0004', name: '天翼网咖成都店', province: '四川' },
  { id: 'CC0005', name: '电竞之星杭州店', province: '浙江' },
];

// 按 ID 精确查代理 / 网吧（用于关联输入框校验与脱敏展示）
export function findLinkAgentById(id: string): LinkAgent | undefined {
  return linkableAgents.find((a) => a.id === id.trim());
}
export function findLinkCafeById(id: string): LinkCafe | undefined {
  return linkableCafes.find((c) => c.id === id.trim());
}

// 省份 → 城市（demo 精简）
export const provinceCityOptions = [
  { value: '广东', label: '广东', children: [{ value: '深圳', label: '深圳' }, { value: '广州', label: '广州' }, { value: '东莞', label: '东莞' }] },
  { value: '湖南', label: '湖南', children: [{ value: '长沙', label: '长沙' }, { value: '株洲', label: '株洲' }] },
  { value: '四川', label: '四川', children: [{ value: '成都', label: '成都' }, { value: '绵阳', label: '绵阳' }] },
  { value: '河南', label: '河南', children: [{ value: '郑州', label: '郑州' }, { value: '洛阳', label: '洛阳' }] },
  { value: '浙江', label: '浙江', children: [{ value: '杭州', label: '杭州' }, { value: '宁波', label: '宁波' }] },
  { value: '江苏', label: '江苏', children: [{ value: '南京', label: '南京' }, { value: '苏州', label: '苏州' }] },
];

// 开户行（demo）
export const bankOptions = [
  '中国工商银行', '中国建设银行', '中国农业银行', '中国银行',
  '招商银行', '交通银行', '中国邮政储蓄银行', '中信银行', '平安银行',
];

// =================== 我的网吧（可录入 / 可读取的内存 store） ===================
// demo：用模块级数组模拟"用户创角后自己录入的网吧"，新增后立即可在列表展示
export type MyCafe = {
  id: string;
  name: string;          // 网吧名
  province: string;      // 省
  city: string;          // 市
  address: string;       // 详细地址（门牌号）
  terminalCount: number; // 终端数
  contact: string;       // 现场联系人
  phone: string;         // 联系电话
  businessHours: string; // 营业时间
  settleMode: 'regional' | 'global'; // 录入时默认全局，待运营下发渠道号转区域
  status: 'pending' | 'normal';      // pending：待审核 / normal：已生效
  createdAt: string;
};

// 初始预置 2 家（演示已有数据）
const _myCafes: MyCafe[] = [
  {
    id: 'MC0001', name: '星辰电竞·南山旗舰店', province: '广东', city: '深圳',
    address: '南山区科技园南路 88 号 3 楼', terminalCount: 120, contact: '王老板', phone: '139****8821',
    businessHours: '00:00 - 24:00', settleMode: 'regional', status: 'normal',
    createdAt: '2026-02-15',
  },
  {
    id: 'MC0002', name: '星辰电竞·龙华店', province: '广东', city: '深圳',
    address: '龙华区民治大道 200 号 2 楼', terminalCount: 80, contact: '陈店长', phone: '136****6688',
    businessHours: '08:00 - 02:00', settleMode: 'global', status: 'pending',
    createdAt: '2026-05-20',
  },
];

export function getMyCafes(): MyCafe[] {
  return _myCafes;
}

let _cafeSeq = _myCafes.length;
export function addMyCafe(input: Omit<MyCafe, 'id' | 'settleMode' | 'status' | 'createdAt'>): MyCafe {
  _cafeSeq += 1;
  const cafe: MyCafe = {
    ...input,
    id: `MC${String(_cafeSeq).padStart(4, '0')}`,
    settleMode: 'global',   // 新录入默认全局结算，待运营下发渠道号后转区域
    status: 'pending',      // 新录入待审核
    createdAt: dayjs().format('YYYY-MM-DD'),
  };
  _myCafes.unshift(cafe);
  return cafe;
}

// =================== 个人信息 / 账户档案 ===================
// 个人信息页展示：注册创角时填写的实名、联系方式、地址、银行账户 + 角色 ID。
// 字段分三类：①只读（实名信息，人脸/执照校验回填，不可改）②可编辑（手机/邮箱）③账户（银行）
export type AccountProfile = {
  roleId: string;                       // ★ 当前角色 ID（最重要：关联、客服核验、对账唯一标识）
  role: UserRole;                       // 角色类型
  subjectType: 'personal' | 'company';  // 主体性质
  // —— 实名信息（只读，校验回填）——
  realName: string;                     // 姓名
  idCard: string;                       // 身份证号（脱敏）
  companyName?: string;                 // 企业名称（企业主体）
  creditCode?: string;                  // 统一社会信用代码（企业主体）
  // —— 联系方式（可编辑）——
  contact: string;                      // 联系人
  phone: string;                        // 手机号
  email: string;                        // 邮箱
  province: string;                     // 省
  city: string;                         // 市
  address: string;                      // 详细联系地址
  // —— 银行账户（结算提现）——
  bank: string;                         // 开户行
  bankAccount: string;                  // 银行账号（脱敏）
  accountName: string;                  // 开户名
  // —— 关联关系 ——
  linkedId?: string;                    // 网吧主→关联代理ID / 代理→关联网吧ID（无则空）
  linkedName?: string;                  // 关联对象名（脱敏展示）
  // —— 账户状态 ——
  authStatus: 'verified' | 'pending';   // 资质审核状态
  registeredAt: string;                 // 注册时间
};

// 代理档案（企业主体）
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
  bank: '中国工商银行',
  bankAccount: '6222 **** **** 8821',
  accountName: '星辰文化传媒有限公司',
  authStatus: 'verified',
  registeredAt: '2026-01-01',
};

// 网吧主档案（个人主体，关联代理 A1001 董子霄）
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
  bank: '招商银行',
  bankAccount: '6225 **** **** 6688',
  accountName: '王明远',
  linkedId: 'A1001',
  linkedName: maskName('董子霄'), // 董**
  authStatus: 'verified',
  registeredAt: '2026-02-15',
};

// 按当前角色取档案（个人信息页使用）
export function getMyProfile(): AccountProfile {
  return currentRole === 'owner' ? ownerProfile : agentProfile;
}
