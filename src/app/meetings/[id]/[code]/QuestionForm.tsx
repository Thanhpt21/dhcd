import { Card, Button, Input, Grid } from 'antd'

const { TextArea } = Input
const { useBreakpoint } = Grid

interface QuestionFormProps {
  questionText: string
  setQuestionText: (text: string) => void
  creatingQuestion: boolean
  onSubmit: () => void
  onCancel: () => void
}

export default function QuestionForm({
  questionText,
  setQuestionText,
  creatingQuestion,
  onSubmit,
  onCancel
}: QuestionFormProps) {
  const screens = useBreakpoint()
  
  return (
    <Card 
      title="Đặt câu hỏi mới" 
      size="small"
      style={{ 
        width: screens.xs ? '100%' : 400,
        maxWidth: '100%'
      }}
      bodyStyle={{
        padding: screens.xs ? '12px' : '16px'
      }}
      actions={[
        <Button 
          key="cancel" 
          onClick={onCancel}
          size={screens.xs ? "small" : "middle"}
          block={screens.xs}
        >
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={creatingQuestion}
          onClick={onSubmit}
          size={screens.xs ? "small" : "middle"}
          block={screens.xs}
        >
          Gửi câu hỏi
        </Button>
      ]}
    >
      <TextArea
        rows={screens.xs ? 3 : 4}
        placeholder="Nhập nội dung câu hỏi của bạn..."
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        maxLength={500}
        showCount
        style={{
          fontSize: screens.xs ? '14px' : '16px'
        }}
      />
    </Card>
  )
}