// src/components/layout/voting/RankingVote.tsx
import { Form, Space, Typography, Tag, Card, Alert, Button } from 'antd'
import { CrownOutlined, TrophyOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'

const { Text } = Typography

interface RankingVoteProps {
  options: any[]
  form: any
}

interface RankingItem {
  id: string
  candidateName: string
  candidateCode: string
  description?: string
  rank: number
}

export default function RankingVote({ options, form }: RankingVoteProps) {
  const [rankingItems, setRankingItems] = useState<RankingItem[]>(() =>
    options.map((option, index) => ({
      id: option.id,
      candidateName: option.optionText,
      candidateCode: option.optionValue,
      description: option.description,
      rank: index + 1
    }))
  )

  // Cập nhật form value khi rankingItems thay đổi
  useEffect(() => {
    const rankingValue = rankingItems.reduce((acc, item) => {
      acc[item.candidateCode] = item.rank
      return acc
    }, {} as Record<string, number>)

    form.setFieldValue('ranking', rankingValue)
  }, [rankingItems, form])

  const moveItemUp = (index: number) => {
    if (index === 0) return
    
    const items = [...rankingItems]
    // Swap với item phía trên
    const temp = items[index]
    items[index] = items[index - 1]
    items[index - 1] = temp
    
    // Update ranks
    const updatedItems = items.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }))

    setRankingItems(updatedItems)
  }

  const moveItemDown = (index: number) => {
    if (index === rankingItems.length - 1) return
    
    const items = [...rankingItems]
    // Swap với item phía dưới
    const temp = items[index]
    items[index] = items[index + 1]
    items[index + 1] = temp
    
    // Update ranks
    const updatedItems = items.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }))

    setRankingItems(updatedItems)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyOutlined className="text-yellow-500 text-lg" />
      case 2:
        return <TrophyOutlined className="text-gray-400 text-lg" />
      case 3:
        return <TrophyOutlined className="text-orange-500 text-lg" />
      default:
        return <CrownOutlined className="text-blue-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'gold'
      case 2:
        return 'default'
      case 3:
        return 'orange'
      default:
        return 'blue'
    }
  }

  const getRankText = (rank: number) => {
    switch (rank) {
      case 1:
        return 'Nhất'
      case 2:
        return 'Nhì'
      case 3:
        return 'Ba'
      default:
        return `Hạng ${rank}`
    }
  }

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <Alert
          message="Sắp xếp theo thứ tự ưu tiên"
          description="Sử dụng nút mũi tên để sắp xếp các phương án theo thứ tự ưu tiên từ cao đến thấp"
          type="info"
          showIcon
        />
      </div>

      <Form.Item
        name="ranking"
        rules={[{ required: true, message: 'Vui lòng sắp xếp thứ tự ưu tiên' }]}
      >
        <Space direction="vertical" className="w-full" size="middle">
          {rankingItems.map((item, index) => (
            <Card
              key={item.id}
              size="small"
              className="hover:shadow-md transition-shadow border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Tag 
                    color={getRankColor(item.rank)} 
                    className="w-10 h-10 flex items-center justify-center text-sm font-bold"
                  >
                    {getRankIcon(item.rank)}
                  </Tag>
                  <div className="flex-1">
                    <Text strong className="text-base block mb-1">
                      {item.candidateName}
                    </Text>
                    {item.description && (
                      <Text type="secondary" className="text-sm block">
                        {item.description}
                      </Text>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Button 
                      type="text" 
                      icon={<UpOutlined />} 
                      size="small"
                      disabled={index === 0}
                      onClick={() => moveItemUp(index)}
                      className="flex items-center justify-center"
                    />
                    <Button 
                      type="text" 
                      icon={<DownOutlined />} 
                      size="small"
                      disabled={index === rankingItems.length - 1}
                      onClick={() => moveItemDown(index)}
                      className="flex items-center justify-center"
                    />
                  </div>
                  
                  <Tag color={getRankColor(item.rank)} className="ml-2 min-w-16 text-center">
                    {getRankText(item.rank)}
                  </Tag>
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </Form.Item>

      <Card size="small" className="bg-blue-50 border-blue-200">
        <Space direction="vertical" size="small" className="w-full">
          <Text strong className="text-blue-800">Hướng dẫn bỏ phiếu xếp hạng:</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <TrophyOutlined className="text-yellow-500 mt-1" />
              <Text type="secondary" className="text-sm">Vị trí trên cùng có mức độ ưu tiên cao nhất</Text>
            </div>
            <div className="flex items-start gap-2">
              <UpOutlined className="text-gray-600 mt-1" />
              <Text type="secondary" className="text-sm">Nhấn ↑ để tăng thứ hạng</Text>
            </div>
            <div className="flex items-start gap-2">
              <DownOutlined className="text-gray-600 mt-1" />
              <Text type="secondary" className="text-sm">Nhấn ↓ để giảm thứ hạng</Text>
            </div>
            <div className="flex items-start gap-2">
              <CrownOutlined className="text-blue-500 mt-1" />
              <Text type="secondary" className="text-sm">Thứ tự sẽ được lưu dưới dạng xếp hạng</Text>
            </div>
          </div>
        </Space>
      </Card>

      {/* Hiển thị thứ tự hiện tại để debug */}
      <Card size="small" className="bg-gray-50 border-gray-200">
        <Text strong className="text-gray-700">Thứ tự hiện tại:</Text>
        <div className="mt-2 flex flex-wrap gap-1">
          {rankingItems.map((item) => (
            <Tag key={item.id} color="blue">
              {item.rank}. {item.candidateName}
            </Tag>
          ))}
        </div>
      </Card>
    </div>
  )
}