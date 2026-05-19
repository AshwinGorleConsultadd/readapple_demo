import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useConversationRecording } from '../hooks/useConversationRecording'
import RecordingControls from '../components/conversation/RecordingControls'
import TranscriptDisplay from '../components/conversation/TranscriptDisplay'
import AnalysisLoader from '../components/conversation/AnalysisLoader'

export default function ConversationRecording() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [apptLoading, setApptLoading] = useState(true)

  const {
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
  } = useConversationRecording(appointmentId)

  useEffect(() => {
    client.get(`/appointments/${appointmentId}`)
      .then((res) => setAppointment(res.data))
      .catch(console.error)
      .finally(() => setApptLoading(false))
  }, [appointmentId])

  const doctorId = appointment?.doctor_id

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#00B5C8] font-medium text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-sm font-semibold text-gray-700">Consultation Recording</span>
          <div className="w-12" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full space-y-4">
        {/* Appointment info */}
        {!apptLoading && appointment && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00B5C8] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {appointment.doctor_name?.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'DR'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{appointment.doctor_name}</p>
                <p className="text-[#00B5C8] text-xs">{appointment.doctor_specialty}</p>
                <p className="text-gray-400 text-xs">
                  {appointment.date} · {appointment.time}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STT fallback notice */}
        {sttFailed && recordingState === 'transcript_ready' && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 text-sm text-orange-700">
            Audio transcription unavailable. Paste the conversation transcript below to generate notes.
          </div>
        )}

        {/* State: idle / recording / processing */}
        {['idle', 'recording', 'processing'].includes(recordingState) && (
          <>
            {recordingState === 'idle' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-sm text-gray-500 text-center leading-relaxed">
                The conversation will be recorded and analysed by AI to generate notes for you and your doctor.
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex justify-center">
              <RecordingControls
                recordingState={recordingState}
                elapsedSeconds={elapsedSeconds}
                onStart={startRecording}
                onStop={stopRecording}
              />
            </div>
          </>
        )}

        {/* State: transcript_ready */}
        {recordingState === 'transcript_ready' && (
          <>
            <TranscriptDisplay
              transcript={transcript}
              onChange={setTranscript}
              editable={sttFailed}
            />
            <button
              onClick={() => submitManualTranscript(transcript)}
              disabled={!transcript.trim()}
              className="w-full py-3 bg-[#E24B4A] text-white rounded-2xl font-semibold text-sm disabled:opacity-40 active:opacity-80"
            >
              Generate Notes →
            </button>
          </>
        )}

        {/* State: analysing */}
        {recordingState === 'analysing' && <AnalysisLoader />}

        {/* State: complete */}
        {recordingState === 'complete' && (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto text-2xl">✅</div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Notes Generated!</p>
              <p className="text-sm text-gray-400 mt-1">Both patient and doctor notes have been saved.</p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/patient-notes')}
                className="w-full py-3 bg-[#E24B4A] text-white rounded-2xl font-semibold text-sm active:opacity-80"
              >
                View My Notes →
              </button>
              {doctorId && (
                <button
                  onClick={() => navigate(`/doctor-notes/${doctorId}`)}
                  className="w-full py-3 bg-teal-600 text-white rounded-2xl font-semibold text-sm active:opacity-80"
                >
                  View Doctor's Notes →
                </button>
              )}
              <button
                onClick={reset}
                className="w-full py-2 text-gray-400 text-sm"
              >
                Record Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
