import { useMemo, useState } from 'react';
import {
  Table, Button, Card, Tag, Space, Row, Col, Empty, Alert, Badge, List,
  Modal, Input, InputNumber, Typography, message, Descriptions, Statistic, Progress,
  Form,
} from 'antd';
import {
  PlusOutlined, ShopOutlined, DeleteOutlined, ExclamationCircleFilled,
  DesktopOutlined, ThunderboltOutlined, WarningFilled,
  HourglassOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import {
  getCafesByAgent,
  getPendingLaunchCafesForAgent,
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
  const [detailModal, setDetailModal] = useState<MyCafe | null>(null);
  const [editModal, setEditModal] = useState<MyCafe | null>(null);
  const [editForm] = Form.useForm();
  const [deleteModal, setDeleteModal] = useState<MyCafe | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const cafes = getCafesByAgent(CURRENT_AGENT_ID);
  const summary = useMemo(() => summarizeCafes(cafes), [cafes, tick]);
  const pendingLaunchCafes = getPendingLaunchCafesForAgent(CURRENT_AGENT_ID);

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
      title: '网吧ID / 无盘账号', dataIndex: 'externalCafeId', width: 170,
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
      title: '月活跃终端 / 比例', key: 'monthly', width: 210,
      render: (_: any, r: MyCafe) => {
        if (!r.launchedAt) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
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
            <a onClick={() => setDetailModal(r)}>详情</a>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCafeFormOpen(true)}>录入网吧</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <Card><Statistic title={<Space><ShopOutlined /> 已录入网吧</Space>} value={summary.cafeCount} suffix="家" /></Card>
        </Col>
        <Col xs={12} md={8}>
          <Card><Statistic title={<Space><DesktopOutlined /> 终端规模</Space>} value={summary.terminalScaleCount} suffix="台" /></Card>
        </Col>
        <Col xs={12} md={8}>
          <Card style={{ borderLeft: '3px solid #FAAD14' }}>
            <Statistic title={<Space><ThunderboltOutlined /> 待铺设</Space>} value={summary.pendingLaunchCount} suffix="家" valueStyle={{ color: '#FAAD14' }} />
          </Card>
        </Col>
      </Row>

      {pendingLaunchCafes.length > 0 && (
        <Card
          style={{ marginBottom: 16, borderLeft: '3px solid #FAAD14' }}
          title={<Space><Badge count={pendingLaunchCafes.length} style={{ backgroundColor: '#FAAD14' }} /><span style={{ fontSize: 16, fontWeight: 600 }}>⏳ 待铺设网吧</span></Space>}
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
          <Table rowKey={(r) => r.id || r.tempId || r.name} columns={columns} dataSource={cafes} scroll={{ x: 1200 }} pagination={{ pageSize: 10 }} />
        )}
      </Card>

      <CafeFormModal open={cafeFormOpen} onClose={() => setCafeFormOpen(false)} onSuccess={refresh} />

      <Modal
        title={detailModal ? `网吧信息：${detailModal.name}` : '网吧信息'}
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={<Button type="primary" onClick={() => setDetailModal(null)}>关闭</Button>}
        width={640}
      >
        {detailModal && (
          <>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="可使用网吧ID和无盘系统登录密码登录霸服无盘系统"
            />
            <Descriptions column={1} size="middle" bordered>
              <Descriptions.Item label="网吧ID / 无盘账号">{detailModal.externalCafeId}</Descriptions.Item>
              <Descriptions.Item label="系统 ID">{detailModal.id}</Descriptions.Item>
              <Descriptions.Item label="所在地区">{detailModal.province}·{detailModal.city}</Descriptions.Item>
              <Descriptions.Item label="详细地址">{detailModal.address}</Descriptions.Item>
              <Descriptions.Item label="终端规模">{detailModal.terminalScaleCount} 台</Descriptions.Item>
              <Descriptions.Item label="联系人">{detailModal.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detailModal.phone}</Descriptions.Item>
              <Descriptions.Item label="无盘系统登录密码">
                <Input.Password value={detailModal.cafePassword || '-'} readOnly visibilityToggle style={{ maxWidth: 260 }} />
              </Descriptions.Item>
            </Descriptions>
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
              <li>终端数据无法恢复</li>
            </ul>
          }
        />
        {deleteModal && (
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
            <Descriptions.Item label="网吧ID / 无盘账号">{deleteModal.externalCafeId}</Descriptions.Item>
            <Descriptions.Item label="系统 ID">{deleteModal.id || deleteModal.tempId}</Descriptions.Item>
            <Descriptions.Item label="当前状态">{statusTag(deleteModal)}</Descriptions.Item>
            <Descriptions.Item label="终端规模">{deleteModal.terminalScaleCount} 台</Descriptions.Item>
            <Descriptions.Item label="已活跃终端">{deleteModal.terminalCount} 台</Descriptions.Item>
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
