import { useState } from 'react';
import {
  Card, Row, Col, Tag, Descriptions, Button, Space, Avatar, Typography,
  message, Modal, Form, Input, Tooltip, List, Empty,
} from 'antd';
import {
  IdcardOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, SafetyCertificateOutlined,
  CopyOutlined, EditOutlined, LinkOutlined, CheckCircleFilled, ShopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getMyProfile, getCafesByOwner, getCafesByAgent,
  CURRENT_AGENT_ID, CURRENT_OWNER_ID,
  type AccountProfile,
} from '../../mock/data';

const { Text, Title } = Typography;

// 卡片统一标题
function SectionTitle({ icon, text, extra }: { icon: React.ReactNode; text: string; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Space size={8} style={{ color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: 600 }}>
        {icon}
        {text}
      </Space>
      {extra}
    </div>
  );
}

export default function AgentProfile() {
  const navigate = useNavigate();
  // 当前角色档案（按 demo 身份取）
  const [profile, setProfile] = useState<AccountProfile>(() => ({ ...getMyProfile() }));
  const isAgent = profile.role === 'agent';
  const roleLabel = isAgent ? '代理' : '网吧主';

  // 网吧关联汇总（按角色取数）
  const linkedCafes = isAgent
    ? getCafesByAgent(CURRENT_AGENT_ID)
    : getCafesByOwner(CURRENT_OWNER_ID);
  const totalTerminals = linkedCafes.reduce((s, c) => s + c.terminalCount, 0);
  const linkedAgentCount = !isAgent ? linkedCafes.filter((c) => c.agentId).length : 0;
  const standaloneCount = !isAgent ? linkedCafes.filter((c) => !c.agentId).length : 0;

  // 编辑联系方式弹窗
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();

  const copyRoleId = () => {
    navigator.clipboard?.writeText(profile.roleId).catch(() => {});
    message.success(`已复制角色 ID：${profile.roleId}`);
  };

  const openEdit = () => {
    form.setFieldsValue({ phone: profile.phone, email: profile.email, address: profile.address });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    const v = await form.validateFields();
    setProfile((p) => ({ ...p, phone: v.phone, email: v.email, address: v.address }));
    setEditOpen(false);
    message.success('联系方式已更新');
  };

  return (
    <div style={{ maxWidth: 1040 }}>
      {/* 顶部：身份卡 + 角色 ID（最突出） */}
      <Card
        style={{ background: 'linear-gradient(135deg,#2A1416 0%,#1A1212 100%)', border: '1px solid #3A2024', marginBottom: 16 }}
        styles={{ body: { padding: 24 } }}
      >
        <Row align="middle" gutter={24}>
          <Col flex="none">
            <Avatar size={72} style={{ background: '#FF2E3E', fontSize: 30 }}>
              {profile.realName.slice(0, 1)}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Space size={10} align="center" wrap>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{profile.realName}</Title>
              <Tag color={isAgent ? 'red' : 'gold'}>{roleLabel}</Tag>
              <Tag color={profile.subjectType === 'company' ? 'geekblue' : 'cyan'}>
                {profile.subjectType === 'company' ? '企业主体' : '个人主体'}
              </Tag>
              {profile.authStatus === 'verified' && (
                <Tag icon={<CheckCircleFilled />} color="success">已实名认证</Tag>
              )}
            </Space>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.55)' }}>角色 ID</Text>
              <Text
                copyable={false}
                style={{
                  color: '#FFD66B', fontSize: 20, fontWeight: 700, letterSpacing: 1,
                  fontFamily: 'Menlo, Consolas, monospace',
                }}
              >
                {profile.roleId}
              </Text>
              <Tooltip title="复制角色 ID（用于关联、对账、客服核验）">
                <Button size="small" type="text" icon={<CopyOutlined style={{ color: '#FFD66B' }} />} onClick={copyRoleId} />
              </Tooltip>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              注册时间：{profile.registeredAt}
            </Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* 实名信息（只读） */}
        <Col xs={24} lg={12}>
          <Card
            style={{ background: '#1A1212', border: '1px solid #2A1A1C', marginBottom: 16 }}
            title={
              <SectionTitle
                icon={<IdcardOutlined style={{ color: '#FF6B6B' }} />}
                text="实名信息"
                extra={<Tag color="default" style={{ marginRight: 0 }}>校验回填 · 不可改</Tag>}
              />
            }
          >
            <Descriptions column={1} size="middle" labelStyle={{ color: 'rgba(255,255,255,0.45)', width: 110 }} contentStyle={{ color: 'rgba(255,255,255,0.9)' }}>
              <Descriptions.Item label="姓名">{profile.realName}</Descriptions.Item>
              <Descriptions.Item label="身份证号">{profile.idCard}</Descriptions.Item>
              {profile.subjectType === 'company' && (
                <>
                  <Descriptions.Item label="企业名称">{profile.companyName}</Descriptions.Item>
                  <Descriptions.Item label="信用代码">{profile.creditCode}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* 联系方式（可编辑） */}
        <Col xs={24} lg={12}>
          <Card
            style={{ background: '#1A1212', border: '1px solid #2A1A1C', marginBottom: 16 }}
            title={
              <SectionTitle
                icon={<PhoneOutlined style={{ color: '#4ECDC4' }} />}
                text="联系方式"
                extra={<Button size="small" type="link" icon={<EditOutlined />} onClick={openEdit}>编辑</Button>}
              />
            }
          >
            <Descriptions column={1} size="middle" labelStyle={{ color: 'rgba(255,255,255,0.45)', width: 110 }} contentStyle={{ color: 'rgba(255,255,255,0.9)' }}>
              <Descriptions.Item label={<Space size={4}><UserOutlined />联系人</Space>}>{profile.contact}</Descriptions.Item>
              <Descriptions.Item label={<Space size={4}><PhoneOutlined />手机号</Space>}>{profile.phone}</Descriptions.Item>
              <Descriptions.Item label={<Space size={4}><MailOutlined />邮箱</Space>}>{profile.email}</Descriptions.Item>
              <Descriptions.Item label={<Space size={4}><EnvironmentOutlined />联系地址</Space>}>
                {profile.province} {profile.city} {profile.address}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 关联关系（按角色展示）+ 账户状态 */}
        <Col xs={24}>
          <Card
            style={{ background: '#1A1212', border: '1px solid #2A1A1C', marginBottom: 16 }}
            title={
              <SectionTitle
                icon={<LinkOutlined style={{ color: '#B388FF' }} />}
                text={isAgent ? '已托管网吧' : '我管理的网吧'}
                extra={
                  <Button
                    size="small" type="link"
                    onClick={() => navigate('/agent/my-cafes')}
                  >
                    前往管理 →
                  </Button>
                }
              />
            }
          >
            {/* 顶部摘要 */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>网吧数</Text>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
                  {linkedCafes.length} <span style={{ fontSize: 13, opacity: 0.6 }}>家</span>
                </div>
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>终端数</Text>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
                  {totalTerminals} <span style={{ fontSize: 13, opacity: 0.6 }}>台</span>
                </div>
              </div>
              {!isAgent && (
                <>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>已关联代理</Text>
                    <div style={{ color: '#B388FF', fontSize: 22, fontWeight: 700 }}>
                      {linkedAgentCount} <span style={{ fontSize: 13, opacity: 0.6 }}>家</span>
                    </div>
                  </div>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>散店</Text>
                    <div style={{ color: '#5BB3FF', fontSize: 22, fontWeight: 700 }}>
                      {standaloneCount} <span style={{ fontSize: 13, opacity: 0.6 }}>家</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 网吧明细 */}
            {linkedCafes.length === 0 ? (
              <Empty
                image={<ShopOutlined style={{ fontSize: 36, color: 'rgba(255,255,255,0.25)' }} />}
                description={
                  <Text style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {isAgent ? '暂未托管任何网吧，前往「关联网吧」发起申请' : '暂未录入网吧'}
                  </Text>
                }
              />
            ) : (
              <List
                size="small"
                dataSource={linkedCafes.slice(0, 5)}
                renderItem={(c) => (
                  <List.Item style={{ borderBottom: '1px solid #2A1A1C', padding: '8px 0' }}>
                    <Space size={8} wrap>
                      <Tag color="gold" style={{ marginRight: 0 }}>{c.id}</Tag>
                      <Text style={{ color: 'rgba(255,255,255,0.85)' }}>{c.name}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        {c.province}·{c.city}
                      </Text>
                      {!isAgent && (
                        c.agentId
                          ? <Tag color="purple">归属代理 {c.agentId}</Tag>
                          : <Tag color="blue">散店</Tag>
                      )}
                    </Space>
                  </List.Item>
                )}
                footer={linkedCafes.length > 5 ? (
                  <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                    仅显示前 5 家，共 {linkedCafes.length} 家。前往
                    <a onClick={() => navigate(isAgent ? '/agent/my-cafes' : '/agent/my-cafes')}> 查看全部</a>
                  </Text>
                ) : null}
              />
            )}

            <Descriptions column={1} size="middle" style={{ marginTop: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.45)', width: 110 }}
              contentStyle={{ color: 'rgba(255,255,255,0.9)' }}
            >
              <Descriptions.Item label={<Space size={4}><SafetyCertificateOutlined />认证状态</Space>}>
                {profile.authStatus === 'verified'
                  ? <Tag icon={<CheckCircleFilled />} color="success">已通过资质审核</Tag>
                  : <Tag color="warning">审核中</Tag>}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* 编辑联系方式弹窗 */}
      <Modal
        title="编辑联系方式"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={submitEdit}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$|^\d{3}\*{4}\d{4}$/, message: '手机号格式不正确' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确', transform: (v) => (v?.includes('*') ? 'a@a.com' : v) }]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="address" label="详细联系地址" rules={[{ required: true, message: '请输入联系地址' }]}>
            <Input prefix={<EnvironmentOutlined />} placeholder="请输入详细地址" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提示：实名信息涉及资质审核，如需变更请联系运营客服并重新提交认证。
          </Text>
        </Form>
      </Modal>
    </div>
  );
}
