'use client'

import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  List,
  Tag,
  Button,
  Space,
  Avatar,
  Alert,
  Spin,
  Empty,
  Dropdown,
  message,
  Typography,
  Badge,
  Tooltip,
  Grid,
  Drawer
} from 'antd'
import {
  UserOutlined,
  LikeOutlined,
  LikeFilled,
  CrownOutlined,
  MessageOutlined,
  FireOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useMeetingQuestions } from '@/hooks/question/useMeetingQuestions'
import { useTopUpvotedQuestions } from '@/hooks/question/useTopUpvotedQuestions'
import { useCreateQuestionWithVerification } from '@/hooks/question/useCreateQuestionWithVerification'
import { useUpvoteQuestion } from '@/hooks/question/useUpvoteQuestion'
import { CreateQuestionRequest, Question, QuestionPriority, QuestionType } from '@/types/question.type'
import QuestionForm from './QuestionForm'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid

interface SelectedQuestionsTabProps {
  meetingId: number
  verificationCode: string
  shareholderInfo: any
}

export default function SelectedQuestionsTab({
  meetingId,
  verificationCode,
  shareholderInfo
}: SelectedQuestionsTabProps) {
  const screens = useBreakpoint()
  const [questionDropdownOpen, setQuestionDropdownOpen] = useState(false)
  const [questionDrawerOpen, setQuestionDrawerOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [upvotingQuestions, setUpvotingQuestions] = useState<Set<number>>(new Set())

  // Hook for all meeting questions
  const { 
    data: allMeetingQuestions, 
    isLoading: meetingQuestionsLoading 
  } = useMeetingQuestions(meetingId)

  // Hook for top questions
  const { 
    data: topQuestions, 
    isLoading: topQuestionsLoading 
  } = useTopUpvotedQuestions({
    meetingId,
    limit: 10
  })

  // Hook for creating question
  const { mutateAsync: createQuestion, isPending: creatingQuestion } = useCreateQuestionWithVerification()

  // Hook for upvoting question
  const { mutateAsync: upvoteQuestion } = useUpvoteQuestion()

  // Filter selected questions
  const selectedQuestions = allMeetingQuestions?.filter((question: Question) => question.isSelected) || []

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      message.error('Vui lòng nhập nội dung câu hỏi')
      return
    }

    try {
      const questionCode = `Q${new Date().getTime().toString().slice(-4)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      
      const payload: CreateQuestionRequest = {
        meetingId,
        verificationCode,
        questionCode,
        questionText: questionText.trim(),
        questionType: QuestionType.GENERAL,
        priority: QuestionPriority.LOW
      }
      
      await createQuestion(payload)
      message.success('Đặt câu hỏi thành công!')
      setQuestionText('')
      setQuestionDropdownOpen(false)
      setQuestionDrawerOpen(false)
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi đặt câu hỏi')
    }
  }

  const handleUpvote = async (questionId: number) => {
    if (!shareholderInfo?.id) {
      message.error('Vui lòng đăng nhập để upvote câu hỏi')
      return
    }

    setUpvotingQuestions(prev => new Set(prev).add(questionId))

    try {
      await upvoteQuestion({
        questionId,
        shareholderId: shareholderInfo.id
      })
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Upvote thất bại')
    } finally {
      setUpvotingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const getQuestionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'GENERAL': 'blue',
      'FINANCIAL': 'green',
      'OPERATIONAL': 'orange',
      'STRATEGIC': 'purple',
      'OTHER': 'gray'
    }
    return colors[type] || 'default'
  }

  const getQuestionStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'orange',
      'UNDER_REVIEW': 'blue',
      'ANSWERED': 'green',
      'REJECTED': 'red',
      'ARCHIVED': 'gray'
    }
    return colors[status] || 'default'
  }

  const getQuestionStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'PENDING': 'Chờ trả lời',
      'UNDER_REVIEW': 'Đang xem xét',
      'ANSWERED': 'Đã trả lời',
      'REJECTED': 'Từ chối',
      'ARCHIVED': 'Lưu trữ'
    }
    return texts[status] || status
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleString('vi-VN')
    } catch (error) {
      return dateString
    }
  }

  // Kiểm tra xem câu hỏi có đang được upvote không
  const isUpvoting = (questionId: number) => upvotingQuestions.has(questionId)

  const QuestionFormComponent = (
    <QuestionForm
      questionText={questionText}
      setQuestionText={setQuestionText}
      creatingQuestion={creatingQuestion}
      onSubmit={handleSubmitQuestion}
      onCancel={() => {
        setQuestionDropdownOpen(false)
        setQuestionDrawerOpen(false)
      }}
    />
  )

  if (topQuestionsLoading) {
    return (
      <div className="text-center py-4">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        {/* Cột 6 - Câu hỏi được chọn */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                <Space>
                  <CrownOutlined className="text-yellow-600" />
                  <span className="text-base md:text-lg">🏆 Câu Hỏi Được Chọn ({selectedQuestions.length})</span>
                </Space>
                {screens.xs ? (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setQuestionDrawerOpen(true)}
                    size="small"
                  >
                    Đặt Câu Hỏi
                  </Button>
                ) : (
                  <Dropdown
                    open={questionDropdownOpen}
                    onOpenChange={setQuestionDropdownOpen}
                    dropdownRender={() => QuestionFormComponent}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <Button 
                      type="primary" 
                      icon={<MessageOutlined />}
                      size="middle"
                    >
                      Đặt Câu Hỏi
                    </Button>
                  </Dropdown>
                )}
              </div>
            }
            className="h-full"
          >
            {meetingQuestionsLoading ? (
              <div className="text-center py-4">
                <Spin />
              </div>
            ) : selectedQuestions.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={selectedQuestions}
                renderItem={(question: Question) => (
                  <List.Item
                    key={question.id}
                    actions={[
                      <Tooltip key="upvote" title="Upvote câu hỏi này">
                        <Button 
                          type="text" 
                          icon={isUpvoting(question.id) ? <Spin size="small" /> : <LikeOutlined />}
                          onClick={() => handleUpvote(question.id)}
                          disabled={isUpvoting(question.id)}
                          style={{ color: '#1890ff' }}
                          size={screens.xs ? "small" : "middle"}
                        >
                          <Text strong>{question.upvoteCount || 0}</Text>
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space direction="vertical" size="small" className="w-full">
                          <Text strong className={screens.xs ? 'text-base' : 'text-lg'}>
                            {question.questionText}
                          </Text>
                          <Space wrap size={[4, 8]}>
                            <Text type="secondary" className="text-xs md:text-sm">
                              👤 {question.shareholder?.fullName} 
                              ({question.shareholder?.shareholderCode})
                            </Text>
                            <Tag color="gold" icon={<CrownOutlined />} className="text-xs">
                              Được chọn
                            </Tag>
                          </Space>
                        </Space>
                      }
                      description={
                        question.answerText ? (
                          <div className="mt-3">
                            <Alert
                              message={
                                <Space wrap size={[4, 8]}>
                                  <Text strong className="text-xs md:text-sm">Trả lời:</Text>
                                  <Text type="secondary" className="text-xs">
                                    bởi {question.answeredBy || 'Ban tổ chức'}
                                  </Text>
                                  {question.answeredAt && (
                                    <Text type="secondary" className="text-xs">
                                      • {formatDateTime(question.answeredAt)}
                                    </Text>
                                  )}
                                </Space>
                              }
                              description={
                                <Paragraph className="!mb-0 !mt-2 text-sm">
                                  {question.answerText}
                                </Paragraph>
                              }
                              type="success"
                              showIcon={false}
                              className="bg-green-50 border-green-200"
                            />
                          </div>
                        ) : (
                          <div className="mt-2 text-xs md:text-sm">
                            Đang chờ trả lời
                          </div>
                        )
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="Chưa có câu hỏi được chọn"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />}
                  onClick={() => screens.xs ? setQuestionDrawerOpen(true) : setQuestionDropdownOpen(true)}
                  size={screens.xs ? "small" : "middle"}
                >
                  Đặt Câu Hỏi Đầu Tiên
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        {/* Cột 4 - Top câu hỏi được quan tâm */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" className="w-full" size="middle">
            <Card 
              title={
                <Space>
                  <FireOutlined className="text-red-500" />
                  <span className="text-base md:text-lg">Top Câu Hỏi</span>
                </Space>
              }
            >
              <List
                size="small"
                dataSource={topQuestions?.slice(0, 5) || []}
                renderItem={(question: any, index) => (
                  <List.Item
                    actions={[
                      <Tooltip key="upvote" title="Upvote câu hỏi này">
                        <Button 
                          type="text" 
                          size="small"
                          icon={isUpvoting(question.id) ? <Spin size="small" /> : <LikeOutlined />}
                          onClick={() => handleUpvote(question.id)}
                          disabled={isUpvoting(question.id)}
                          style={{ 
                            color: '#1890ff',
                            padding: '0 4px',
                            height: 'auto'
                          }}
                        >
                          <Text strong style={{ fontSize: 12 }}>{question.upvoteCount || 0}</Text>
                        </Button>
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={index + 1} size="small">
                          <Avatar 
                            size="small" 
                            style={{ 
                              backgroundColor: index < 3 ? 
                                index === 0 ? '#fff566' : 
                                index === 1 ? '#f0f0f0' : '#ffd591' : '#d6e4ff',
                              width: screens.xs ? 24 : 32,
                              height: screens.xs ? 24 : 32
                            }}
                          />
                        </Badge>
                      }
                      title={
                        <Text 
                          strong 
                          style={{ fontSize: screens.xs ? 12 : 13 }} 
                          className="line-clamp-2"
                        >
                          {question.questionText}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: screens.xs ? 10 : 11 }}>
                            👤 {question.shareholder?.fullName}
                          </Text>
                          
                          {/* Hiển thị câu trả lời nếu có */}
                          {question.answerText && (
                            <div style={{ marginTop: 4 }}>
                              <div style={{ 
                                padding: 6, 
                                backgroundColor: '#f6ffed', 
                                border: '1px solid #b7eb8f',
                                borderRadius: 4,
                                fontSize: screens.xs ? 10 : 11
                              }}>
                                <Text strong style={{ fontSize: screens.xs ? 10 : 11, color: '#389e0d' }}>
                                  Trả lời: 
                                </Text>
                                <Text style={{ fontSize: screens.xs ? 10 : 11, marginLeft: 4 }} className="line-clamp-2">
                                  {question.answerText}
                                </Text>
                                {question.answeredBy && (
                                  <Text type="secondary" style={{ fontSize: screens.xs ? 9 : 10, display: 'block', marginTop: 2 }}>
                                    - {question.answeredBy}
                                  </Text>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Hiển thị trạng thái nếu chưa có câu trả lời */}
                          {!question.answerText && (
                            <Text type="secondary" style={{ fontSize: screens.xs ? 9 : 10, fontStyle: 'italic' }}>
                              Đang chờ trả lời...
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Drawer cho mobile */}
      <Drawer
        title="Đặt câu hỏi mới"
        placement="bottom"
        open={questionDrawerOpen}
        onClose={() => setQuestionDrawerOpen(false)}
        height="auto"
        style={{"padding": '16px'}}
      >
        {QuestionFormComponent}
      </Drawer>
    </>
  )
}