# 手助网吧 · 代理结算管理平台 Demo（v3 单角色版）

> React + TypeScript + Vite + Ant Design 原型。当前主目录 `billing-platform/` 已改为 **代理单角色版本**：不再创建网吧主账号，不再给网吧主分成，所有操作由代理执行。

## 📚 评审 / 研发对接文档

| 文档 | 状态 | 内容 |
| --- | --- | --- |
| [`docs/PRD-加盟管理平台.md`](./docs/PRD-加盟管理平台.md) | ✅ 当前主 PRD | v3 单角色完整需求：登录资质、代理录入网吧、终端/流水口径、平台管理端 |
| [`docs/PRD-v3-代理单角色.md`](./docs/PRD-v3-代理单角色.md) | ✅ 快速摘要 | v3 新逻辑速览：主链路、页面调整、Mock 数据模型 |
| [`docs/接口与数据模型.md`](./docs/接口与数据模型.md) | 历史参考 | v2 双角色接口模型，当前 v3 以主 PRD 为准 |
| [`docs/结算平台上下文.md`](./docs/结算平台上下文.md) | 历史脉络 | 项目旧上下文记录 |

> 给研发讲当前版本时，建议按 **主 PRD §3 端到端主链路 → §5 页面级详细需求 → §6 数据模型与 Mock API → §10 评审 checklist** 的顺序过。

## Demo 定位（v3）

当前版本只保留「代理」一种业务角色：

| 类别 | 当前逻辑 |
| --- | --- |
| ✅ 代理登录 & 资质完善 | 优先使用现有 QQ 登录，再完善代理主体资料、营业执照/实名与联系方式 |
| ✅ 代理录入网吧 | 代理直接录入网吧 ID、网吧名称、地址、终端规模、现场联系人；不知道网吧 ID 可联系区域经理 |
| ✅ 平台审核 | 平台审核员审核代理提交的网吧资料；业务网吧 ID 由代理提前获取，`MCxxxx` 仅为 Demo 内部系统记录 ID |
| ✅ 代理铺设上线 | 代理线下铺设霸服系统，Demo 中用「模拟铺设」按钮代替真实回调 |
| ✅ 规模数据展示 | 终端规模、已活跃终端、月活、日活、实际流水与历史流水记录，只做展示不做网吧主分成 |
| ✅ 门店删除 | 代理可删除门店，需输入门店全名二次确认 |

### 已下线能力

- ❌ 网吧主账号 / 网吧主登录 / 网吧主控制台
- ❌ 代理 ↔ 网吧主关联申请
- ❌ 网吧主审批关联
- ❌ 双向解绑审批
- ❌ 散店 / 已关联代理口径
- ❌ 网吧主分成、网吧主提现、网吧主收益展示

## 主要页面

```
/                    QQ 登录页（扫码登录 / 密码登录直进已认证控制台 / 完善资质 Tab / 小号注册入口 / 意见反馈 / 联系客服 / 平台审核员入口）
/register            代理资质完善（QQ 已登录状态 / 主体性质 / 营业执照或实名认证 / 联系方式 / 协议）
/agent/dashboard     概览首页（代理身份卡 + 待审核/待铺设提示 + 终端规模/活跃/流水指标，已去除最近动态）
/agent/my-cafes      网吧管理（录入 / 审核状态 / 模拟铺设 / 编辑 / 删除 / 数据表 / 历史流水记录）
/agent/profile       代理信息（代理 ID / 实名 / 联系方式，已移除名下网吧摘要）
/admin/audit         平台管理端（总览 / 代理数据看板 / 全平台网吧明细 / 待审核 / 已审核记录）
```

## 新主链路

```
A. 使用现有 QQ 号登录，并完善代理主体资质（企业需上传营业执照，个人需实名）
B. 代理录入网吧资料（必填网吧 ID），生成临时编号 P-XXXX
C. 平台审核员审核，通过后代理安排线下铺设霸服系统（Demo 用「模拟铺设」）
D. 终端规模由代理人工维护，已活跃终端 / 日活 / 月活 / 流水由数据回传并展示
```

## 核心数据模型（v3）

```ts
type MyCafe = {
  id: string;                       // 系统内部记录 ID MCxxxx
  tempId?: string;                  // 平台审核前临时编号 P-XXXX
  externalCafeId: string;           // 代理录入的网吧 ID，不知道可联系区域经理
  name: string;
  province: string;
  city: string;
  address: string;
  terminalScaleCount: number;       // 代理人工维护的终端规模数
  terminalCount: number;            // 已活跃终端数，上线后回传
  monthlyActiveTerminal: number;
  dailyActiveTerminal: number;
  monthRevenue: number;
  contact: string;                  // 现场联系人
  phone: string;
  platformAuditStatus: 'pending' | 'approved' | 'rejected';
  launchedAt?: string;              // 有值 = 已铺设上线
  agentId: string;                  // 直接归属代理
  agentName: string;
}
```

## 启动

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 生产构建
```

> 当前环境里全局 `npm` 可能不在 PATH；如本机已有 Node，请在终端自行执行以上命令。

## 技术栈

- React 19 + TypeScript + Vite
- React Router
- Ant Design
- Mock 数据：`src/mock/data.ts`

## 版本说明

- `billing-platform/`：当前 v3 单角色迭代版。
- `billing-platform-v2/`：v2 双角色快照，保留代理 / 网吧主 / 关联审批模型。
- `billing-platform-v1/`：更早期完整快照。
