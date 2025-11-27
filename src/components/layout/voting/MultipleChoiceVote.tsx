// src/components/layout/voting/MultipleChoiceVote.tsx
import { Form, Checkbox, Space, Typography, Tag, Alert } from 'antd'
import { CheckSquareOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Text, Title } = Typography

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
          <Space direction="vertical" className="w-full" size="middle">
            {options.map((option: any) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedOptions.includes(option.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    value={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    {/* ✅ HIỂN THỊ TÊN PHƯƠNG ÁN */}
                    <Title level={5} className="!mb-1 !text-gray-800">
                      {option.optionText}
                    </Title>
                    
                    {/* ✅ HIỂN THỊ MÔ TẢ NẾU CÓ */}
                    {option.description && (
                      <Text type="secondary" className="text-sm">
                        {option.description}
                      </Text>
                    )}
                    
                    {/* ✅ HIỂN THỊ MÃ PHƯƠNG ÁN */}
                    <div className="mt-2">
                      <Tag color="blue" className="text-xs">
                        {option.optionCode}
                      </Tag>
                    </div>
                  </div>
                  
                  {/* ✅ ICON KHI ĐƯỢC CHỌN */}
                  {selectedOptions.includes(option.id) && (
                    <CheckSquareOutlined className="text-green-500 text-lg mt-1" />
                  )}
                </div>
              </div>
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

      {/* ✅ HƯỚNG DẪN SỬ DỤNG */}
      <Alert
        message="Hướng dẫn bỏ phiếu"
        description="Click vào ô checkbox để chọn phương án bỏ phiếu"
        type="info"
        showIcon
        className="mt-4"
      />
    </div>
  )
}