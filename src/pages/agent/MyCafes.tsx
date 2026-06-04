// ===========================================================================
// 我的网吧（代理 / 网吧主统一页面）
// 简化版 v2.1：合并了原 LinkCafes、Terminals 两个独立页
//
// 代理视角：
//   - 顶部 4 指标（门店 / 终端 / 月活 / 流水）
//   - 待审批：网吧主发起的解绑申请
//   - 申请汇总：自己已发起的关联申请 / 解绑申请历史
//   - 表格：我托管的网吧；操作：详情 / 发起解绑
//   - 右上角：关联新网吧（Modal 输入网吧 ID）
//
// 网吧主视角：
//   - 顶部 4 指标（门店 / 终端 / 已关联代理 / 散店）
//   - 待审批：代理发起的关联申请 + 代理发起的解绑申请
//   - 表格：我的全部门店；操作：详情 / 发起解绑 / 删除门店（强提醒）
//   - 右上角：录入网吧
// ===========================================================================
import { useMemo, useState } from 'react';
import {
  Table, Button, Card, Tag, Space, Row, Col, Empty, Alert, Badge, List,
  Modal, Input, Typography, message, Descriptions, Statistic, Progress,
  Tooltip, Tabs,
} from 'antd';
import {
  PlusOutlined, ShopOutlined, LinkOutlined, CheckOutlined, CloseOutlined,
  DisconnectOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleFilled,
  DesktopOutlined, RiseOutlined, ThunderboltOutlined, WarningFilled,
  HourglassOutlined,
} from '@ant-design/icons';
import {
  getCafesByOwner, getCafesByAgent,
  getLinkRequestsForOwner, approveLinkRequest, rejectLinkRequest,
  getLinkRequestsByAgent,
  getUnlinkRequestsForOwner, getUnlinkRequestsForAgent,
  getUnlinkRequestsInitiatedBy, getPendingUnlinkForCafe,
  approveUnlinkRequest, rejectUnlinkRequest,
  requestLinkCafe, requestUnlinkCafe,
  findApprovedCafeById, deleteCafe, summarizeCafes,
  getPendingLaunchCafesForAgent, setCafeLaunched,
  currentRole, CURRENT_AGENT_ID, CURRENT_OWNER_ID, agentProfile,
  type MyCafe,
} from '../../mock/data';
import CafeFormModal from '../../components/CafeFormModal';

const { Text, Paragraph } = Typography;

