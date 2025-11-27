// src/components/admin/option/OptionForm.tsx
'use client'

import { Modal, Form, Input, InputNumber, message, Button, Select, Space, Alert } from 'antd'
import { useEffect, useState, useMemo } from 'react'
import { useCreateOption } from '@/hooks/option/useCreateOption'
import { useUpdateOption } from '@/hooks/option/useUpdateOption'
import type { ResolutionOption } from '@/types/option.type'
import { VotingMethod } from '@/types/resolution.type'

const { TextArea } = Input
const { Option } = Select

interface OptionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  resolutionId: number
  option?: ResolutionOption | null
  isEdit?: boolean
  votingMethod?: VotingMethod
  existingOptions?: ResolutionOption[]
}

export default function OptionForm({
  open,
  onClose,
  onSuccess,
  resolutionId,
  option,
  isEdit = false,
  votingMethod = VotingMethod.MULTIPLE_CHOICE,
  existingOptions = []
}: OptionFormProps) {
  const [form] = Form.useForm()
  const { mutateAsync: createOption, isPending: isCreating } = useCreateOption()
  const { mutateAsync: updateOption, isPending: isUpdating } = useUpdateOption()

  const isPending = isCreating || isUpdating

  // ✅ Xác định đúng phương thức bỏ phiếu
  const actualVotingMethod = useMemo(() => {
    return votingMethod || VotingMethod.MULTIPLE_CHOICE
  }, [votingMethod])

  console.log("🎯 Voting Method:", actualVotingMethod)

  // ✅ Tự động sinh mã phương án - SỬA LẠI
  const generateOptionCode = (): string => {
    const existingCodes = existingOptions.map(opt => opt.optionCode)
    
    if (actualVotingMethod === VotingMethod.YES_NO) {
      // Ưu tiên YES, NO, ABSTAIN
      const yesNoOptions = ['YES', 'NO', 'ABSTAIN']
      for (const code of yesNoOptions) {
        if (!existingCodes.includes(code)) {
          return code
        }
      }
      // Nếu YES/NO đã tồn tại, cho phép tạo thêm
      let counter = 1
      while (existingCodes.includes(`OPT_${counter}`)) {
        counter++
      }
      return `OPT_${counter}`
    } else {
      // MULTIPLE_CHOICE hoặc RANKING
      let counter = 1
      while (existingCodes.includes(`OPT_${counter}`)) {
        counter++
      }
      return `OPT_${counter}`
    }
  }

  // ✅ Tự động sinh giá trị phương án - SỬA LẠI HOÀN TOÀN
  const generateOptionValue = (code: string): string => {
    if (actualVotingMethod === VotingMethod.YES_NO) {
      // ✅ CHO YES_NO: Giữ nguyên giá trị (YES, NO, ABSTAIN)
      const valueMap: Record<string, string> = {
        'YES': 'YES',
        'NO': 'NO', 
        'ABSTAIN': 'ABSTAIN'
      }
      return valueMap[code] || code // Giữ nguyên nếu không có trong map
    } else {
      // ✅ CHO MULTIPLE_CHOICE: Chuyển thành lowercase với prefix option_
      return `option_${code.toLowerCase().replace('opt_', '')}`
    }
  }

  // ✅ Tự động sinh tên hiển thị - SỬA LẠI
  const generateOptionText = (code: string): string => {
    const textMap: Record<string, string> = {
      'YES': 'Đồng ý',
      'NO': 'Không đồng ý', 
      'ABSTAIN': 'Trắng/Bỏ phiếu',
      'OPT_1': 'Phương án 1',
      'OPT_2': 'Phương án 2',
      'OPT_3': 'Phương án 3',
      'OPT_4': 'Phương án 4',
      'OPT_5': 'Phương án 5',
    }
    
    // Nếu có trong map, trả về giá trị từ map
    if (textMap[code]) {
      return textMap[code]
    }
    
    // Nếu là YES_NO nhưng không có trong map
    if (actualVotingMethod === VotingMethod.YES_NO) {
      return code
    }
    
    // Mặc định cho MULTIPLE_CHOICE
    return code.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  useEffect(() => {
    if (open) {
      if (option) {
        // Chế độ edit: giữ nguyên giá trị
        form.setFieldsValue({
          ...option,
          resolutionId: option.resolutionId
        })
      } else {
        // Chế độ tạo mới: tự động sinh giá trị mặc định
        const newCode = generateOptionCode()
        const newValue = generateOptionValue(newCode)
        const newText = generateOptionText(newCode)
        
        console.log('🔄 Auto-generating option:')
        console.log('  Code:', newCode)
        console.log('  Value:', newValue)
        console.log('  Text:', newText)
        
        form.setFieldsValue({
          resolutionId,
          optionCode: newCode,
          optionValue: newValue,
          optionText: newText,
          displayOrder: (existingOptions.length || 0) + 1
        })
      }
    }
  }, [open, option, resolutionId, form, existingOptions, actualVotingMethod])

  const onFinish = async (values: any) => {
    try {
      console.log('🎯 Submitting option data:', values)
      console.log('🎯 Voting method:', actualVotingMethod)
      
      // Validate dữ liệu trước khi gửi
      if (actualVotingMethod === VotingMethod.YES_NO) {
        console.log('🔍 Validating YES/NO option...')
        // Đảm bảo giá trị phù hợp với YES_NO
        if (!['YES', 'NO', 'ABSTAIN'].includes(values.optionValue)) {
          console.warn('⚠️ YES/NO option value should be YES, NO, or ABSTAIN')
        }
      }

      if (isEdit && option) {
        await updateOption({
          id: option.id,
          ...values
        })
      } else {
        await createOption(values)
      }
      onSuccess()
      form.resetFields()
    } catch (error: any) {
      console.error('❌ Error submitting option:', error)
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const handleCodeChange = (value: string) => {
    // Khi mã thay đổi, tự động gợi ý giá trị và tên hiển thị
    const newValue = generateOptionValue(value)
    const newText = generateOptionText(value)
    
    console.log('🔄 Code changed:', { value, newValue, newText })
    
    form.setFieldsValue({
      optionValue: newValue,
      optionText: newText
    })
  }

  // ✅ Options cho YES/NO select - SỬA LẠI
  const yesNoOptions = useMemo(() => [
    { value: 'YES', label: 'Đồng ý (YES)', valueText: 'YES' }, // ✅ SỬA: 'YES' thay vì 'yes'
    { value: 'NO', label: 'Không đồng ý (NO)', valueText: 'NO' }, // ✅ SỬA: 'NO' thay vì 'no'
    { value: 'ABSTAIN', label: 'Trắng/Bỏ phiếu (ABSTAIN)', valueText: 'ABSTAIN' }, // ✅ SỬA
  ], [])

  const handleYesNoChange = (value: string) => {
    const selectedOption = yesNoOptions.find(opt => opt.value === value)
    if (selectedOption) {
      console.log('🔄 YES/NO option selected:', selectedOption)
      
      form.setFieldsValue({
        optionCode: value,
        optionValue: selectedOption.valueText, // ✅ Sẽ là 'YES', 'NO', 'ABSTAIN'
        optionText: selectedOption.label.split(' (')[0] // Lấy phần trước dấu (
      })
    }
  }

  const getVotingMethodText = (method: VotingMethod) => {
    const texts = {
      [VotingMethod.YES_NO]: 'Có/Không',
      [VotingMethod.MULTIPLE_CHOICE]: 'Nhiều lựa chọn',
      [VotingMethod.RANKING]: 'Xếp hạng'
    }
    return texts[method] || 'Nhiều lựa chọn'
  }

  return (
    <Modal
      title={isEdit ? 'Cập nhật Phương án' : 'Thêm Phương án Bỏ phiếu'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="resolutionId" hidden>
          <Input type="hidden" />
        </Form.Item>

        {/* Thông báo phương thức bỏ phiếu */}
        <Alert
          message={`Phương thức bỏ phiếu: ${getVotingMethodText(actualVotingMethod)}`}
          description={
            actualVotingMethod === VotingMethod.YES_NO 
              ? 'Sử dụng YES, NO, ABSTAIN cho mã và giá trị phương án'
              : 'Sử dụng OPT_1, OPT_2... cho mã phương án'
          }
          type="info"
          showIcon
          className="mb-4"
        />

        {/* ✅ PHẦN MÃ PHƯƠNG ÁN - SELECT CHO YES/NO, INPUT CHO MULTIPLE CHOICE */}
        {actualVotingMethod === VotingMethod.YES_NO && !isEdit ? (
          <Form.Item
            label="Loại phương án"
            name="optionCode"
            rules={[{ required: true, message: 'Vui lòng chọn loại phương án' }]}
          >
            <Select 
              placeholder="Chọn loại phương án"
              onChange={handleYesNoChange}
            >
              {yesNoOptions.map(opt => (
                <Option key={opt.value} value={opt.value} disabled={existingOptions.some(e => e.optionCode === opt.value)}>
                  {opt.label} {existingOptions.some(e => e.optionCode === opt.value) && '(Đã tồn tại)'}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            label="Mã phương án"
            name="optionCode"
            rules={[
              { required: true, message: 'Vui lòng nhập mã phương án' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ được chứa chữ hoa, số, - và _' },
            ]}
          >
            <Input 
              placeholder={actualVotingMethod === VotingMethod.YES_NO ? "YES, NO, ABSTAIN" : "OPT_1, OPT_2..."}
              onChange={(e) => handleCodeChange(e.target.value)}
            />
          </Form.Item>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* ✅ GIÁ TRỊ PHƯƠNG ÁN - CHO PHÉP CHỈNH SỬA */}
          <Form.Item
            label="Giá trị phương án"
            name="optionValue"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị phương án' },
            ]}
          >
            <Input 
              placeholder={
                actualVotingMethod === VotingMethod.YES_NO 
                  ? "YES, NO, ABSTAIN" 
                  : "option_1, option_2..."
              } 
            />
          </Form.Item>

          <Form.Item
            label="Thứ tự hiển thị"
            name="displayOrder"
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="1"
            />
          </Form.Item>
        </div>

        {/* ✅ TÊN HIỂN THỊ - CHO PHÉP CHỈNH SỬA */}
        <Form.Item
          label="Tên hiển thị"
          name="optionText"
          rules={[
            { required: true, message: 'Vui lòng nhập tên hiển thị' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
          ]}
        >
          <Input 
            placeholder={
              actualVotingMethod === VotingMethod.YES_NO 
                ? "Đồng ý, Không đồng ý, Trắng phiếu" 
                : "Phương án 1, Phương án A..."
            } 
          />
        </Form.Item>

        <Form.Item
          label="Mô tả chi tiết"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả chi tiết về phương án bỏ phiếu"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending} 
            block 
            size="large"
          >
            {isEdit ? 'Cập nhật' : 'Thêm'} Phương án
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}