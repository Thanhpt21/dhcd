// src/components/layout/voting/MultipleChoiceVote.tsx
import { Form, Checkbox, Space, Typography, Tag, Alert } from 'antd'
import { CheckSquareOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Text } = Typography

interface MultipleChoiceVoteProps {
  options: any[]
  form: any
  selectedOptions: string[]
  onOptionChange: (optionId: string, checked: boolean) => void
}

export default function MultipleChoiceVote({ 
  options, 
  form, 
  selectedOptions, 
  onOptionChange 
}: MultipleChoiceVoteProps) {
  const [selectedCount, setSelectedCount] = useState(0)

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    onOptionChange(optionId, checked)
    setSelectedCount(prev => checked ? prev + 1 : prev - 1)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <Text strong>Chọn một hoặc nhiều phương án</Text>
        <Tag color="blue">
          Đã chọn: {selectedCount}/{options.length}
        </Tag>
      </div>
      
      <Form.Item
        name="selectedOptions"
        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phương án' }]}
      >
        <Checkbox.Group className="w-full">
          <Space direction="vertical" className="w-full">
            {options.map((option: any) => (
              <Checkbox 
                key={option.id} 
                value={option.id}
                onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                className="w-full py-3 px-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center w-full">
                  {option.description && (
                    <Text type="secondary" className="text-sm">
                      {option.description}
                    </Text>
                  )}
                </div>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Form.Item>

      {selectedCount === 0 && (
        <Alert
          message="Chưa chọn phương án nào"
          description="Vui lòng chọn ít nhất một phương án để tiếp tục"
          type="warning"
          showIcon
          className="mt-2"
        />
      )}
    </div>
  )
}