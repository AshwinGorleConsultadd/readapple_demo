import { useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble'
import DoctorSuggestionCard from './DoctorSuggestionCard'
import AppointmentChatCard from './AppointmentChatCard'
import TypingIndicator from './TypingIndicator'

function ToolResultCard({ tool_used, tool_result, onBookDoctor }) {
  if (!tool_used || !tool_result) return null

  if (tool_used === 'search_doctors' && tool_result.doctors?.length > 0) {
    return (
      <div className="space-y-2">
        {tool_result.doctors.map((doc) => (
          <DoctorSuggestionCard key={doc._id} doctor={doc} onBook={onBookDoctor} />
        ))}
      </div>
    )
  }

  if (tool_used === 'book_appointment') {
    if (tool_result.booked) {
      return (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-sm text-green-700">
          ✓ Appointment confirmed with {tool_result.doctor_name} on {tool_result.date} at {tool_result.time}
          {tool_result.meet_link && (
            <a href={tool_result.meet_link} target="_blank" rel="noreferrer"
              className="block mt-1 text-[#E24B4A] underline text-xs">
              Join Google Meet
            </a>
          )}
        </div>
      )
    }
    if (tool_result.conflict) {
      return (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 text-sm text-orange-700">
          ⚠️ Slot taken — you already have an appointment with {tool_result.conflicting_doctor} on {tool_result.date} at {tool_result.time}. Please pick a different time.
        </div>
      )
    }
  }

  if (tool_used === 'cancel_appointment') {
    return (
      <div className={`border rounded-2xl px-4 py-3 text-sm ${
        tool_result.cancelled
          ? 'bg-orange-50 border-orange-100 text-orange-700'
          : 'bg-gray-50 border-gray-100 text-gray-500'
      }`}>
        {tool_result.cancelled
          ? `✗ Appointment with ${tool_result.doctor_name} on ${tool_result.date} at ${tool_result.time} cancelled.`
          : tool_result.message || 'Could not find that appointment.'}
      </div>
    )
  }

  if (tool_used === 'get_appointments' && tool_result.appointments?.length > 0) {
    return (
      <div className="space-y-2">
        {tool_result.appointments.map((appt) => (
          <AppointmentChatCard key={appt._id} appointment={appt} />
        ))}
      </div>
    )
  }

  if (tool_used === 'log_journal' && tool_result.saved) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2 text-xs text-blue-600">
        📓 Journal saved — {tool_result.summary}
      </div>
    )
  }

  return null
}

export default function ChatThread({ messages, isLoading, onBookDoctor }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Normalise: if tool_calls list exists use it, otherwise fall back to single tool_used/tool_result
  const getToolCalls = (msg) => {
    if (msg.tool_calls?.length > 0) return msg.tool_calls
    if (msg.tool_used) return [{ tool_used: msg.tool_used, tool_result: msg.tool_result }]
    return []
  }

  return (
    <div className="flex-1 overflow-y-auto py-2 space-y-1">
      {messages.map((msg) => (
        <div key={msg.id}>
          <ChatBubble role={msg.role} content={msg.content} />
          {getToolCalls(msg).length > 0 && (
            <div className="px-4 pt-1 space-y-2">
              {getToolCalls(msg).map((tc, i) => (
                <ToolResultCard
                  key={i}
                  tool_used={tc.tool_used}
                  tool_result={tc.tool_result}
                  onBookDoctor={onBookDoctor}
                />
              ))}
            </div>
          )}
        </div>
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
