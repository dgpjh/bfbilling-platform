import { Modal, Form, Input, InputNumber, Cascader, Row, Col, message } from 'antd';
import { provinceCityOptions, addMyCafe } from '../mock/data';
import LinkPicker from './LinkPicker';

export type CafeFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// 网吧录入弹窗：注册后引导 + 终端管理"新增网吧"共用
export default function CafeFormModal({ open, onClose, onSuccess }: CafeFormModalProps) {
  const [form] = Form.useForm();

  const onOk = async () => {
    const v = await form.validateFields();
    addMyCafe({
      name: v.name,
      province: v.region[0],
      city: v.region[1],
      address: v.address,
      terminalCount: v.terminalCount,
      contact: v.contact,
      phone: v.phone,
      businessHours: v.businessHours || '00:00 - 24:00',
    });
    message.success('网吧录入成功！默认全局结算，待运营下发省渠道号后转为区域结算');
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
      okText="提交录入"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark style={{ marginTop: 12 }}>
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
            <Form.Item label="终端数（台）" name="terminalCount" rules={[{ required: true, message: '请输入终端数' }]}>
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

        <Form.Item label="营业时间" name="businessHours" initialValue="00:00 - 24:00">
          <Input placeholder="如 00:00 - 24:00" />
        </Form.Item>

        {/* 复用注册同款关联交互：录入网吧时可选择性关联代理（不填则直连迪越） */}
        <Form.Item label="关联代理（选填）" name="agentLink" extra="输入代理 ID 可将本网吧挂靠到对应代理；不填则由迪越直连结算">
          <LinkPicker target="agent" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
