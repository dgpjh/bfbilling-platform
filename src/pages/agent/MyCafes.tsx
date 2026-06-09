// ===========================================================================
// 网吧管理（v3 代理单角色版）
// 代理直接录入网吧、查看平台审核状态、执行铺设上线、删除门店。
// ===========================================================================
import { useMemo, useState } from 'react';
import {
  Table, Button, Card, Tag, Space, Row, Col, Empty, Alert, Badge, List,
  Modal, Input, InputNumber, Typography, message, Descriptions, Statistic, Progress,
  Tooltip, Form,
} from 'antd';
import {
  PlusOutlined, ShopOutlined, DeleteOutlined, ExclamationCircleFilled,
  DesktopOutlined, RiseOutlined, ThunderboltOutlined, WarningFilled,
  HourglassOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import {
  getCafesByAgent,
  getPendingLaunchCafesForAgent,
  getCafeRevenueHistory,
  setCafeLaunched,
  deleteCafe,
  updateCafeInfo,
  summarizeCafes,
  CURRENT_AGENT_ID,
  type MyCafe,
} from '../../mock/data';
import CafeFormModal from '../../components/CafeFormModal';

const { Text, Paragraph } = Typography;

function statusTag(cafe: MyCafe) {
  if (cafe.platformAuditStatus === 'pending') return <Tag color="processing" icon={<HourglassOutlined />}>平台审核中</Tag>;
  if (cafe.platformAuditStatus === 'rejected') return <Tag color="error" icon={<CloseCircleOutlined />}>已驳回</Tag>;
  if (!cafe.launchedAt) return <Tag color="orange" icon={<HourglassOutlined />}>待铺设</Tag>;
  return <Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag>;
}

export default function MyCafes() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const [cafeFormOpen, setCafeFormOpen] = useState(false);
  const [editModal, setEditModal] = useState<MyCafe | null>(null);
  const [editForm] = Form.useForm();
  const [revenueModal, setRevenueModal] = useState<MyCafe | null>(null);
  const [deleteModal, setDeleteModal] = useState<MyCafe | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const cafes = getCafesByAgent(CURRENT_AGENT_ID);
  const summary = useMemo(() => summarizeCafes(cafes), [cafes, tick]);
  const monthlyActiveRate = summary.terminalCount > 0
    ? (summary.monthlyActiveTerminal / summary.terminalCount) * 100 : 0;
  const pendingLaunchCafes = getPendingLaunchCafesForAgent(CURRENT_AGENT_ID);
  const pendingAuditCafes = useMemo(
    () => cafes.filter((c) => c.platformAuditStatus === 'pending'),
    [cafes, tick],
  );

  const openEdit = (cafe: MyCafe) => {
    editForm.setFieldsValue({
      name: cafe.name,
      address: cafe.address,
      terminalScaleCount: cafe.terminalScaleCount,
      contact: cafe.contact,
      phone: cafe.phone,
    });
    setEditModal(cafe);
  };

  const onSubmitEdit = async () => {
    if (!editModal) return;
    const v = await editForm.validateFields();
    const key = editModal.id || editModal.tempId || '';
    const r = updateCafeInfo(key, CURRENT_AGENT_ID, {
      name: v.name,
      address: v.address,
      terminalScaleCount: v.terminalScaleCount,
      contact: v.contact,
      phone: v.phone,
    });
    if (r.ok) {
      message.success('网吧信息已更新');
      setEditModal(null);
      refresh();
    } else {
      message.error('更新失败');
    }
  };

  const onSubmitDelete = () => {
    if (!deleteModal) return;
    if (deleteConfirmText !== deleteModal.name) {
      message.error('请完整输入门店名称以确认删除'); return;
    }
    const key = deleteModal.id || deleteModal.tempId || '';
    const r = deleteCafe(key, CURRENT_AGENT_ID);
    if (r.ok) {
      message.success(`已删除门店「${deleteModal.name}」`);
      setDeleteModal(null); setDeleteConfirmText(''); refresh();
    } else {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '网吧 ID', dataIndex: 'externalCafeId', width: 150,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '系统 ID', key: 'id', width: 140,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus === 'pending') {
          return <Tooltip title="平台审核通过后可安排铺设"><Tag color="default">{r.tempId}（待审核）</Tag></Tooltip>;
        }
        if (r.platformAuditStatus === 'rejected') {
          return <Tooltip title={r.platformAuditRemark}><Tag color="error">{r.tempId || '已驳回'}</Tag></Tooltip>;
        }
        return <Tag color="gold" style={{ fontWeight: 600 }}>{r.id}</Tag>;
      },
    },
    {
      title: '网吧名称', dataIndex: 'name', width: 220,
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
      title: '已活跃终端', key: 'activeTerminal', width: 120, align: 'right' as const,
      render: (_: any, r: MyCafe) => r.launchedAt ? <span>{r.terminalCount} 台</span> : <Text type="secondary">—</Text>,
    },
    {
      title: '日活终端', key: 'daily', width: 120, align: 'right' as const,
      render: (_: any, r: MyCafe) => r.launchedAt ? <span>{r.dailyActiveTerminal} 台</span> : <Text type="secondary">—</Text>,
    },
    {
      title: '月活 / 月活率', key: 'monthly', width: 210,
      render: (_: any, r: MyCafe) => {
        if (r.platformAuditStatus !== 'approved' || !r.launchedAt) {
          return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
        }
        const rate = r.terminalScaleCount > 0 ? (r.monthlyActiveTerminal / r.terminalScaleCount) * 100 : 0;
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
      title: '状态', key: 'status', width: 120,
      render: (_: any, r: MyCafe) => statusTag(r),
    },
    {
      title: '联系人', key: 'contact', width: 170,
      render: (_: any, r: MyCafe) => (
        <Space direction="vertical" size={0}>
          <span>{r.contact}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text>
        </Space>
      ),
    },
    {
      title: '操作', width: 210, fixed: 'right' as const,
      render: (_: any, r: MyCafe) => {
        const canLaunch = r.platformAuditStatus === 'approved' && !r.launchedAt;
        return (
          <Space>
            <a>详情</a>
            <a onClick={() => openEdit(r)}>编辑</a>
            <a onClick={() => setRevenueModal(r)}>流水记录</a>
            {canLaunch && (
              <a style={{ color: '#FAAD14' }} onClick={() => {
                if (setCafeLaunched(r.id)) { message.success(`「${r.name}」霸服已上线`); refresh(); }
              }}>
                <ThunderboltOutlined /> 模拟铺设
              </a>
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
        <h2 style={{ margin: 0 }}>网吧管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeFormOpen(true)}>录入网吧</Button>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="代理主链路：获取网吧 ID → 录入网吧 → 平台审核 → 代理铺设霸服上线 → 数据回传展示"
        description="当前版本取消网吧主账号和网吧主分成，网吧信息、现场联系人、铺设进度均由代理维护。"
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={5}>
          <Card><Statistic title={<Space><ShopOutlined /> 已录入网吧</Space>} value={summary.cafeCount} suffix="家" /></Card>
        </Col>
        <Col xs={12} md={5}>
          <Card><Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={summary.terminalScaleCount} suffix="台" /></Card>
        </Col>
        <Col xs={12} md={4}>
          <Card style={{ borderLeft: '3px solid #1677FF' }}>
            <Statistic title={<Space><HourglassOutlined /> 待审核</Space>} value={summary.pendingAuditCount} suffix="家" valueStyle={{ color: '#1677FF' }} />
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card style={{ borderLeft: '3px solid #FAAD14' }}>
            <Statistic title={<Space><ThunderboltOutlined /> 待铺设</Space>} value={summary.pendingLaunchCount} suffix="家" valueStyle={{ color: '#FAAD14' }} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={<Space><RiseOutlined /> 本月流水</Space>} value={summary.monthRevenue} prefix="¥" groupSeparator="," />
          </Card>
        </Col>
      </Row>

      {pendingAuditCafes.length > 0 && (
        <Card
          style={{ marginBottom: 16, borderLeft: '3px solid #1677FF' }}
          title={<Space><Badge count={pendingAuditCafes.length} style={{ backgroundColor: '#1677FF' }} /><span style={{ fontSize: 16, fontWeight: 600 }}>⏳ 待审核网吧（平台审核中，一般 1 个工作日内）</span></Space>}
        >
          <List
            dataSource={pendingAuditCafes}
            renderItem={(c) => (
              <List.Item
                actions={[
                  <Tag key="status" color="processing" icon={<HourglassOutlined />}>平台审核中</Tag>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Tag color="blue">{c.externalCafeId}</Tag>
                      <Tag color="default">{c.tempId}（待审核）</Tag>
                      <span>{c.name}</span>
                      <Text type="secondary">· {c.province}·{c.city}</Text>
                    </Space>
                  }
                  description={
                    <Space wrap split="·" size={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>终端规模 {c.terminalScaleCount} 台</Text>
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
                      <Tag color="blue">{c.externalCafeId}</Tag>
                      <Tag color="gold">{c.id}</Tag>
                      <span>{c.name}</span>
                      <Text type="secondary">· {c.province}·{c.city}</Text>
                    </Space>
                  }
                  description={
                    <Space wrap split="·" size={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>终端规模 {c.terminalScaleCount} 台</Text>
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

      <Card>
        {cafes.length === 0 ? (
          <Empty image={<ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />} description="还没有录入网吧">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeFormOpen(true)}>录入网吧</Button>
          </Empty>
        ) : (
          <Table rowKey={(r) => r.id || r.tempId || r.name} columns={columns} dataSource={cafes} scroll={{ x: 1300 }} pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <CafeFormModal open={cafeFormOpen} onClose={() => setCafeFormOpen(false)} onSuccess={refresh} />

      <Modal
        title={`流水记录${revenueModal ? `：${revenueModal.name}` : ''}`}
        open={!!revenueModal}
        onCancel={() => setRevenueModal(null)}
        footer={null}
        width={760}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="可查看历史月份实际流水"
          description="仅展示已结算的实际流水记录；正式环境可按月份筛选、导出明细。"
        />
        {revenueModal && (
          <Table
            rowKey="month"
            size="small"
            pagination={false}
            dataSource={getCafeRevenueHistory(revenueModal)}
            columns={[
              { title: '月份', dataIndex: 'month', width: 100 },
              { title: '流水金额', dataIndex: 'revenue', align: 'right' as const, render: (v: number) => <span className="money">¥ {v.toLocaleString()}</span> },
              { title: '已活跃终端', dataIndex: 'activeTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
              { title: '日活终端', dataIndex: 'dailyActiveTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
              { title: '月活终端', dataIndex: 'monthlyActiveTerminal', align: 'right' as const, render: (v: number) => `${v} 台` },
              { title: '状态', dataIndex: 'status', width: 90, render: () => <Tag color="success">实际已结算</Tag> },
            ]}
          />
        )}
      </Modal>

      <Modal
        title={`编辑网吧信息${editModal ? `：${editModal.name}` : ''}`}
        open={!!editModal}
        onCancel={() => setEditModal(null)}
        onOk={onSubmitEdit}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="网吧名称" name="name" rules={[{ required: true, message: '请输入网吧名称' }]}>
            <Input placeholder="请输入网吧名称" />
          </Form.Item>
          <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item
            label="终端规模数（台）"
            name="terminalScaleCount"
            rules={[{ required: true, message: '请输入终端规模数' }]}
          >
            <InputNumber min={1} max={5000} style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="现场联系人" name="contact" rules={[{ required: true, message: '请输入联系人' }]}>
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

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
              <li>门店「{deleteModal?.name}」将从当前代理账户中永久移除</li>
              <li>平台审核中的申请会一并从列表移除</li>
              <li>历史流水 / 终端数据无法恢复</li>
            </ul>
          }
        />
        {deleteModal && (
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
            <Descriptions.Item label="网吧 ID">{deleteModal.externalCafeId}</Descriptions.Item>
            <Descriptions.Item label="系统 ID">{deleteModal.id || deleteModal.tempId}</Descriptions.Item>
            <Descriptions.Item label="当前状态">{statusTag(deleteModal)}</Descriptions.Item>
            <Descriptions.Item label="终端规模">{deleteModal.terminalScaleCount} 台</Descriptions.Item>
            <Descriptions.Item label="已活跃终端">{deleteModal.terminalCount} 台</Descriptions.Item>
            <Descriptions.Item label="本月流水">¥ {deleteModal.monthRevenue.toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
        <Paragraph style={{ color: '#FF4D4F', fontWeight: 600 }}>
          请输入门店完整名称「{deleteModal?.name}」以确认删除：
        </Paragraph>
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
