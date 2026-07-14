// ===========================================================================
// 网吧管理（v3 代理单角色版）
// 代理直接录入网吧、查看平台审核状态、执行铺设上线、删除门店。
// ===========================================================================
import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Table, Button, Card, Tag, Space, Row, Col, Empty, Alert, Badge, List,
  Modal, Input, InputNumber, Typography, message, Descriptions, Statistic, Progress,
  Tooltip, Form, Select, DatePicker,
} from 'antd';
import {
  PlusOutlined, ShopOutlined, DeleteOutlined, ExclamationCircleFilled,
  DesktopOutlined, RiseOutlined, ThunderboltOutlined, WarningFilled,
  HourglassOutlined, CheckCircleOutlined, CloseCircleOutlined,
  BarChartOutlined, FileExcelOutlined,
} from '@ant-design/icons';
import {
  getCafesByAgent,
  getPendingLaunchCafesForAgent,
  getAgentDailyRevenueRecords,
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
  const [revenueQueryOpen, setRevenueQueryOpen] = useState(false);
  const [selectedCafeIds, setSelectedCafeIds] = useState<string[]>([]);
  // 历史流水时间范围（与 mock 业务时点对齐：默认近 30 天，锚点 2026-06-08）
  const MOCK_TODAY = dayjs('2026-06-08');
  const [revenueDateRange, setRevenueDateRange] = useState<[Dayjs, Dayjs]>(
    [MOCK_TODAY.subtract(29, 'day'), MOCK_TODAY],
  );
  const [deleteModal, setDeleteModal] = useState<MyCafe | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const cafes = getCafesByAgent(CURRENT_AGENT_ID);
  const summary = useMemo(() => summarizeCafes(cafes), [cafes, tick]);
  const monthlyActiveRate = summary.terminalCount > 0
    ? (summary.monthlyActiveTerminal / summary.terminalCount) * 100 : 0;
  const pendingLaunchCafes = getPendingLaunchCafesForAgent(CURRENT_AGENT_ID);
  // 已上线网吧（用于历史流水查询的可选范围）
  const launchedCafes = useMemo(
    () => cafes.filter((c) => !!c.launchedAt && !!c.id),
    [cafes, tick],
  );
  // 历史流水查询：按筛选过滤后的记录（默认全部）
  const revenueQueryRecords = useMemo(() => {
    if (!revenueQueryOpen) return [];
    const all = getAgentDailyRevenueRecords(CURRENT_AGENT_ID, 90);
    const [from, to] = revenueDateRange;
    const fromStr = from.format('YYYY-MM-DD');
    const toStr = to.format('YYYY-MM-DD');
    const set = selectedCafeIds.length > 0 ? new Set(selectedCafeIds) : null;
    return all.filter((r) => {
      if (r.date < fromStr || r.date > toStr) return false;
      if (set && !set.has(r.cafeId)) return false;
      return true;
    });
  }, [revenueQueryOpen, selectedCafeIds, revenueDateRange, tick]);
  // 汇总统计
  const revenueQuerySummary = useMemo(() => {
    const recordCount = revenueQueryRecords.length;
    const totalRevenue = revenueQueryRecords.reduce((s, r) => s + r.revenue, 0);
    // 日均：按"涉及天数"分母（不同网吧同日只算一天）
    const days = new Set(revenueQueryRecords.map((r) => r.date)).size || 1;
    const dailyAvg = Math.round(totalRevenue / days);
    return { recordCount, totalRevenue, dailyAvg };
  }, [revenueQueryRecords]);

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
      render: (_: any, r: MyCafe) => <Tag color="gold" style={{ fontWeight: 600 }}>{r.id}</Tag>,
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
      title: '月活跃结算终端 / 比例', key: 'monthly', width: 230,
      render: (_: any, r: MyCafe) => {
        if (!r.launchedAt) {
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
        if (!r.launchedAt) return <Text type="secondary">—</Text>;
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
        const canLaunch = !r.launchedAt;
        return (
          <Space>
            <a>详情</a>
            <a onClick={() => openEdit(r)}>编辑</a>
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
        <Space>
          <Button icon={<BarChartOutlined />} onClick={() => setRevenueQueryOpen(true)}>历史流水查询</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeFormOpen(true)}>录入网吧</Button>
        </Space>
      </div>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="代理主链路：录入网吧（系统自动分配 ID） → 代理铺设霸服上线 → 数据回传展示"
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card><Statistic title={<Space><ShopOutlined /> 已录入网吧</Space>} value={summary.cafeCount} suffix="家" /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={summary.terminalScaleCount} suffix="台" /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card style={{ borderLeft: '3px solid #FAAD14' }}>
            <Statistic title={<Space><ThunderboltOutlined /> 待铺设</Space>} value={summary.pendingLaunchCount} suffix="家" valueStyle={{ color: '#FAAD14' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title={<Space><RiseOutlined /> 本月流水</Space>} value={summary.monthRevenue} prefix="¥" groupSeparator="," />
          </Card>
        </Col>
      </Row>

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
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 36 }}>
            <Space><BarChartOutlined /> <span>历史流水查询</span></Space>
            <Button
              type="primary"
              ghost
              size="small"
              icon={<FileExcelOutlined />}
              disabled={revenueQueryRecords.length === 0}
              onClick={() => {
                const scope = selectedCafeIds.length === 0
                  ? `全部 ${launchedCafes.length} 家网吧`
                  : `${selectedCafeIds.length} 家网吧`;
                const hide = message.loading(`正在导出（${scope} · ${revenueQueryRecords.length} 条记录）...`, 0);
                setTimeout(() => {
                  hide();
                  message.success(`Excel 文件已生成（Demo 演示，未实际下载）`);
                }, 1200);
              }}
            >
              导出 Excel
            </Button>
          </div>
        }
        open={revenueQueryOpen}
        onCancel={() => setRevenueQueryOpen(false)}
        footer={null}
        width={1080}
        destroyOnClose
      >
        <Space style={{ marginBottom: 12, width: '100%' }} wrap>
          <span style={{ color: 'rgba(0,0,0,0.65)' }}>网吧筛选：</span>
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="不选 = 全部网吧（支持名称 / 网吧 ID 模糊搜索）"
            style={{ minWidth: 360 }}
            value={selectedCafeIds}
            onChange={setSelectedCafeIds}
            optionFilterProp="label"
            maxTagCount="responsive"
            options={launchedCafes.map((c) => ({
              value: c.id,
              label: `${c.name}（${c.externalCafeId}）`,
            }))}
          />
          <span style={{ color: 'rgba(0,0,0,0.65)', marginLeft: 8 }}>时间范围：</span>
          <DatePicker.RangePicker
            value={revenueDateRange}
            onChange={(v) => {
              if (v && v[0] && v[1]) setRevenueDateRange([v[0], v[1]]);
            }}
            allowClear={false}
            disabledDate={(d) => d && (d.isAfter(MOCK_TODAY, 'day') || d.isBefore(MOCK_TODAY.subtract(89, 'day'), 'day'))}
            presets={[
              { label: '近 7 天', value: [MOCK_TODAY.subtract(6, 'day'), MOCK_TODAY] },
              { label: '近 14 天', value: [MOCK_TODAY.subtract(13, 'day'), MOCK_TODAY] },
              { label: '近 30 天', value: [MOCK_TODAY.subtract(29, 'day'), MOCK_TODAY] },
              { label: '近 60 天', value: [MOCK_TODAY.subtract(59, 'day'), MOCK_TODAY] },
              { label: '近 90 天', value: [MOCK_TODAY.subtract(89, 'day'), MOCK_TODAY] },
            ]}
          />
          {(selectedCafeIds.length > 0 || !revenueDateRange[1].isSame(MOCK_TODAY, 'day') || !revenueDateRange[0].isSame(MOCK_TODAY.subtract(29, 'day'), 'day')) && (
            <Button size="small" onClick={() => {
              setSelectedCafeIds([]);
              setRevenueDateRange([MOCK_TODAY.subtract(29, 'day'), MOCK_TODAY]);
            }}>重置筛选</Button>
          )}
        </Space>

        {launchedCafes.length === 0 ? (
          <Empty description="暂无已上线网吧，无法查询流水" />
        ) : (
          <>
            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="累计流水" value={revenueQuerySummary.totalRevenue} prefix="¥" groupSeparator="," />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="日均流水" value={revenueQuerySummary.dailyAvg} prefix="¥" groupSeparator="," />
                </Card>
              </Col>
            </Row>

            <Table
              rowKey={(r) => `${r.cafeId}-${r.date}`}
              size="small"
              pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: ['15', '30', '60'] }}
              dataSource={revenueQueryRecords}
              scroll={{ x: 900 }}
              columns={[
                { title: '日期', dataIndex: 'date', width: 110, fixed: 'left' as const,
                  render: (v: string) => {
                    const dow = new Date(v).getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    return <span style={{ color: isWeekend ? '#FF4D4F' : undefined }}>{v}{isWeekend && <Tag color="red" style={{ marginLeft: 6 }}>周末</Tag>}</span>;
                  },
                },
                { title: '网吧', key: 'cafe', width: 280,
                  render: (_: any, r) => (
                    <Space direction="vertical" size={0}>
                      <Space size={6}>
                        <Tag color="blue">{r.externalCafeId}</Tag>
                        <Tag color="gold">{r.cafeId}</Tag>
                      </Space>
                      <span style={{ fontWeight: 500 }}>{r.cafeName}</span>
                      <Text type="secondary" style={{ fontSize: 12 }}>{r.province}·{r.city}</Text>
                    </Space>
                  ),
                },
                { title: '当日流水', dataIndex: 'revenue', width: 130, align: 'right' as const,
                  sorter: (a, b) => a.revenue - b.revenue,
                  render: (v: number) => <span className="money" style={{ fontWeight: 600 }}>¥ {v.toLocaleString()}</span>,
                },
                { title: '已活跃终端', dataIndex: 'activeTerminal', width: 110, align: 'right' as const,
                  render: (v: number) => `${v} 台`,
                },
                { title: '日活终端', dataIndex: 'dailyActiveTerminal', width: 110, align: 'right' as const,
                  render: (v: number) => `${v} 台`,
                },
              ]}
            />
          </>
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
