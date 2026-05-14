import { useState, useCallback } from 'react'
import { sendMessage, getGreeting } from '../api/conversation'

export function useConversation() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((role, content, extra = {}) => {
    setMessages((prev) => [...prev, { role, content, ...extra, id: Date.now() + Math.random() }])
  }, [])

  const loadGreeting = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getGreeting()
      const { reply_text, reply_audio_base64 } = res.data
      setMessages([{ role: 'assistant', content: reply_text, id: Date.now() }])
      return { reply_text, reply_audio_base64 }
    } catch {
      const fallback = "Hi Ashwin! I'm your Redapple health assistant. How can I help you today?"
      setMessages([{ role: 'assistant', content: fallback, id: Date.now() }])
      return { reply_text: fallback, reply_audio_base64: null }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendText = useCallback(async (text) => {
    addMessage('user', text)
    setIsLoading(true)
    try {
      const res = await sendMessage(text)
      const data = res.data
      addMessage('assistant', data.reply_text, {
        tool_used: data.tool_used,
        tool_result: data.tool_result,
        tool_calls: data.tool_calls || [],
      })
      return data
    } catch {
      addMessage('assistant', 'Sorry, something went wrong. Please try again.')
      return {}
    } finally {
      setIsLoading(false)
    }
  }, [addMessage])

  const handleVoiceResponse = useCallback((data) => {
    addMessage('user', '[Voice message]')
    addMessage('assistant', data.reply_text, {
      tool_used: data.tool_used,
      tool_result: data.tool_result,
      tool_calls: data.tool_calls || [],
    })
    return data
  }, [addMessage])

  return { messages, isLoading, loadGreeting, sendText, handleVoiceResponse, addMessage }
}
