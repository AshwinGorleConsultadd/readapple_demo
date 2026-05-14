import { useState, useRef, useCallback } from 'react'
import { sendMessage } from '../api/conversation'

export function useVoice({ onResponse } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')

  const recognitionRef = useRef(null)
  const audioRef = useRef(null)

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input requires Chrome or Safari. Please use a supported browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.finalTranscript = ''

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      if (final) recognition.finalTranscript = final
      setTranscript(final || interim)
    }

    recognition.onend = async () => {
      setIsListening(false)
      const text = recognition.finalTranscript?.trim()
      if (!text) {
        setTranscript('')
        return
      }
      setTranscript('Processing...')
      try {
        const res = await sendMessage(text)
        setTranscript('')
        if (onResponse) onResponse(res.data)
      } catch (err) {
        console.error('Message send failed:', err)
        setTranscript('')
      }
    }

    recognition.onerror = (e) => {
      setIsListening(false)
      setTranscript('')
      if (e.error !== 'no-speech') {
        console.error('Speech recognition error:', e.error)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setTranscript('')
  }, [onResponse])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const _speakWithBrowser = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    utt.rate = 1.0
    utt.pitch = 1.0
    // prefer a female voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && /female|woman|samantha|karen|victoria|moira/i.test(v.name)
    ) || voices.find((v) => v.lang.startsWith('en'))
    if (preferred) utt.voice = preferred
    setIsAISpeaking(true)
    utt.onend = () => setIsAISpeaking(false)
    utt.onerror = () => setIsAISpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [])

  const playAudioReply = useCallback((base64Audio, fallbackText) => {
    if (!base64Audio) {
      // ElevenLabs unavailable — fall back to browser TTS
      if (fallbackText) _speakWithBrowser(fallbackText)
      return
    }
    try {
      const bytes = atob(base64Audio)
      const arr = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
      const blob = new Blob([arr], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      setIsAISpeaking(true)
      audio.play().catch(() => {
        // ElevenLabs audio failed to play — fall back
        setIsAISpeaking(false)
        if (fallbackText) _speakWithBrowser(fallbackText)
      })
      audio.onended = () => { setIsAISpeaking(false); URL.revokeObjectURL(url) }
      audio.onerror = () => {
        setIsAISpeaking(false)
        if (fallbackText) _speakWithBrowser(fallbackText)
      }
    } catch (err) {
      console.error('Audio playback error:', err)
      if (fallbackText) _speakWithBrowser(fallbackText)
    }
  }, [_speakWithBrowser])

  const cancelSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setIsAISpeaking(false)
  }, [])

  return {
    isListening,
    isAISpeaking,
    transcript,
    startListening,
    stopListening,
    playAudioReply,
    cancelSpeaking,
  }
}
