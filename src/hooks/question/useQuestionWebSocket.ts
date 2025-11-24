// src/hooks/useQuestionWebSocket.ts
import { useEffect, useRef, useCallback } from 'react'
import io from 'socket.io-client'
import type { Socket } from 'socket.io-client' 
import { useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'

interface UseQuestionWebSocketProps {
  meetingId?: number
  enabled?: boolean
}

interface WebSocketEventData {
  type: string
  question?: any
  questionId?: number
  upvoteCount?: number
  timestamp: string
}

interface JoinMeetingResponse {
  meetingId: number
  success: boolean
}

interface JoinErrorResponse {
  error: string
}

export const useQuestionWebSocket = ({ 
  meetingId, 
  enabled = true 
}: UseQuestionWebSocketProps) => {
  const socketRef = useRef<any | null>(null)
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    if (!meetingId || !enabled) return

    try {
      // Kết nối WebSocket với URL mới
      socketRef.current = io(
        `${process.env.NEXT_PUBLIC_WS_URL}/questions`,
        {
          transports: ['websocket', 'polling'],
        }
      )

      // Xử lý kết nối
      socketRef.current.on('connect', () => {
        console.log('🔌 WebSocket connected to questions namespace')
        
        // Join meeting room
        socketRef.current?.emit('join-meeting-questions', meetingId)
      })

      // Xử lý khi join meeting thành công
      socketRef.current.on('joined-meeting', (data: JoinMeetingResponse) => {
        console.log(`✅ Joined meeting-${meetingId}`, data)
      })

      // Xử lý lỗi join meeting
      socketRef.current.on('join-error', (error: JoinErrorResponse) => {
        console.error('❌ Failed to join meeting:', error)
      })

      // Lắng nghe cập nhật câu hỏi
      socketRef.current.on('question-updated', (data: WebSocketEventData) => {
        console.log('📡 Nhận cập nhật câu hỏi:', data)
        
        if (!data.question) return;

        // Cập nhật cache cho top questions
        queryClient.setQueryData(
          ['top-upvoted-questions', { meetingId }],
          (oldData: any) => {
            if (!oldData) return oldData
            
            return oldData.map((question: any) => 
              question.id === data.question?.id 
                ? { 
                    ...question, 
                    ...data.question,
                    upvoteCount: data.question._count?.upvotes || question.upvoteCount
                  }
                : question
            )
          }
        )

        // Cập nhật cache cho all questions (nếu có)
        queryClient.invalidateQueries({ queryKey: ['questions'] })
        
        // Hiển thị thông báo nếu có câu trả lời mới
        if (data.question.answerText && !data.question.answeredAt) {
          message.info(`📝 Đã có câu trả lời cho câu hỏi: ${data.question.questionCode}`)
        }
      })

      // Lắng nghe câu hỏi mới
      socketRef.current.on('new-question', (data: WebSocketEventData) => {
        console.log('📡 Nhận câu hỏi mới:', data)
        
        if (!data.question) return;

        queryClient.setQueryData(
          ['top-upvoted-questions', { meetingId }],
          (oldData: any) => {
            if (!oldData) return [data.question]
            return [data.question, ...oldData].slice(0, 10) // Giữ limit 10
          }
        )

        message.info(`❓ Có câu hỏi mới: ${data.question.questionCode}`)
      })

      // Lắng nghe upvote
      socketRef.current.on('question-upvoted', (data: WebSocketEventData) => {
        console.log('📡 Nhận upvote câu hỏi:', data)
        
        if (!data.questionId || data.upvoteCount === undefined) return;

        queryClient.setQueryData(
          ['top-upvoted-questions', { meetingId }],
          (oldData: any) => {
            if (!oldData) return oldData
            
            return oldData.map((question: any) => 
              question.id === data.questionId 
                ? { ...question, upvoteCount: data.upvoteCount }
                : question
            )
          }
        )
      })

      // Lắng nghe xóa câu hỏi
      socketRef.current.on('question-deleted', (data: WebSocketEventData) => {
        console.log('📡 Nhận xóa câu hỏi:', data)
        
        if (!data.questionId) return;

        queryClient.setQueryData(
          ['top-upvoted-questions', { meetingId }],
          (oldData: any) => {
            if (!oldData) return oldData
            return oldData.filter((question: any) => question.id !== data.questionId)
          }
        )

        message.info(`🗑️ Câu hỏi đã được xóa`)
      })

      // Xử lý lỗi kết nối
      socketRef.current.on('connect_error', (error: Error) => {
        console.error('❌ WebSocket connection error:', error)
      })

      // Xử lý ngắt kết nối
      socketRef.current.on('disconnect', (reason: string) => {
        console.log('🔌 WebSocket disconnected:', reason)
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect manually
          setTimeout(() => {
            socketRef.current?.connect();
          }, 1000);
        }
      })

      // Xử lý lỗi chung
      socketRef.current.on('error', (error: Error) => {
        console.error('❌ WebSocket error:', error)
      })

    } catch (error) {
      console.error('❌ WebSocket setup error:', error)
    }
  }, [meetingId, enabled, queryClient])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (meetingId) {
        socketRef.current.emit('leave-meeting-questions', meetingId)
      }
      socketRef.current.disconnect()
      socketRef.current = null
      console.log('🔌 WebSocket disconnected manually')
    }
  }, [meetingId])

  useEffect(() => {
    if (enabled && meetingId) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [connect, disconnect, enabled, meetingId])

  return {
    isConnected: socketRef.current?.connected || false,
    disconnect,
    reconnect: connect,
  }
}