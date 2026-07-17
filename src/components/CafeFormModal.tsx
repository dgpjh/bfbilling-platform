import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Cascader, Row, Col, Alert, Typography, message } from 'antd';
import { provinceCityOptions, generateCafeLoginAccount, addMyCafe } from '../mock/data';

export type CafeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const { Text } = Typography;

export default function CafeFormModal({ open, onClose, onSuccess }: CafeFormModalProps) {
  const [form] = Form.useForm();
  const [generatedAccount, setGeneratedAccount] = useState('');

  useEffect(() => {
    if (open) setGeneratedAccount(generateCafeLoginAccount());
  }, [open]);

  const resetAndClose = () => {
    form.resetFields();
    setGeneratedAccount('');
    onClose();
  };

  const onOk = async () => {
    const v = await form.validateFields();
    const loginAccount = generatedAccount || generateCafeLoginAccount();
    const cafe = addMyCafe({
      externalCafeId: loginAccount,
      name: v.name,
      province: v.region[0],
      city: v.region[1],
      address: v.address,
      declaredTerminalCount: v.terminalScaleCount,
      terminalScaleCount: v.terminalScaleCount,
      contact: v.contact,
      phone: v.phone,
      cafePassword: v.cafePassword,
    });
    message.success(`录入成功：无盘账号 ${cafe.externalCafeId}`);
    resetAndClose();
    onSuccess?.();
  };

  return (
    <Modal
      title="录入网吧"
      open={open}
      onOk={onOk}
      onCancel={resetAndClose}
      okText="确认录入"
      cancelText="取消"
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark style={{ marginTop: 4 }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="网吧ID即霸服无盘系统登录账号"
          description="账号由系统在录入网吧时自动生成，配合下方设置的无盘系统登录密码即可登录霸服无盘系统。"
        />

        <Form.Item label="网吧ID / 无盘账号">
          <Input value={generatedAccount} readOnly placeholder="系统自动生成" />
          <Text type="secondary" style={{ fontSize: 12 }}>该账号无需手动选择或填写，确认录入后生效。</Text>
        </Form.Item>

        <Form.Item label="网吧名称" name="name" rules={[{ required: true, message: '请输入网吧名称' }]}>
          <Input placeholder="如：星辰电竞·南山旗舰店" />
        </Form.Item>

        <Form.Item label="所在地区" name="region" rules={[{ required: true, message: '请选择省份城市' }]}>
          <Cascader options={provinceCityOptions} placeholder="请选择省份 / 城市" />
        </Form.Item>

        <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请填写详细地址' }]}>
          <Input placeholder="如：南山区科技园南路 88 号 3 楼" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="终端规模数（台）"
              name="terminalScaleCount"
              rules={[{ required: true, message: '请输入终端规模数' }]}
            >
              <InputNumber min={1} max={5000} style={{ width: '100%' }} placeholder="如 100" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="现场联系人" name="contact" rules={[{ required: true, message: '请输入联系人' }]}>
              <Input placeholder="网管 / 店长" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入联系电话' }]}>
              <Input placeholder="手机号" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="无盘系统登录密码"
          name="cafePassword"
          rules={[
            { required: true, message: '请设置无盘系统登录密码' },
            { min: 6, message: '密码至少 6 位' },
            { max: 32, message: '密码最长 32 位' },
            { pattern: /^[\x21-\x7e]+$/, message: '仅支持英文字母、数字与常用符号' },
          ]}
        >
          <Input.Password placeholder="请输入 6 位以上密码" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
