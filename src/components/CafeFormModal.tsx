import { Modal, Form, Input, InputNumber, Cascader, Row, Col, Alert, message } from 'antd';
import { provinceCityOptions, addMyCafe } from '../mock/data';

export type CafeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// 网吧录入弹窗：代理提交网吧基本资料。
// 一期方案：录入即生效（无需平台审核）；网吧 ID 由系统自动生成（BF + 8 位数字），
// 代理只需填写名称、地区、地址、终端规模、联系人、网吧密码（6+ 位）。
export default function CafeFormModal({ open, onClose, onSuccess }: CafeFormModalProps) {
  const [form] = Form.useForm();

  const onOk = async () => {
    const v = await form.validateFields();
    const cafe = addMyCafe({
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
    message.success(`录入成功！系统已分配网吧 ID：${cafe.externalCafeId}（系统编号 ${cafe.id}），请安排线下铺设。`);
    form.resetFields();
    onClose();
    onSuccess?.();
  };

  return (
    <Modal
      title="录入网吧"
      open={open}
      onOk={onOk}
      onCancel={() => { form.resetFields(); onClose(); }}
      okText="确认录入"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="录入即生效，可立即安排线下铺设"
        description="网吧 ID 将由系统自动生成（无需手动填写）。请妥善保管下方设置的网吧密码，用于后续在霸服终端登录。"
      />
      <Form form={form} layout="vertical" requiredMark style={{ marginTop: 4 }}>
        <Form.Item label="网吧名称" name="name" rules={[{ required: true, message: '请输入网吧名称' }]}>
          <Input placeholder="如：星辰电竞·南山旗舰店" />
        </Form.Item>

        <Form.Item label="所在地区" name="region" rules={[{ required: true, message: '请选择省份城市' }]}>
          <Cascader options={provinceCityOptions} placeholder="请选择省份 / 城市" />
        </Form.Item>

        <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请填写详细地址' }]} extra="需具体到门牌号或楼层">
          <Input placeholder="如：南山区科技园南路 88 号 3 楼" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="终端规模数（台）"
              name="terminalScaleCount"
              rules={[{ required: true, message: '请输入终端规模数' }]}
              extra="代理人工录入，可后续编辑"
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
          label="网吧密码"
          name="cafePassword"
          rules={[
            { required: true, message: '请设置网吧密码' },
            { min: 6, message: '密码至少 6 位' },
            { max: 32, message: '密码最长 32 位' },
            { pattern: /^[\x21-\x7e]+$/, message: '仅支持英文字母、数字与常用符号' },
          ]}
          extra="6 位以上，用于在霸服终端登录该网吧。请妥善保管。"
        >
          <Input.Password placeholder="请输入 6 位以上密码" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
