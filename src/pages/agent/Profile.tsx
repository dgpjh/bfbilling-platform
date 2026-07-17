import { useState } from 'react';
import {
  Card, Row, Col, Tag, Descriptions, Button, Space, Avatar, Typography,
  message, Modal, Form, Input,
} from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, CopyOutlined, EditOutlined, IdcardOutlined,
} from '@ant-design/icons';
import {
  getMyProfile,
  type AccountProfile,
} from '../../mock/data';

const { Text, Title } = Typography;

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
  const [profile, setProfile] = useState<AccountProfile>(() => ({ ...getMyProfile() }));
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();

  const copyRoleId = () => {
    navigator.clipboard?.writeText(profile.roleId).catch(() => {});
    message.success(`已复制代理 ID：${profile.roleId}`);
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
      <Card
        style={{ background: 'linear-gradient(135deg,#2A1416 0%,#1A1212 100%)', border: '1px solid #3A2024', marginBottom: 16 }}
        styles={{ body: { padding: 24 } }}
      >
        <Row align="middle" gutter={24}>
          <Col flex="none">
            <Avatar size={72} style={{ background: '#FF2E3E', fontSize: 30 }}>
              {profile.contact.slice(0, 1)}
            </Avatar>
          </Col>
          <Col flex="auto">
            <Space size={10} align="center" wrap>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>{profile.contact}</Title>
              <Tag color="red">代理商</Tag>
            </Space>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.55)' }}>代理 ID</Text>
              <Text
                copyable={false}
                style={{
                  color: '#FFD66B', fontSize: 20, fontWeight: 700, letterSpacing: 1,
                  fontFamily: 'Menlo, Consolas, monospace',
                }}
              >
                {profile.roleId}
              </Text>
              <Button size="small" type="text" icon={<CopyOutlined style={{ color: '#FFD66B' }} />} onClick={copyRoleId} />
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              注册时间：{profile.registeredAt}
            </Text>
          </Col>
        </Row>
      </Card>

      <Card
        style={{ background: '#1A1212', border: '1px solid #2A1A1C', marginBottom: 16 }}
        title={<SectionTitle icon={<UserOutlined style={{ color: '#4ECDC4' }} />} text="个人信息" extra={<Button size="small" type="link" icon={<EditOutlined />} onClick={openEdit}>编辑</Button>} />}
      >
        <Descriptions column={1} size="middle" labelStyle={{ color: 'rgba(255,255,255,0.45)', width: 110 }} contentStyle={{ color: 'rgba(255,255,255,0.9)' }}>
          <Descriptions.Item label={<Space size={4}><UserOutlined />姓名</Space>}>{profile.contact}</Descriptions.Item>
          <Descriptions.Item label={<Space size={4}><PhoneOutlined />电话</Space>}>{profile.phone}</Descriptions.Item>
          <Descriptions.Item label={<Space size={4}><EnvironmentOutlined />地区</Space>}>{profile.province} {profile.city}</Descriptions.Item>
          <Descriptions.Item label={<Space size={4}><EnvironmentOutlined />地址</Space>}>{profile.address}</Descriptions.Item>
          <Descriptions.Item label={<Space size={4}><IdcardOutlined />身份证实名</Space>}>{profile.idCardNo}</Descriptions.Item>
          <Descriptions.Item label={<Space size={4}><MailOutlined />邮箱</Space>}>{profile.email}</Descriptions.Item>
        </Descriptions>
      </Card>

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
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$|^\d{3}\*{4}\d{4}$/, message: '手机号格式不正确' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确', transform: (v) => (v?.includes('*') ? 'a@a.com' : v) }]}>
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="address" label="详细联系地址" rules={[{ required: true, message: '请输入联系地址' }]}>
            <Input prefix={<EnvironmentOutlined />} placeholder="请输入详细地址" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
