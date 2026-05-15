import { useState, useRef, useCallback, useEffect } from 'react'
import { transcribeAndAnalyse, analyseTranscript } from '../api/conversationAnalysis'

// recordingState: 'idle' | 'recording' | 'processing' | 'transcript_ready' | 'analysing' | 'complete' | 'error'

export function useConversationRecording(appointmentId) {
  const [recordingState, setRecordingState] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [patientNotesId, setPatientNotesId] = useState(null)
  const [doctorNotesId, setDoctorNotesId] = useState(null)
  const [error, setError] = useState(null)
  const [sttFailed, setSttFailed] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioBlobRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setSttFailed(false)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        audioBlobRef.current = blob
        _submitAudio(blob)
      }
      mr.start(1000)
      mediaRecorderRef.current = mr
      setElapsedSeconds(0)
      setRecordingState('recording')
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permission and try again.')
      setRecordingState('idle')
    }
  }, [appointmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecordingState('processing')
  }, [])

  const _submitAudio = useCallback(async (blob) => {
    try {
      const res = await transcribeAndAnalyse(blob, appointmentId)
      const data = res.data
      setTranscript(data.transcript || '')
      setPatientNotesId(data.patient_notes_id)
      setDoctorNotesId(data.doctor_notes_id)
      setRecordingState('complete')
    } catch (err) {
      // STT failed — fall back to manual transcript input
      setSttFailed(true)
      setRecordingState('transcript_ready')
      setTranscript('')
    }
  }, [appointmentId])

  const submitManualTranscript = useCallback(async (text) => {
    setTranscript(text)
    setRecordingState('analysing')
    setError(null)
    try {
      const res = await analyseTranscript(text, appointmentId)
      const data = res.data
      setPatientNotesId(data.patient_notes_id)
      setDoctorNotesId(data.doctor_notes_id)
      setRecordingState('complete')
    } catch (err) {
      setError('Analysis failed. Please try again.')
      setRecordingState('transcript_ready')
    }
  }, [appointmentId])

  const reset = useCallback(() => {
    clearInterval(timerRef.current)
    setRecordingState('idle')
    setTranscript('')
    setElapsedSeconds(0)
    setPatientNotesId(null)
    setDoctorNotesId(null)
    setError(null)
    setSttFailed(false)
    audioBlobRef.current = null
    chunksRef.current = []
  }, [])

  return {
    recordingState,
    transcript,
    setTranscript,
    elapsedSeconds,
    patientNotesId,
    doctorNotesId,
    error,
    sttFailed,
    startRecording,
    stopRecording,
    submitManualTranscript,
    reset,
  }
}
