import { Modal, Form, Input, InputNumber, Cascader, Row, Col, Alert, message } from 'antd';
import { provinceCityOptions, addMyCafe } from '../mock/data';

export type CafeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// 网吧录入弹窗：代理提交网吧录入申请。
// ⚠️ 提交后默认进入「平台审核中」状态，由迪越/应用宝手助审核员通过后才会分配正式网吧 ID（MCxxxx）。
//    审核通过后，代理即可安排线下铺设霸服系统。
export default function CafeFormModal({ open, onClose, onSuccess }: CafeFormModalProps) {
  const [form] = Form.useForm();

  const onOk = async () => {
    const v = await form.validateFields();
    const cafe = addMyCafe({
      externalCafeId: v.externalCafeId,
      name: v.name,
      province: v.region[0],
      city: v.region[1],
      address: v.address,
      declaredTerminalCount: v.terminalScaleCount,
      terminalScaleCount: v.terminalScaleCount,
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
        message="录入后需经平台审核 → 代理铺设上线"
        description="网吧 ID 由代理提前向迪越侧或区域经理获取。提交后由迪越 / 应用宝手助审核团队人工审核（一般 1 个工作日内），审核通过后即可安排线下铺设霸服系统。"
      />
      <Form form={form} layout="vertical" requiredMark style={{ marginTop: 4 }}>
        <Form.Item
          label="网吧 ID"
          name="externalCafeId"
          rules={[{ required: true, message: '请输入网吧 ID' }]}
          extra="必填。若不知道网吧 ID，可以联系相应区域经理获取。"
        >
          <Input placeholder="如：BAFU-SZ-0001" />
        </Form.Item>

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
              extra="代理人工录入，可后续编辑；已活跃终端数由上线后数据回传"
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
