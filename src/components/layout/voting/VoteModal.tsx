// src/components/layout/voting/VoteModal.tsx
'use client'

import { Modal, Form, Button, Alert, Spin, Typography, Card, Space, Tag, message } from 'antd'
import { useState, useEffect } from 'react'
import TextArea from 'antd/lib/input/TextArea'
import { useCreateVote } from '@/hooks/vote/useCreateVote'
import { useMeetingResolutions } from '@/hooks/resolution/useMeetingResolutions'
import YesNoVote from './YesNoVote'
import MultipleChoiceVote from './MultipleChoiceVote'
import RankingVote from './RankingVote'

const { Title, Text, Paragraph } = Typography

interface VoteModalProps {
  open: boolean
  onClose: () => void
  verificationCode: string
  meetingId: number
  shareholderInfo?: any
  selectedResolutionId?: number // Thay vì resolution object, chỉ cần ID
}

export default function VoteModal({ 
  open, 
  onClose, 
  verificationCode, 
  meetingId, 
  shareholderInfo,
  selectedResolutionId 
}: VoteModalProps) {
  const [form] = Form.useForm()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const { mutateAsync: submitVote, isPending, error } = useCreateVote()
  
  // Sử dụng hook để lấy danh sách resolutions của meeting
  const { data: meetingResolutions, isLoading: isLoadingResolutions } = useMeetingResolutions(meetingId)

  // Tìm resolution được chọn từ danh sách
  const resolution = selectedResolutionId 
    ? meetingResolutions?.find((r: any) => r.id === selectedResolutionId)
    : null

  // Reset form khi resolution thay đổi
  useEffect(() => {
    if (resolution && open) {
      form.resetFields()
      setSelectedOptions([])
    }
  }, [resolution, open, form])

  // Kiểm tra resolution có tồn tại không
  if (!resolution && !isLoadingResolutions) {
    return null
  }

  const getVotingMethodIcon = () => {
    if (!resolution?.votingMethod) {
        return '🗳️'
    }

    const icons: Record<string, string> = {
        'YES_NO': '✅',
        'MULTIPLE_CHOICE': '☑️',
        'RANKING': '🏆'
    }
    
    return icons[resolution.votingMethod] || '🗳️'
  }

  const getVotingMethodText = () => {
    if (!resolution?.votingMethod) {
      return 'Bỏ phiếu'
    }

    const methods: Record<string, string> = {
      'YES_NO': 'Bỏ phiếu Có/Không',
      'MULTIPLE_CHOICE': 'Lựa chọn nhiều phương án',
      'RANKING': 'Xếp hạng phương án'
    }
    return methods[resolution.votingMethod] || 'Bỏ phiếu'
  }

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, optionId])
    } else {
      setSelectedOptions(prev => prev.filter(id => id !== optionId))
    }
  }

  const handleSubmit = async (values: any) => {
    if (!resolution) return

    try {
        // Validation cho từng loại voting method
        switch (resolution.votingMethod) {
        case 'RANKING':
            if (!resolution.candidates || resolution.candidates.length === 0) {
            message.error('Nghị quyết này chưa được cấu hình ứng cử viên')
            return
            }
            if (!values.ranking || Object.keys(values.ranking).length === 0) {
            message.error('Vui lòng xếp hạng các ứng cử viên')
            return
            }
            break
        
        case 'MULTIPLE_CHOICE':
            if (!resolution.options || resolution.options.length === 0) {
            message.error('Nghị quyết này chưa được cấu hình phương án bỏ phiếu')
            return
            }
            if (selectedOptions.length === 0) {
            message.error('Vui lòng chọn ít nhất một phương án')
            return
            }
            if (selectedOptions.length > resolution.maxChoices) {
            message.error(`Chỉ được chọn tối đa ${resolution.maxChoices} phương án`)
            return
            }
            break
        
        case 'YES_NO':
            if (!resolution.options || resolution.options.length === 0) {
            message.error('Nghị quyết này chưa được cấu hình phương án bỏ phiếu')
            return
            }
            if (!values.voteOption) {
            message.error('Vui lòng chọn một phương án')
            return
            }
            break
        }

        // Lấy thông tin cổ đông từ verification data để biết số cổ phần
        const shareholderShares = shareholderInfo?.totalShares || 0
        
        // Chuẩn bị dữ liệu theo từng loại voting method
        let voteData: any = {
        resolutionId: resolution.id,
        verificationCode,
        meetingId,
        sharesUsed: shareholderShares,
        comments: values.comments,
        }

        // Xử lý dữ liệu theo từng loại voting
        switch (resolution.votingMethod) {
        case 'YES_NO':
            voteData.voteValue = values.voteOption
            break
        
        case 'MULTIPLE_CHOICE':
            voteData.voteValue = JSON.stringify(selectedOptions)
            break
        
        case 'RANKING':
            voteData.voteValue = JSON.stringify(values.ranking)
            break
        
        default:
            voteData.voteValue = values.voteOption
        }

        console.log("voteData", voteData)
        
        await submitVote(voteData)
        message.success('Bỏ phiếu thành công!')
        onClose()
    } catch (error: any) {
        console.error('❌ Error submitting vote:', error)
        message.error(error.response?.data?.message || 'Bỏ phiếu thất bại')
    }
    }

  const renderVotingComponent = () => {

  // Xác định dữ liệu voting dựa trên votingMethod
  let votingData: any[] = []
  let dataType: 'options' | 'candidates' = 'options'

  switch (resolution.votingMethod) {
    case 'YES_NO':
    case 'MULTIPLE_CHOICE':
      votingData = resolution?.options || []
      dataType = 'options'
      break
    
    case 'RANKING':
      votingData = resolution?.candidates || []
      dataType = 'candidates'
      break
    
    default:
      votingData = resolution?.options || []
      dataType = 'options'
  }

  // Kiểm tra dữ liệu voting
  if (votingData.length === 0) {
    return (
      <Alert
        message={`Không có ${dataType === 'candidates' ? 'ứng cử viên' : 'phương án'} bỏ phiếu`}
        description={`Nghị quyết này chưa được cấu hình ${dataType === 'candidates' ? 'ứng cử viên' : 'phương án'} bỏ phiếu.`}
        type="error"
        showIcon
      />
    )
  }

  // Chuẩn hóa dữ liệu options
  const normalizedOptions = votingData.map((item: any, index: number) => {
    if (dataType === 'candidates') {
      return {
        id: item.id.toString(),
        optionText: item.candidateName,
        optionValue: item.candidateCode,
        description: item.candidateInfo, // Dùng candidateInfo cho description
        displayOrder: item.displayOrder
      }
    } else {
      return {
        id: item.id.toString(),
        optionText: item.optionText,
        optionValue: item.optionValue,
        description: item.description,
        displayOrder: item.displayOrder
      }
    }
  })


  switch (resolution.votingMethod) {
    case 'YES_NO':
      return <YesNoVote options={normalizedOptions} form={form} />
    
    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoiceVote 
          options={normalizedOptions} 
          form={form}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
        />
      )
    
    case 'RANKING':
      return <RankingVote options={normalizedOptions} form={form} />
    
    default:
      return <YesNoVote options={normalizedOptions} form={form} />
  }
}


  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl">{getVotingMethodIcon()}</span>
          <span>Bỏ Phiếu Nghị Quyết</span>
        </div>
      }
      open={open && !!selectedResolutionId}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {isLoadingResolutions || !resolution ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">Đang tải thông tin nghị quyết...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Thông tin nghị quyết */}
          <Card size="small" className="border-blue-200">
            <Space direction="vertical" className="w-full">
              <Title level={4} className="!mb-2 !text-blue-800">
                {resolution.title}
              </Title>
              <Paragraph className="!mb-3 text-gray-700">
                {resolution.content}
              </Paragraph>
              <Space wrap>
                <Tag color="blue" className="text-sm">
                  {getVotingMethodText()}
                </Tag>
                <Tag color="orange" className="text-sm">
                  Ngưỡng: {resolution.approvalThreshold}%
                </Tag>
                <Tag color={resolution.isActive ? 'green' : 'red'} className="text-sm">
                  {resolution.isActive ? 'Đang bỏ phiếu' : 'Đã kết thúc'}
                </Tag>
                {resolution.totalVotes !== undefined && (
                  <Tag color="purple" className="text-sm">
                    Đã bỏ phiếu: {resolution.totalVotes}
                  </Tag>
                )}
              </Space>
            </Space>
          </Card>

          {/* Form bỏ phiếu */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={!resolution.isActive || isPending}
          >
            {!resolution.isActive && (
              <Alert
                message="Bỏ phiếu đã kết thúc"
                description="Thời gian bỏ phiếu cho nghị quyết này đã kết thúc."
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            <Card title="Lựa chọn bỏ phiếu" size="small">
              {renderVotingComponent()}
            </Card>

            {/* Comments */}
            <Form.Item label="Ý kiến bổ sung (tùy chọn)" name="comments">
              <TextArea 
                placeholder="Nhập ý kiến của bạn về nghị quyết này..."
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Error message */}
            {error && (
              <Alert
                message="Lỗi khi gửi phiếu bầu"
                description={error.response?.data?.message || error.message || "Đã có lỗi xảy ra khi gửi phiếu bầu"}
                type="error"
                showIcon
                className="mb-4"
              />
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={onClose} disabled={isPending} size="large">
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isPending}
                disabled={!resolution.isActive}
                size="large"
              >
                {isPending ? 'Đang gửi...' : 'Gửi Phiếu Bầu'}
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  )
}