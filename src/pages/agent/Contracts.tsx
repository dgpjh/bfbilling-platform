import { useState } from 'react';
import {
  Card, Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker,
  Upload, Row, Col, Steps, Descriptions, Empty, message, Alert, Tooltip,
} from 'antd';
import {
  FileTextOutlined, UploadOutlined, PlusOutlined, EyeOutlined, DownloadOutlined,
  CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled, InfoCircleOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { myContracts, contractStatusLabel, contractTemplates, contractGate } from '../../mock/data';
import type { ContractStatus } from '../../mock/data';

const { TextArea } = Input;

export default function Contracts() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [form] = Form.useForm();

  // 顶部状态卡
  const cards = [
    {
      label: '是否可结算提现',
      value: contractGate.hasActiveContract ? '✓ 已开通' : '✗ 已锁定',
      sub: contractGate.hasActiveContract ? '存在有效合同，可正常提现' : '请先签署合同',
      color: contractGate.hasActiveContract ? '#52C41A' : '#FF2E3E',
      bg: contractGate.hasActiveContract
        ? 'linear-gradient(135deg, rgba(82,196,26,0.10), rgba(82,196,26,0.02))'
        : 'linear-gradient(135deg, rgba(255,46,62,0.12), rgba(255,46,62,0.02))',
      border: contractGate.hasActiveContract
        ? '1px solid rgba(82,196,26,0.30)'
        : '1px solid rgba(255,46,62,0.40)',
    },
    {
      label: '生效中合同',
      value: contractGate.activeCount,
      sub: '份',
      color: 'rgba(255,255,255,0.92)',
      bg: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
    },
    {
      label: '待审核',
      value: contractGate.pendingCount,
      sub: '份',
      color: '#FAAD14',
      bg: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
    },
    {
      label: '主合同到期',
      value: contractGate.primaryContract
        ? dayjs(contractGate.primaryContract.effectiveEnd).diff(dayjs(), 'day')
        : '—',
      sub: contractGate.primaryContract ? '天后' : '尚未签署',
      color: 'rgba(255,255,255,0.92)',
      bg: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
    },
  ];

  const handleSubmit = async () => {
    const v = await form.validateFields();
    console.log('提交合同：', v);
    message.success('合同已提交，待迪越法务审核');
    setCreateOpen(false);
    form.resetFields();
  };

  return (
    <div>
      {/* 关键提示条 */}
      {!contractGate.hasActiveContract && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16, background: 'rgba(255,46,62,0.08)', border: '1px solid rgba(255,46,62,0.40)' }}
          message={<span style={{ color: '#fff', fontWeight: 600 }}>结算与提现已锁定</span>}
          description={
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>
              系统检测到您当前没有生效中的合作合同。提现需要至少一份"代理合作合同"处于有效期内，请尽快录入合同。
            </span>
          }
          action={
            <Button danger type="primary" onClick={() => setCreateOpen(true)}>
              立即录入合同
            </Button>
          }
        />
      )}

      {/* 状态卡 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {cards.map((c, i) => (
          <Col span={6} key={i}>
            <div style={{ padding: 16, borderRadius: 8, background: c.bg, border: c.border }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{c.label}</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: c.color, fontFamily: 'DIN Alternate' }}>
                  {c.value}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{c.sub}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 合同流程图（教学用） */}
      <Card style={{ marginBottom: 16 }} title={<span><InfoCircleOutlined /> &nbsp;合同流程</span>}>
        <Steps
          size="small"
          current={1}
          items={[
            { title: '在线录入', description: '上传合同 PDF 与关键条款' },
            { title: '法务审核', description: '迪越法务 1~3 个工作日审核' },
            { title: '双方签署', description: '电子签 / 线下盖章' },
            { title: '生效结算', description: '生效后即可参与月度结算与提现' },
          ]}
        />
      </Card>

      {/* 合同列表 */}
      <Card
        title={<span><FileTextOutlined /> &nbsp;我的合同</span>}
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>下载模板</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              录入新合同
            </Button>
          </Space>
        }
      >
        {myContracts.length === 0 ? (
          <Empty description="尚未录入任何合同" />
        ) : (
          <Table
            rowKey="id"
            pagination={false}
            dataSource={myContracts}
            columns={[
              { title: '合同编号', dataIndex: 'id', width: 140, render: (v) => <span style={{ fontFamily: 'DIN Alternate' }}>{v}</span> },
              { title: '合同名称', dataIndex: 'name', render: (v, r: any) => (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{r.type}</div>
                </div>
              ) },
              { title: '签署日期', dataIndex: 'signedAt', width: 110 },
              { title: '有效期', key: 'period', width: 200, render: (_, r: any) => (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'DIN Alternate' }}>
                  {r.effectiveStart} ~ {r.effectiveEnd}
                </span>
              ) },
              { title: '状态', dataIndex: 'status', width: 100, render: (s: ContractStatus) => {
                const meta = contractStatusLabel[s];
                const icon = s === 'active' ? <CheckCircleFilled /> :
                             s === 'rejected' ? <CloseCircleFilled /> :
                             <ClockCircleOutlined />;
                return <Tag color={meta.color} icon={icon}>{meta.text}</Tag>;
              } },
              { title: '操作', key: 'op', width: 160, render: (_, r: any) => (
                <Space>
                  <a onClick={() => { setCurrent(r); setDetailOpen(true); }}><EyeOutlined /> 详情</a>
                  <a><DownloadOutlined /> 下载</a>
                </Space>
              ) },
            ]}
          />
        )}
      </Card>

      {/* 合同模板 */}
      <Card title={<span><FileAddOutlined /> &nbsp;合同模板（迪越官方提供）</span>} style={{ marginTop: 16 }}>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={contractTemplates}
          columns={[
            { title: '模板名称', dataIndex: 'name' },
            { title: '版本', dataIndex: 'version', width: 100, render: (v) => <Tag>{v}</Tag> },
            { title: '更新时间', dataIndex: 'updatedAt', width: 130 },
            { title: '大小', dataIndex: 'size', width: 80 },
            { title: '操作', key: 'op', width: 120, render: () => <a><DownloadOutlined /> 下载模板</a> },
          ]}
        />
      </Card>

      {/* ========== 录入合同 Modal ========== */}
      <Modal
        title="录入新合同"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleSubmit}
        okText="提交审核"
        cancelText="取消"
        width={720}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="提交后将进入迪越法务审核队列，预计 1~3 个工作日完成审核；审核通过后合同生效，方可参与月度结算与提现。"
        />
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="合同类型" name="type" rules={[{ required: true, message: '请选择合同类型' }]}>
            <Select
              placeholder="请选择"
              options={[
                { label: '代理合作合同（主合同）', value: '代理合作合同' },
                { label: '补充协议', value: '补充协议' },
                { label: '激励协议', value: '激励协议' },
                { label: '终止合作协议', value: '终止合作协议' },
              ]}
            />
          </Form.Item>
          <Form.Item label="合同名称" name="name" rules={[{ required: true, message: '请输入合同名称' }]}>
            <Input placeholder="例如：《手助网吧菜单铺设合作协议（2026 版）》" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="甲方（代理方）" name="partyA" initialValue="星辰文化传媒"
                rules={[{ required: true }]}>
                <Input placeholder="代理公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="乙方（迪越方）" name="partyB" initialValue="深圳迪越科技"
                rules={[{ required: true }]}>
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="签署日期" name="signedAt" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="合同有效期" name="period" rules={[{ required: true }]}>
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="核心金额条款" name="amountClause"
            tooltip="请填写关键的金额、单价、激励规则，便于法务和财务快速核对"
            rules={[{ required: true, message: '请填写核心条款' }]}>
            <TextArea rows={3} placeholder="例如：首装激励 ¥50/台 一次性，分 12 个月分摊；CPS 分成按区域 / 全局双池" />
          </Form.Item>

          <Form.Item
            label="上传合同扫描件 / 电子版"
            name="file"
            tooltip="支持 PDF / 图片格式，单份不超过 20MB"
            rules={[{ required: true, message: '请上传合同文件' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload.Dragger
              beforeUpload={() => false}
              accept=".pdf,.jpg,.jpeg,.png"
              maxCount={1}
            >
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p className="ant-upload-text">点击或拖拽合同文件到此区域上传</p>
              <p className="ant-upload-hint" style={{ color: 'rgba(255,255,255,0.45)' }}>
                支持 PDF / JPG / PNG，建议清晰扫描全文 + 双方签章页
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item label="备注（可选）" name="remark">
            <TextArea rows={2} placeholder="如有特别说明，请在此填写" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========== 详情 Modal ========== */}
      <Modal
        title="合同详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="dl" icon={<DownloadOutlined />}>下载合同</Button>,
          <Button key="close" type="primary" onClick={() => setDetailOpen(false)}>关闭</Button>,
        ]}
        width={720}
      >
        {current && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="合同编号" span={2}>{current.id}</Descriptions.Item>
            <Descriptions.Item label="合同名称" span={2}>{current.name}</Descriptions.Item>
            <Descriptions.Item label="合同类型">{current.type}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={contractStatusLabel[current.status as ContractStatus].color}>
                {contractStatusLabel[current.status as ContractStatus].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="签署主体" span={2}>{current.party}</Descriptions.Item>
            <Descriptions.Item label="签署日期">{current.signedAt}</Descriptions.Item>
            <Descriptions.Item label="有效期">{current.effectiveStart} ~ {current.effectiveEnd}</Descriptions.Item>
            <Descriptions.Item label="核心条款" span={2}>{current.amountClause}</Descriptions.Item>
            <Descriptions.Item label="附件">
              <Tooltip title={`大小：${current.fileSize}`}>
                <a><FileTextOutlined /> {current.fileName}</a>
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="录入人">{current.uploadBy}</Descriptions.Item>
            {current.auditBy && (
              <>
                <Descriptions.Item label="审核人">{current.auditBy}</Descriptions.Item>
                <Descriptions.Item label="审核时间">{current.auditAt}</Descriptions.Item>
                <Descriptions.Item label="审核意见" span={2}>{current.auditRemark}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
