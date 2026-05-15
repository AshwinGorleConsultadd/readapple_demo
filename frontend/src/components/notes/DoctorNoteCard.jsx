import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteDoctorNote } from '../../api/conversationAnalysis'

export default function DoctorNoteCard({ note, doctorId, onDelete }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const n = note.notes || {}
  const rxCount = n.prescriptions?.length || 0
  const pendingCount = n.pending_actions?.length || 0
  const date = note.appointment_date
    ? new Date(note.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this clinical note?')) return
    setDeleting(true)
    try {
      await deleteDoctorNote(note._id)
      onDelete?.(note._id)
    } catch (err) {
      console.error('Failed to delete note:', err)
      alert('Failed to delete note.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all active:scale-[0.99]"
      onClick={() => navigate(`/doctor-notes/${doctorId}/${note._id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {note.patient_name?.slice(0, 2).toUpperCase() || 'PT'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">Patient: {note.patient_name}</p>
          <p className="text-teal-600 text-xs">{date}</p>
          {n.chief_complaint && (
            <p className="text-gray-400 text-xs mt-1 truncate">Chief: {n.chief_complaint}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50 p-1 shrink-0"
          title="Delete note"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {(rxCount > 0 || pendingCount > 0) && (
        <div className="mt-3 flex gap-2">
          {rxCount > 0 && (
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
              💊 {rxCount} Rx
            </span>
          )}
          {pendingCount > 0 && (
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
              ⏳ {pendingCount} Pending
            </span>
          )}
        </div>
      )}
    </div>
  )
}
