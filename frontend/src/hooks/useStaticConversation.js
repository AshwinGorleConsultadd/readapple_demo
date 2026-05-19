import { useState, useRef, useCallback } from 'react'
import script from '../data/static_conversation.json'
import client from '../api/client'

const CONVERSATION = script.conversation

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchTTS(text) {
  try {
    const res = await client.post('/tools/tts', { text })
    return res.data.audio_base64 || null
  } catch {
    return null
  }
}

function playAudioAsync(base64Audio, text) {
  return new Promise((resolve) => {
    if (base64Audio) {
      try {
        const bytes = atob(base64Audio)
        const arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        const blob = new Blob([arr], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => { URL.revokeObjectURL(url); resolve(audio) }
        audio.onerror = () => { URL.revokeObjectURL(url); _browserTTS(text, resolve) }
        audio.play().catch(() => { URL.revokeObjectURL(url); _browserTTS(text, resolve) })
        return audio
      } catch {
        _browserTTS(text, resolve)
      }
    } else {
      _browserTTS(text, resolve)
    }
  })
}

function _browserTTS(text, resolve) {
  if (!window.speechSynthesis || !text) { resolve(null); return }
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-US'
  utt.rate = 0.95
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(
    (v) => v.lang.startsWith('en') && /female|woman|samantha|karen|victoria|moira/i.test(v.name)
  ) || voices.find((v) => v.lang.startsWith('en'))
  if (preferred) utt.voice = preferred
  utt.onend = () => resolve(null)
  utt.onerror = () => resolve(null)
  window.speechSynthesis.speak(utt)
}

async function executeToolCall(toolCall) {
  if (!toolCall) return null
  const { type, params } = toolCall
  try {
    if (type === 'search_doctors') {
      const res = await client.post('/tools/search-doctors', params)
      return { tool_used: 'search_doctors', tool_result: res.data }
    }
    if (type === 'book_appointment') {
      const res = await client.post('/tools/book-appointment', params)
      return { tool_used: 'book_appointment', tool_result: res.data }
    }
    if (type === 'log_journal') {
      const res = await client.post('/tools/log-journal', params)
      return { tool_used: 'log_journal', tool_result: res.data }
    }
    if (type === 'cancel_appointment') {
      const res = await client.post('/tools/cancel-appointment', params)
      return { tool_used: 'cancel_appointment', tool_result: res.data }
    }
  } catch (err) {
    console.error('[Static] tool call failed:', type, err)
    return null
  }
  return null
}

export function useStaticConversation({ addMessage, clearMessages, voiceEnabled }) {
  const [isStaticLoading, setIsStaticLoading] = useState(false)
  const [waitingForUser, setWaitingForUser] = useState(false)
  const stepRef = useRef(0)
  const currentAudioRef = useRef(null)
  const runningRef = useRef(false)

  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      try { currentAudioRef.current.pause() } catch {}
      currentAudioRef.current = null
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }, [])

  const advanceAISteps = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    setWaitingForUser(false)

    let idx = stepRef.current

    while (idx < CONVERSATION.length && CONVERSATION[idx].role === 'ai') {
      const step = CONVERSATION[idx]
      idx++
      stepRef.current = idx

      // Show typing indicator while we fetch TTS and execute tool in parallel
      setIsStaticLoading(true)

      const [audio_b64, toolEntry] = await Promise.all([
        voiceEnabled ? fetchTTS(step.text) : Promise.resolve(null),
        step.tool_call ? executeToolCall(step.tool_call) : Promise.resolve(null),
      ])

      setIsStaticLoading(false)

      // Add message with streaming flag — bubble appears with typing animation
      const extra = toolEntry
        ? { tool_calls: [toolEntry], tool_used: toolEntry.tool_used, tool_result: toolEntry.tool_result }
        : {}
      addMessage('assistant', step.text, { ...extra, streaming: true })

      // Play audio (awaited so consecutive steps don't overlap)
      if (voiceEnabled) {
        const audioObj = await playAudioAsync(audio_b64, step.text)
        currentAudioRef.current = audioObj
      }

      // Natural pause between back-to-back AI steps
      if (idx < CONVERSATION.length && CONVERSATION[idx].role === 'ai') {
        await delay(400)
      }
    }

    runningRef.current = false

    if (idx < CONVERSATION.length && CONVERSATION[idx].role === 'user') {
      setWaitingForUser(true)
    }
  }, [addMessage, voiceEnabled])

  const startStaticConversation = useCallback(() => {
    stopCurrentAudio()
    runningRef.current = false
    stepRef.current = 0
    clearMessages()
    setIsStaticLoading(false)
    setWaitingForUser(false)
    setTimeout(() => advanceAISteps(), 150)
  }, [clearMessages, advanceAISteps, stopCurrentAudio])

  const handleUserSpoke = useCallback(() => {
    const idx = stepRef.current
    if (idx >= CONVERSATION.length || CONVERSATION[idx].role !== 'user') return

    stopCurrentAudio()
    addMessage('user', CONVERSATION[idx].text)
    stepRef.current = idx + 1
    setWaitingForUser(false)
    advanceAISteps()
  }, [addMessage, advanceAISteps, stopCurrentAudio])

  const stopStaticConversation = useCallback(() => {
    stopCurrentAudio()
    runningRef.current = false
    setIsStaticLoading(false)
    setWaitingForUser(false)
  }, [stopCurrentAudio])

  return {
    isStaticLoading,
    waitingForUser,
    startStaticConversation,
    handleUserSpoke,
    stopStaticConversation,
  }
}
