import { useEffect, useCallback, useState, useRef } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ChatThread from '../components/chat/ChatThread'
import VoiceButton from '../components/voice/VoiceButton'
import StaticModeToggle from '../components/StaticModeToggle'
import { useVoice } from '../hooks/useVoice'
import { useStaticConversation } from '../hooks/useStaticConversation'
import { sendMessage } from '../api/conversation'

// module-level flag so greeting audio plays at most once per browser session
let greetingAudioPlayed = false

function SpeakerToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={enabled ? 'Voice responses ON — tap to mute' : 'Voice responses OFF — tap to unmute'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        enabled
          ? 'bg-[#00B5C8] text-white'
          : 'bg-gray-100 text-gray-400'
      }`}
    >
      {enabled ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      )}
      {enabled ? 'Voice On' : 'Voice Off'}
    </button>
  )
}

export default function Home({ conversation, greetingData }) {
  const { messages, isLoading, handleVoiceResponse, addMessage, clearMessages } = conversation

  const [voiceEnabled, setVoiceEnabled] = useState(
    () => localStorage.getItem('redapple_voice') !== 'off'
  )
  const [isStaticMode, setIsStaticMode] = useState(false)
  // Ref so async callbacks can read current static mode without stale closure
  const isStaticModeRef = useRef(false)

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev
      localStorage.setItem('redapple_voice', next ? 'on' : 'off')
      if (!next && window.speechSynthesis) window.speechSynthesis.cancel()
      return next
    })
  }, [])

  const {
    isStaticLoading,
    waitingForUser,
    startStaticConversation,
    handleUserSpoke,
    stopStaticConversation,
  } = useStaticConversation({ addMessage, clearMessages, voiceEnabled })

  // Keep ref in sync so the async voice callback can check mode without stale closure
  useEffect(() => { isStaticModeRef.current = isStaticMode }, [isStaticMode])

  const handleVoiceResponseCallback = useCallback(
    (data) => {
      if (isStaticModeRef.current) return // discard live AI response during static demo
      handleVoiceResponse(data)
      if (voiceEnabled) playAudioReply(data.reply_audio_base64, data.reply_text)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleVoiceResponse, voiceEnabled]
  )

  const { isListening, isAISpeaking, transcript, startListening, stopListening, playAudioReply, cancelSpeaking } =
    useVoice({ onResponse: handleVoiceResponseCallback })

  // play greeting audio once — even if Home remounts (e.g. tab switch)
  useEffect(() => {
    if (!greetingData || greetingAudioPlayed || isStaticMode) return
    greetingAudioPlayed = true
    if (voiceEnabled) playAudioReply(greetingData.reply_audio_base64, greetingData.reply_text)
  }, [greetingData]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookDoctor = useCallback(
    async (doctor) => {
      if (isStaticMode) return // no live booking from static mode
      const text = `Book an appointment with ${doctor.name}`
      addMessage('user', text)
      try {
        const res = await sendMessage(text)
        const data = res.data
        addMessage('assistant', data.reply_text, {
          tool_used: data.tool_used,
          tool_result: data.tool_result,
        })
        if (voiceEnabled) playAudioReply(data.reply_audio_base64, data.reply_text)
      } catch {
        addMessage('assistant', 'Sorry, something went wrong trying to book that appointment.')
      }
    },
    [addMessage, playAudioReply, voiceEnabled, isStaticMode]
  )

  const handleToggleStaticMode = useCallback(() => {
    if (isStaticMode) {
      // Turn off — restore live mode
      stopStaticConversation()
      cancelSpeaking()
      clearMessages()
      setIsStaticMode(false)
      greetingAudioPlayed = false
    } else {
      // Turn on — start static demo
      cancelSpeaking()
      setIsStaticMode(true)
      startStaticConversation()
    }
  }, [isStaticMode, startStaticConversation, stopStaticConversation, cancelSpeaking, clearMessages])

  const handleVoicePress = () => {
    if (isStaticMode) {
      if (isListening) {
        // User finished speaking — stop mic and advance script
        stopListening()
        handleUserSpoke()
      } else if (!isStaticLoading && waitingForUser) {
        startListening()
      }
    } else {
      if (isAISpeaking) {
        cancelSpeaking()
      } else if (isListening) {
        stopListening()
      } else {
        startListening()
      }
    }
  }

  const voiceButtonLabel = isStaticMode
    ? (isListening ? 'Listening...' : waitingForUser ? 'Tap to Respond' : 'Please wait...')
    : undefined

  const isLoaderShowing = isStaticMode ? isStaticLoading : isLoading

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto">
      <PageHeader
        title="Redapple"
        right={
          <div className="flex items-center gap-2">
            <StaticModeToggle isStatic={isStaticMode} onToggle={handleToggleStaticMode} />
            {!isStaticMode && <SpeakerToggle enabled={voiceEnabled} onToggle={toggleVoice} />}
          </div>
        }
      />
      <ChatThread
        messages={messages}
        isLoading={isLoaderShowing}
        onBookDoctor={handleBookDoctor}
      />
      <div className="border-t border-gray-100 bg-white px-4 pt-3 pb-24">
        {!isStaticMode && transcript && (
          <div className="mb-3 bg-gray-50 rounded-xl px-4 py-2 text-sm text-gray-500 text-center">
            {transcript}
          </div>
        )}
        <div className="flex justify-center">
          <VoiceButton
            isListening={isListening}
            isAISpeaking={isStaticMode ? false : isAISpeaking}
            onPress={handleVoicePress}
            disabled={isStaticMode ? (isStaticLoading || (!waitingForUser && !isListening)) : isLoading}
            customLabel={voiceButtonLabel}
          />
        </div>
      </div>
    </div>
  )
}
