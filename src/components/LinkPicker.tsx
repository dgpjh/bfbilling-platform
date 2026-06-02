import { useState } from 'react';
import { Input, Tag, Space, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { findLinkAgentById, findLinkCafeById, maskName } from '../mock/data';

const { Text } = Typography;

export type LinkPickerProps = {
  // 关联类型：代理（网吧主用）/ 网吧（代理用）
  target: 'agent' | 'cafe';
  // 受控值：关联对象 ID（为空表示不关联）
  value?: string;
  onChange?: (id: string) => void;
};

// 关联选择器：输入对方 ID 精确匹配，命中后用脱敏姓名模糊展示（如 董子霄 → 董**）
// 留空即「不关联」，网吧主可直连迪越、代理可暂不挂网吧
export default function LinkPicker({ target, value, onChange }: LinkPickerProps) {
  const [input, setInput] = useState(value || '');
  const hit = target === 'agent' ? findLinkAgentById(input) : findLinkCafeById(input);
  const typed = input.trim().length > 0;

  const placeholder = target === 'agent'
    ? '输入代理 ID（如 A1001），留空表示不关联代理'
    : '输入网吧 ID（如 CC0001），留空表示暂不关联网吧';

  return (
    <div>
      <Input
        value={input}
        placeholder={placeholder}
        allowClear
        onChange={(e) => {
          setInput(e.target.value);
          onChange?.(e.target.value);
        }}
      />
      <div style={{ marginTop: 6, minHeight: 22 }}>
        {!typed ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {target === 'agent' ? '未关联代理：将由迪越直连结算' : '未关联网吧：可创角后再录入 / 关联'}
          </Text>
        ) : hit ? (
          <Space size={6}>
            <CheckCircleFilled style={{ color: '#52C41A' }} />
            <Text style={{ fontSize: 13 }}>
              已匹配：{target === 'agent' ? '代理' : '网吧'}{' '}
              <Tag color="green" style={{ marginInlineEnd: 0 }}>
                {maskName(hit.name)}（{hit.province}·{hit.id}）
              </Tag>
            </Text>
          </Space>
        ) : (
          <Space size={6}>
            <CloseCircleFilled style={{ color: '#FF4D4F' }} />
            <Text type="danger" style={{ fontSize: 12 }}>未找到该 ID 对应的{target === 'agent' ? '代理' : '网吧'}，请核对后重输</Text>
          </Space>
        )}
      </div>
    </div>
  );
}
