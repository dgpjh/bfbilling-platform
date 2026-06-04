import { Modal, Form, Input, InputNumber, Cascader, Row, Col, Alert, message } from 'antd';
import { provinceCityOptions, addMyCafe } from '../mock/data';

export type CafeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// 网吧录入弹窗：网吧主提交录入申请。
// ⚠️ 提交后默认进入「平台审核中」状态，由迪越/应用宝手助审核员通过后才会分配正式网吧 ID（MCxxxx）。
//    审核通过前：无 ID、不能被代理关联；审核通过后即可在「我的网吧」页看到 ID 并分享给代理。
export default function CafeFormModal({ open, onClose, onSuccess }: CafeFormModalProps) {
  const [form] = Form.useForm();

  const onOk = async () => {
    const v = await form.validateFields();
    const cafe = addMyCafe({
      name: v.name,
      province: v.region[0],
      city: v.region[1],
      address: v.address,
      declaredTerminalCount: v.declaredTerminalCount,
      contact: v.contact,
      phone: v.phone,
    });
    message.success(`录入申请已提交，待平台审核（临时编号 ${cafe.tempId}）`);
    form.resetFields();
    onClose();
    onSuccess?.();
  };

  return (
    <Modal
      title="申请录入网吧"
      open={open}
      onOk={onOk}
      onCancel={() => { form.resetFields(); onClose(); }}
      okText="提交录入申请"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="录入后需经平台审核 → 分配正式网吧 ID"
        description="提交后由迪越 / 应用宝手助审核团队人工审核（一般 1 个工作日内）。审核通过后才会分配 MCxxxx 网吧 ID，届时可分享给代理发起关联。"
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
              label="预计终端数（台）"
              name="declaredTerminalCount"
              rules={[{ required: true, message: '请输入预计终端数' }]}
              extra="实际数量以铺设上线后为准"
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
      </Form>
    </Modal>
  );
}
