// src/components/layout/voting/YesNoVote.tsx
import { Form, Radio, Space, Typography, Tag } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

interface YesNoVoteProps {
  options: any[]
  form: any
}

export default function YesNoVote({ options, form }: YesNoVoteProps) {
  console.log('✅ YesNoVote received options:', options)

  // Nếu không có options, tạo options mặc định cho YES_NO
  const displayOptions = options.length > 0 ? options : [
    {
      id: 'yes',
      optionText: 'Đồng ý',
      optionValue: 'YES',
      description: 'Tán thành nghị quyết'
    },
    {
      id: 'no', 
      optionText: 'Không đồng ý',
      optionValue: 'NO',
      description: 'Không tán thành nghị quyết'
    }
  ]

  return (
    <Form.Item
      name="voteOption"
      rules={[{ required: true, message: 'Vui lòng chọn một phương án' }]}
    >
      <Radio.Group className="w-full">
        <Space direction="vertical" className="w-full">
          {displayOptions.map((option: any) => (
            <Radio 
              key={option.id} 
              value={option.optionValue} // Sử dụng trực tiếp optionValue từ API
              className="w-full py-3 px-3"
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  {option.optionValue === 'YES' ? (
                    <Tag color="green" icon={<CheckOutlined />}>ĐỒNG Ý</Tag>
                  ) : option.optionValue === 'NO' ? (
                    <Tag color="red" icon={<CloseOutlined />}>KHÔNG ĐỒNG Ý</Tag>
                  ) : (
                    <Tag color="blue">{option.optionText}</Tag>
                  )}
                </div>
                {option.description && (
                  <Text type="secondary" className="text-sm">
                    {option.description}
                  </Text>
                )}
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Form.Item>
  )
}