export default function MyCafes() {
  const isAgent = currentRole === 'agent';
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  // ====== 通用：录入门店弹窗（仅网吧主） ======
  const [cafeFormOpen, setCafeFormOpen] = useState(false);

  // ====== 关联申请弹窗（仅代理：通过网吧 ID 发起申请）======
  const [linkModal, setLinkModal] = useState(false);
  const [linkSearchId, setLinkSearchId] = useState('');
  const [linkHit, setLinkHit] = useState<MyCafe | undefined | null>(null);
  const [linkReason, setLinkReason] = useState('本人在所在区域运营多家加盟网吧，希望与贵店达成合作。');

  const onSearchCafe = () => {
    const id = linkSearchId.trim();
    if (!id) { message.warning('请输入网吧 ID'); return; }
    setLinkHit(findApprovedCafeById(id));
  };
  const onSubmitLink = () => {
    if (!linkHit) return;
    const result = requestLinkCafe({
      agentId: CURRENT_AGENT_ID,
      agentName: '李**',
      agentProvince: agentProfile.province,
      cafeId: linkHit.id,
      reason: linkReason.trim() || '希望建立加盟合作关系',
    });
    if (result.ok) {
      message.success(`关联申请已提交：${result.request.id}，等待网吧主审批`);
      setLinkModal(false); setLinkSearchId(''); setLinkHit(null); refresh();
    } else {
      const msg: Record<string, string> = {
        cafe_not_found: '网吧 ID 不存在',
        cafe_not_approved: '该网吧尚未通过平台审核，暂不能关联',
        already_linked_self: '该网吧已经归属于你，无需重复申请',
        already_linked_other: '该网吧已被其他代理关联',
        duplicate_pending: '你已对该网吧提交过申请，等待审批中',
      };
      message.error(msg[result.reason] || '提交失败');
    }
  };

  // ====== 通用：审批弹窗（关联 / 解绑） ======
  type DecideTarget = { kind: 'link' | 'unlink'; type: 'approve' | 'reject'; reqId: string };
  const [decideModal, setDecideModal] = useState<DecideTarget | null>(null);
  const [decideRemark, setDecideRemark] = useState('');
  const openDecide = (t: DecideTarget) => { setDecideRemark(''); setDecideModal(t); };
  const submitDecide = () => {
    if (!decideModal) return;
    if (decideModal.type === 'reject' && !decideRemark.trim()) {
      message.warning('驳回需填写原因'); return;
    }
    const ok = decideModal.kind === 'link'
      ? (decideModal.type === 'approve'
        ? approveLinkRequest(decideModal.reqId, decideRemark || '审批通过')
        : rejectLinkRequest(decideModal.reqId, decideRemark))
      : (decideModal.type === 'approve'
        ? approveUnlinkRequest(decideModal.reqId, decideRemark || '同意解绑')
        : rejectUnlinkRequest(decideModal.reqId, decideRemark));
    if (ok) {
      message.success(decideModal.type === 'approve' ? '已通过该申请' : '已驳回该申请');
      setDecideModal(null);
      refresh();
    } else {
      message.error('操作失败：申请已被处理');
    }
  };

  // ====== 通用：发起解绑弹窗 ======
  const [unlinkModal, setUnlinkModal] = useState<{ cafeId: string; cafeName: string } | null>(null);
  const [unlinkReason, setUnlinkReason] = useState('');
  const onSubmitUnlink = () => {
    if (!unlinkModal) return;
    if (!unlinkReason.trim()) {
      message.warning('请填写解绑原因，便于对方审批'); return;
    }
    const result = requestUnlinkCafe({
      cafeId: unlinkModal.cafeId,
      initiator: isAgent ? 'agent' : 'owner',
      myId: isAgent ? CURRENT_AGENT_ID : CURRENT_OWNER_ID,
      reason: unlinkReason.trim(),
    });
    if (result.ok) {
      message.success(`解绑申请已提交，待${isAgent ? '网吧主' : '代理'}审批`);
      setUnlinkModal(null); setUnlinkReason(''); refresh();
    } else {
      const msg: Record<string, string> = {
        cafe_not_found: '网吧不存在',
        not_linked: '该网吧当前无代理关联',
        not_yours: '你无权对该网吧发起解绑',
        duplicate_pending: '该网吧已有正在处理的解绑申请',
      };
      message.error(msg[result.reason] || '提交失败');
    }
  };

  // ====== 网吧主：删除门店（强提醒） ======
  const [deleteModal, setDeleteModal] = useState<MyCafe | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const onSubmitDelete = () => {
    if (!deleteModal) return;
    if (deleteConfirmText !== deleteModal.name) {
      message.error('请完整输入门店名称以确认删除'); return;
    }
    const r = deleteCafe(deleteModal.id, CURRENT_OWNER_ID);
    if (r.ok) {
      message.success(`已删除门店「${deleteModal.name}」`);
      setDeleteModal(null); setDeleteConfirmText(''); refresh();
    } else {
      message.error('删除失败');
    }
  };

  // ===========================================================================
  // 代理视角
  // ===========================================================================
  if (isAgent) {
    const cafes = getCafesByAgent(CURRENT_AGENT_ID);
    const summary = summarizeCafes(cafes);
    const monthlyActiveRate = summary.terminalCount > 0
      ? (summary.monthlyActiveTerminal / summary.terminalCount) * 100 : 0;

    // 待我审批：网吧主发起的解绑申请
    const pendingUnlinks = getUnlinkRequestsForAgent(CURRENT_AGENT_ID);
    // 我发起的关联申请历史
    const myLinkReqs = getLinkRequestsByAgent(CURRENT_AGENT_ID);
    const myLinkPending = myLinkReqs.filter((r) => r.status === 'pending');
    // 我发起的解绑申请历史
    const myUnlinkReqs = getUnlinkRequestsInitiatedBy('agent', CURRENT_AGENT_ID);
    // 待铺设网吧 TODO（关联通过但还未上线）
    const pendingLaunchCafes = getPendingLaunchCafesForAgent(CURRENT_AGENT_ID);

    const columns = [
      { title: '网吧 ID', dataIndex: 'id', width: 100, render: (v: string) => <Tag color="gold">{v}</Tag> },
      {
        title: '网吧名称', dataIndex: 'name', width: 200,
        render: (v: string, r: MyCafe) => (
          <Space direction="vertical" size={0}>
            <a>{v}</a>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.province}·{r.city}</Text>
          </Space>
        ),
      },
      {
        title: '终端规模', key: 'terminal', width: 120, align: 'right' as const,
        render: (_: any, r: MyCafe) => r.launchedAt
          ? <span>{r.terminalCount} 台</span>
          : <Tag color="orange">⏳ 待铺设</Tag>,
      },
      {
        title: '月活终端 / 月活率', key: 'monthly', width: 200,
        render: (_: any, r: MyCafe) => {
          if (!r.launchedAt) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
          const rate = r.terminalCount > 0 ? (r.monthlyActiveTerminal / r.terminalCount) * 100 : 0;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Progress percent={Math.round(rate)} size="small" showInfo={false}
                strokeColor={rate >= 90 ? '#52C41A' : rate >= 70 ? '#FAAD14' : '#FF4D4F'}
                style={{ flex: 1, marginBottom: 0 }} />
              <span style={{ minWidth: 90, textAlign: 'right', fontSize: 12 }}>
                <b>{r.monthlyActiveTerminal}</b>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}> · {rate.toFixed(0)}%</span>
              </span>
            </div>
          );
        },
      },
      {
        title: '本月流水', key: 'rev', width: 130, align: 'right' as const,
        render: (_: any, r: MyCafe) => r.launchedAt
          ? <span className="money">¥ {r.monthRevenue.toLocaleString()}</span>
          : <Text type="secondary">—</Text>,
      },
      {
        title: '上线时间', key: 'launched', width: 120,
        render: (_: any, r: MyCafe) => r.launchedAt
          ? <Text>{r.launchedAt}</Text>
          : <Tag color="orange">待铺设</Tag>,
      },
      {
        title: '操作', width: 180, fixed: 'right' as const,
        render: (_: any, r: MyCafe) => {
          const pending = getPendingUnlinkForCafe(r.id);
          return (
            <Space>
              <a>详情</a>
              {!r.launchedAt && (
                <a style={{ color: '#FAAD14' }} onClick={() => {
                  if (setCafeLaunched(r.id)) { message.success(`「${r.name}」霸服已上线`); refresh(); }
                }}>
                  <ThunderboltOutlined /> 模拟铺设
                </a>
              )}
              {pending ? (
                <Tooltip title={pending.initiator === 'agent' ? '你已发起解绑，待网吧主审批' : '网吧主已发起解绑，待你审批'}>
                  <span style={{ color: 'rgba(0,0,0,0.35)' }}>
                    <HourglassOutlined /> 解绑中
                  </span>
                </Tooltip>
              ) : (
                <a style={{ color: '#FF6B6B' }} onClick={() => { setUnlinkReason(''); setUnlinkModal({ cafeId: r.id, cafeName: r.name }); }}>
                  <DisconnectOutlined /> 发起解绑
                </a>
              )}
            </Space>
          );
        },
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>我托管的网吧</h2>
          <Button type="primary" icon={<LinkOutlined />} onClick={() => { setLinkSearchId(''); setLinkHit(null); setLinkModal(true); }}>
            关联新网吧
          </Button>
        </div>

        {/* 4 指标 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic title={<Space><ShopOutlined /> 托管网吧</Space>} value={summary.cafeCount} suffix="家" />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={summary.terminalCount} suffix="台" />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title={<Space><ThunderboltOutlined /> 月活终端</Space>}
                value={summary.monthlyActiveTerminal}
                suffix={<span style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)' }}> · {monthlyActiveRate.toFixed(1)}%</span>}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title={<Space><RiseOutlined /> 本月流水</Space>}
                value={summary.monthRevenue}
                prefix="¥"
                groupSeparator=","
              />
            </Card>
          </Col>
        </Row>

        {/* 待铺设网吧 TODO 清单 */}
        {pendingLaunchCafes.length > 0 && (
          <Card
            style={{ marginBottom: 16, borderLeft: '3px solid #FAAD14' }}
            title={<Space><Badge count={pendingLaunchCafes.length} style={{ backgroundColor: '#FAAD14' }} /><span style={{ fontSize: 16, fontWeight: 600 }}>⏳ 待铺设网吧（请尽快线下铺设霸服系统）</span></Space>}
          >
            <List
              dataSource={pendingLaunchCafes}
              renderItem={(c) => (
                <List.Item
                  actions={[
                    <Button key="launch" type="primary" icon={<ThunderboltOutlined />} onClick={() => {
                      if (setCafeLaunched(c.id)) { message.success(`「${c.name}」霸服已上线`); refresh(); }
                    }}>
                      模拟铺设上线
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Tag color="gold">{c.id}</Tag>
                        <span>{c.name}</span>
                        <Text type="secondary">· {c.province}·{c.city}</Text>
                      </Space>
                    }
                    description={
                      <Space wrap split="·" size={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>申报终端 {c.declaredTerminalCount} 台</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>联系人：{c.contact} {c.phone}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>地址：{c.address}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* 待我审批：网吧主发起的解绑申请 */}
        {pendingUnlinks.length > 0 && (
          <Card
            style={{ marginBottom: 16, borderLeft: '3px solid #FAAD14' }}
            title={<Space><Badge count={pendingUnlinks.length} /><span style={{ fontSize: 16, fontWeight: 600 }}>待我审批的解绑申请</span></Space>}
          >
            <List
              dataSource={pendingUnlinks}
              renderItem={(r) => (
                <List.Item
                  actions={[
                    <Button key="ok" type="primary" icon={<CheckOutlined />} onClick={() => openDecide({ kind: 'unlink', type: 'approve', reqId: r.id })}>同意解绑</Button>,
                    <Button key="no" danger icon={<CloseOutlined />} onClick={() => openDecide({ kind: 'unlink', type: 'reject', reqId: r.id })}>驳回</Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Tag color="gold">网吧主发起</Tag>
                        <Tag color="orange">{r.cafeId}</Tag>
                        <span>{r.cafeName}</span>
                        <Text type="secondary">希望解除与你的关联</Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ margin: '4px 0' }}>原因：{r.reason}</Paragraph>
                        <Text type="secondary" style={{ fontSize: 12 }}>提交时间：{r.createdAt}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* 我发起的关联申请·横幅 */}
        {myLinkPending.length > 0 && (
          <Alert
            type="info" showIcon style={{ marginBottom: 16 }}
            message={`你发起的 ${myLinkPending.length} 条关联申请正在等待网吧主审批`}
            description={
              <Space wrap split="·">
                {myLinkPending.slice(0, 3).map((r) => (
                  <span key={r.id}>
                    <Tag color="gold" style={{ marginRight: 4 }}>{r.cafeId}</Tag>{r.cafeName}
                  </span>
                ))}
              </Space>
            }
          />
        )}

        {/* 表格 */}
        <Card>
          {cafes.length === 0 ? (
            <Empty image={<ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />}
              description="暂无已托管网吧。点击右上角「关联新网吧」发起申请">
              <Button type="primary" icon={<LinkOutlined />} onClick={() => setLinkModal(true)}>关联新网吧</Button>
            </Empty>
          ) : (
            <Table rowKey="id" columns={columns} dataSource={cafes} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} />
          )}
        </Card>

        {/* 我的申请记录（小折叠） */}
        {(myLinkReqs.length > 0 || myUnlinkReqs.length > 0) && (
          <Card style={{ marginTop: 16 }} title="我发起的申请记录">
            <Tabs
              items={[
                {
                  key: 'link', label: `关联申请（${myLinkReqs.length}）`,
                  children: myLinkReqs.length === 0 ? <Empty /> : (
                    <Table rowKey="id" pagination={{ pageSize: 5 }} size="small"
                      dataSource={myLinkReqs}
                      columns={[
                        { title: '编号', dataIndex: 'id', width: 100 },
                        { title: '目标网吧', key: 'cafe', render: (_: any, r: any) => <Space><Tag color="gold">{r.cafeId}</Tag>{r.cafeName}</Space> },
                        { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => v === 'pending' ? <Tag color="processing">待审批</Tag> : v === 'approved' ? <Tag color="success">已通过</Tag> : <Tag color="error">已驳回</Tag> },
                        { title: '提交时间', dataIndex: 'createdAt', width: 130 },
                        { title: '审批备注', key: 'remark', render: (_: any, r: any) => r.decideRemark || r.reason },
                      ]}
                    />
                  ),
                },
                {
                  key: 'unlink', label: `解绑申请（${myUnlinkReqs.length}）`,
                  children: myUnlinkReqs.length === 0 ? <Empty /> : (
                    <Table rowKey="id" pagination={{ pageSize: 5 }} size="small"
                      dataSource={myUnlinkReqs}
                      columns={[
                        { title: '编号', dataIndex: 'id', width: 100 },
                        { title: '目标网吧', key: 'cafe', render: (_: any, r: any) => <Space><Tag color="orange">{r.cafeId}</Tag>{r.cafeName}</Space> },
                        { title: '状态', dataIndex: 'status', width: 100, render: (v: string) => v === 'pending' ? <Tag color="processing">待审批</Tag> : v === 'approved' ? <Tag color="success">已解绑</Tag> : <Tag color="error">已驳回</Tag> },
                        { title: '提交时间', dataIndex: 'createdAt', width: 130 },
                        { title: '审批备注', key: 'remark', render: (_: any, r: any) => r.decideRemark || r.reason },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        )}

        {/* 关联新网吧弹窗 */}
        <Modal
          title="关联新网吧"
          open={linkModal}
          onCancel={() => { setLinkModal(false); setLinkHit(null); }}
          footer={null}
          width={640}
        >
          <Alert type="info" showIcon style={{ marginBottom: 12 }}
            message="输入网吧主分享的「网吧 ID」(MCxxxx) 全平台精确查询"
            description="只能查询到已通过平台审核的网吧；未审核 / 已驳回的网吧 ID 不会出现在搜索结果中。"
          />
          <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
            <Input placeholder="请输入网吧 ID（如 MC0002）" value={linkSearchId}
              onChange={(e) => setLinkSearchId(e.target.value)} onPressEnter={onSearchCafe} prefix={<SearchOutlined />} />
            <Button type="primary" onClick={onSearchCafe}>查找</Button>
          </Space.Compact>
          {linkHit === null ? (
            <Empty description="输入网吧 ID 查找后显示对应信息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : linkHit === undefined ? (
            <Alert type="error" showIcon message="未找到该网吧 ID，请向网吧主确认" />
          ) : (
            <>
              <Descriptions column={2} bordered size="small" style={{ marginBottom: 12 }}>
                <Descriptions.Item label="网吧 ID">{linkHit.id}</Descriptions.Item>
                <Descriptions.Item label="网吧名称">{linkHit.name}</Descriptions.Item>
                <Descriptions.Item label="所在地区">{linkHit.province}·{linkHit.city}</Descriptions.Item>
                <Descriptions.Item label="终端数">{linkHit.terminalCount} 台</Descriptions.Item>
                <Descriptions.Item label="当前归属" span={2}>
                  {linkHit.agentId
                    ? <Space><Tag color="purple">{linkHit.agentId}</Tag>{linkHit.agentName}</Space>
                    : <Tag color="blue">散店 · 无代理</Tag>}
                </Descriptions.Item>
              </Descriptions>
              {linkHit.agentId === CURRENT_AGENT_ID ? (
                <Alert type="success" showIcon message="该网吧已归属于你，无需再次申请" />
              ) : linkHit.agentId ? (
                <Alert type="warning" showIcon message="该网吧已被其它代理关联，无法发起申请" />
              ) : (
                <>
                  <div style={{ marginBottom: 6, fontWeight: 600 }}>申请理由</div>
                  <Input.TextArea rows={3} value={linkReason} onChange={(e) => setLinkReason(e.target.value)}
                    maxLength={200} showCount placeholder="简要介绍合作诉求" />
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <Button type="primary" onClick={onSubmitLink}>提交关联申请</Button>
                  </div>
                </>
              )}
            </>
          )}
        </Modal>

        {/* 发起解绑弹窗 */}
        <Modal
          title="发起解绑申请"
          open={!!unlinkModal}
          onCancel={() => setUnlinkModal(null)}
          onOk={onSubmitUnlink}
          okText="提交申请"
          okButtonProps={{ danger: true }}
        >
          <Alert type="warning" showIcon style={{ marginBottom: 12 }}
            message={`解绑需要网吧主审批后生效`}
            description={`提交后，「${unlinkModal?.cafeName}」会进入「解绑中」状态，期间无法再次发起其它解绑申请。`}
          />
          <div style={{ marginBottom: 6, fontWeight: 600 }}>解绑原因 *</div>
          <Input.TextArea rows={3} value={unlinkReason} onChange={(e) => setUnlinkReason(e.target.value)}
            placeholder="请说明解绑原因，便于网吧主审批" maxLength={200} showCount />
        </Modal>

        {/* 审批弹窗（解绑） */}
        <Modal
          title={decideModal?.type === 'approve' ? '同意解绑申请' : '驳回解绑申请'}
          open={!!decideModal}
          onOk={submitDecide}
          onCancel={() => setDecideModal(null)}
          okText={decideModal?.type === 'approve' ? '确认通过' : '确认驳回'}
          okButtonProps={{ danger: decideModal?.type === 'reject' }}
        >
          <Alert type={decideModal?.type === 'approve' ? 'success' : 'warning'} showIcon style={{ marginBottom: 12 }}
            message={decideModal?.type === 'approve' ? '通过后，关联关系即刻解除' : '请填写驳回原因'} />
          <Input.TextArea rows={3} placeholder={decideModal?.type === 'approve' ? '可选：备注' : '驳回原因（必填）'}
            value={decideRemark} onChange={(e) => setDecideRemark(e.target.value)} />
        </Modal>
      </div>
    );
  }

  // ===========================================================================
  // 网吧主视角
  // ===========================================================================
  const cafes = getCafesByOwner(CURRENT_OWNER_ID);
  const summary = useMemo(() => summarizeCafes(cafes), [cafes]);
  const pendingLinks = getLinkRequestsForOwner(CURRENT_OWNER_ID);
  const pendingUnlinks = getUnlinkRequestsForOwner(CURRENT_OWNER_ID);
  const myUnlinkReqs = getUnlinkRequestsInitiatedBy('owner', CURRENT_OWNER_ID);

  const columns = [
    {
      title: '网吧 ID', key: 'id', width: 130,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus === 'pending') {
          return <Tooltip title="平台审核通过后分配正式 ID"><Tag color="default">{r.tempId}（待审核）</Tag></Tooltip>;
        }
        if (r.platformAuditStatus === 'rejected') {
          return <Tooltip title={r.platformAuditRemark}><Tag color="error">已驳回</Tag></Tooltip>;
        }
        return <Tag color="gold" style={{ fontWeight: 600 }}>{r.id}</Tag>;
      },
    },
    {
      title: '网吧名称', dataIndex: 'name', width: 200,
      render: (v: string, r: MyCafe) => (
        <Space direction="vertical" size={0}>
          <a>{v}</a>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.province}·{r.city}</Text>
        </Space>
      ),
    },
    {
      title: '终端规模', key: 'terminal', width: 120, align: 'right' as const,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus !== 'approved') return <Text type="secondary">—</Text>;
        if (!r.launchedAt) return <Tag color="orange">⏳ 待铺设</Tag>;
        return <span>{r.terminalCount} 台</span>;
      },
    },
    {
      title: '月活 / 月活率', key: 'monthly', width: 200,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus !== 'approved' || !r.launchedAt) {
          return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        }
        const rate = r.terminalCount > 0 ? (r.monthlyActiveTerminal / r.terminalCount) * 100 : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={Math.round(rate)} size="small" showInfo={false}
              strokeColor={rate >= 90 ? '#52C41A' : rate >= 70 ? '#FAAD14' : '#FF4D4F'}
              style={{ flex: 1, marginBottom: 0 }} />
            <span style={{ minWidth: 80, textAlign: 'right', fontSize: 12 }}>
              <b>{r.monthlyActiveTerminal}</b>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}> · {rate.toFixed(0)}%</span>
            </span>
          </div>
        );
      },
    },
    {
      title: '本月流水', dataIndex: 'monthRevenue', width: 130, align: 'right' as const,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus !== 'approved' || !r.launchedAt) return <Text type="secondary">—</Text>;
        return <span className="money">¥ {r.monthRevenue.toLocaleString()}</span>;
      },
    },
    {
      title: '归属代理', key: 'agent', width: 170,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus !== 'approved') return <Text type="secondary">—</Text>;
        return r.agentId
          ? <Space size={4}><Tag color="purple">{r.agentId}</Tag><Text>{r.agentName}</Text></Space>
          : <Tag color="blue">散店 · 无代理</Tag>;
      },
    },
    {
      title: '状态', key: 'status', width: 110,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus === 'pending') return <Tag color="processing">平台审核中</Tag>;
        if (r.platformAuditStatus === 'rejected') return <Tag color="error">已驳回</Tag>;
        if (!r.launchedAt) return <Tag color="orange">待铺设</Tag>;
        return <Tag color="success">已上线</Tag>;
      },
    },
    {
      title: '操作', width: 200, fixed: 'right' as const,
      render: (_: any, r: MyCafe) => {
        const pending = r.id ? getPendingUnlinkForCafe(r.id) : undefined;
        const isApproved = r.platformAuditStatus === 'approved';
        return (
          <Space>
            <a>详情</a>
            {isApproved && r.agentId && (
              pending ? (
                <Tooltip title={pending.initiator === 'owner' ? '你已发起解绑，待代理审批' : '代理已发起解绑，待你审批'}>
                  <span style={{ color: 'rgba(0,0,0,0.35)' }}>
                    <HourglassOutlined /> 解绑中
                  </span>
                </Tooltip>
              ) : (
                <a style={{ color: '#FF6B6B' }} onClick={() => { setUnlinkReason(''); setUnlinkModal({ cafeId: r.id, cafeName: r.name }); }}>
                  <DisconnectOutlined /> 发起解绑
                </a>
              )
            )}
            <a style={{ color: '#FF4D4F' }} onClick={() => { setDeleteConfirmText(''); setDeleteModal(r); }}>
              <DeleteOutlined /> 删除
            </a>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>我的网吧</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeFormOpen(true)}>录入网吧</Button>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="录入流程：提交 → 平台审核 → 分配网吧 ID → 分享给代理发起关联 → 代理铺设霸服上线"
        description="录入后由迪越/应用宝手助审核团队人工审核分配 ID（一般 1 个工作日）。审核通过后才能被代理关联；关联通过后由代理线下铺设霸服系统，铺设完成才会显示终端 / 流水数据。"
      />

      {/* 4 指标 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card><Statistic title={<Space><ShopOutlined /> 已录入门店</Space>} value={summary.cafeCount} suffix="家" /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={summary.terminalCount} suffix="台" /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderLeft: '3px solid #722ED1' }}>
            <Statistic title="已关联代理" value={summary.linkedAgentCafeCount} suffix="家"
              valueStyle={{ color: '#722ED1' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderLeft: '3px solid #1890FF' }}>
            <Statistic title="散店" value={summary.standaloneCafeCount} suffix="家"
              valueStyle={{ color: '#1890FF' }} />
          </Card>
        </Col>
      </Row>

      {/* 待审批：关联申请 */}
      {pendingLinks.length > 0 && (
        <Card
          style={{ marginBottom: 16, borderLeft: '3px solid #FF2E3E' }}
          title={<Space><Badge count={pendingLinks.length} /><span style={{ fontSize: 16, fontWeight: 600 }}>待审批的代理关联申请</span></Space>}
        >
          <List
            dataSource={pendingLinks}
            renderItem={(r) => (
              <List.Item
                actions={[
                  <Button key="ok" type="primary" icon={<CheckOutlined />} onClick={() => openDecide({ kind: 'link', type: 'approve', reqId: r.id })}>通过</Button>,
                  <Button key="no" danger icon={<CloseOutlined />} onClick={() => openDecide({ kind: 'link', type: 'reject', reqId: r.id })}>驳回</Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Tag color="purple">{r.agentId}</Tag>
                      <span>{r.agentName}（{r.agentProvince}）</span>
                      <Text type="secondary">申请关联</Text>
                      <Tag color="gold">{r.cafeId}</Tag>
                      <span>{r.cafeName}</span>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph style={{ margin: '4px 0' }}>申请理由：{r.reason}</Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>提交时间：{r.createdAt}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 待审批：代理发起的解绑申请 */}
      {pendingUnlinks.length > 0 && (
        <Card
          style={{ marginBottom: 16, borderLeft: '3px solid #FAAD14' }}
          title={<Space><Badge count={pendingUnlinks.length} /><span style={{ fontSize: 16, fontWeight: 600 }}>待审批的代理解绑申请</span></Space>}
        >
          <List
            dataSource={pendingUnlinks}
            renderItem={(r) => (
              <List.Item
                actions={[
                  <Button key="ok" type="primary" icon={<CheckOutlined />} onClick={() => openDecide({ kind: 'unlink', type: 'approve', reqId: r.id })}>同意解绑</Button>,
                  <Button key="no" danger icon={<CloseOutlined />} onClick={() => openDecide({ kind: 'unlink', type: 'reject', reqId: r.id })}>驳回</Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Tag color="purple">{r.agentId}</Tag>
                      <span>{r.agentName}</span>
                      <Text type="secondary">希望解除与</Text>
                      <Tag color="gold">{r.cafeId}</Tag>
                      <span>{r.cafeName}</span>
                      <Text type="secondary">的关联</Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Paragraph style={{ margin: '4px 0' }}>原因：{r.reason}</Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>提交时间：{r.createdAt}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 我发起的解绑申请·横幅 */}
      {myUnlinkReqs.filter((r) => r.status === 'pending').length > 0 && (
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          message={`你发起的 ${myUnlinkReqs.filter((r) => r.status === 'pending').length} 条解绑申请正在等待代理审批`}
        />
      )}

      <Card>
        {cafes.length === 0 ? (
          <Empty image={<ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />} description="还没有录入网吧">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeFormOpen(true)}>录入网吧</Button>
          </Empty>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={cafes} scroll={{ x: 1300 }} pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <CafeFormModal open={cafeFormOpen} onClose={() => setCafeFormOpen(false)} onSuccess={refresh} />

      {/* 审批弹窗（关联 / 解绑统一） */}
      <Modal
        title={
          decideModal?.kind === 'link'
            ? (decideModal.type === 'approve' ? '通过关联申请' : '驳回关联申请')
            : (decideModal?.type === 'approve' ? '同意解绑申请' : '驳回解绑申请')
        }
        open={!!decideModal}
        onOk={submitDecide}
        onCancel={() => setDecideModal(null)}
        okText={decideModal?.type === 'approve' ? '确认通过' : '确认驳回'}
        okButtonProps={{ danger: decideModal?.type === 'reject' }}
      >
        {decideModal?.type === 'approve' ? (
          <Alert type="success" showIcon style={{ marginBottom: 12 }}
            message={decideModal?.kind === 'link' ? '通过后，该网吧的代理归属即刻生效（同一网吧的其它待审批申请将自动驳回）' : '通过后，关联关系即刻解除'} />
        ) : (
          <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="请填写驳回原因，便于对方收到通知" />
        )}
        <Input.TextArea rows={3} placeholder={decideModal?.type === 'approve' ? '可选：审批备注' : '驳回原因（必填）'}
          value={decideRemark} onChange={(e) => setDecideRemark(e.target.value)} />
      </Modal>

      {/* 发起解绑弹窗 */}
      <Modal
        title="发起解绑申请"
        open={!!unlinkModal}
        onCancel={() => setUnlinkModal(null)}
        onOk={onSubmitUnlink}
        okText="提交申请"
        okButtonProps={{ danger: true }}
      >
        <Alert type="warning" showIcon style={{ marginBottom: 12 }}
          message="解绑需要代理审批后生效"
          description={`提交后，「${unlinkModal?.cafeName}」会进入「解绑中」状态，期间无法再次发起其它解绑申请。`}
        />
        <div style={{ marginBottom: 6, fontWeight: 600 }}>解绑原因 *</div>
        <Input.TextArea rows={3} value={unlinkReason} onChange={(e) => setUnlinkReason(e.target.value)}
          placeholder="请说明解绑原因，便于代理审批" maxLength={200} showCount />
      </Modal>

      {/* 删除门店弹窗（强提醒） */}
      <Modal
        title={
          <Space>
            <ExclamationCircleFilled style={{ color: '#FF4D4F' }} />
            <span>删除门店「{deleteModal?.name}」？</span>
          </Space>
        }
        open={!!deleteModal}
        onCancel={() => { setDeleteModal(null); setDeleteConfirmText(''); }}
        onOk={onSubmitDelete}
        okText="我已确认，删除门店"
        okButtonProps={{ danger: true, disabled: deleteConfirmText !== deleteModal?.name }}
        cancelText="取消"
      >
        <Alert
          type="error" showIcon icon={<WarningFilled />} style={{ marginBottom: 16 }}
          message="此操作不可撤销"
          description={
            <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
              <li>门店「{deleteModal?.name}」将从你的账户中永久移除</li>
              {deleteModal?.agentId && (
                <li>当前与代理 <Tag color="purple" style={{ margin: 0 }}>{deleteModal.agentId}</Tag> {deleteModal.agentName} 的关联会一并解除</li>
              )}
              <li>该门店所有 pending 关联 / 解绑申请将自动驳回</li>
              <li>历史流水 / 终端数据无法恢复</li>
            </ul>
          }
        />
        {deleteModal && (
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
            <Descriptions.Item label="网吧 ID">{deleteModal.id}</Descriptions.Item>
            <Descriptions.Item label="终端规模">{deleteModal.terminalCount} 台</Descriptions.Item>
            <Descriptions.Item label="本月流水">¥ {deleteModal.monthRevenue.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="当前代理">
              {deleteModal.agentId
                ? <Space><Tag color="purple">{deleteModal.agentId}</Tag>{deleteModal.agentName}</Space>
                : <Tag color="blue">散店</Tag>}
            </Descriptions.Item>
          </Descriptions>
        )}
        <div style={{ marginBottom: 6, color: '#FF4D4F', fontWeight: 600 }}>
          请输入门店完整名称「{deleteModal?.name}」以确认删除：
        </div>
        <Input
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder={deleteModal?.name}
          status={deleteConfirmText && deleteConfirmText !== deleteModal?.name ? 'error' : undefined}
        />
      </Modal>
    </div>
  );
}
