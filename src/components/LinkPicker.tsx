import { Alert } from 'antd';

export type LinkPickerProps = {
  value?: string;
  onChange?: (id: string) => void;
};

// v3 起取消代理 ↔ 网吧主关联流程，本组件仅保留为兼容旧引用。
export default function LinkPicker(_props: LinkPickerProps) {
  return (
    <Alert
      type="info"
      showIcon
      message="关联选择已下线"
      description="当前版本仅保留代理角色，网吧由代理直接录入和管理，不再需要选择网吧主或发起关联申请。"
    />
  );
}
