import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deletePatientNote } from '../../api/conversationAnalysis'

export default function PatientNoteCard({ note, onDelete }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const n = note.notes || {}
  const medCount = n.medications?.length || 0
  const exCount = n.exercises?.length || 0
  const date = note.appointment_date
    ? new Date(note.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this consultation note?')) return
    setDeleting(true)
    try {
      await deletePatientNote(note._id)
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
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-[#00B5C8] hover:shadow-md transition-all active:scale-[0.99]"
      onClick={() => navigate(`/patient-notes/${note._id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00B5C8] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {note.doctor_name?.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'DR'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{note.doctor_name}</p>
          <p className="text-[#00B5C8] text-xs">{date}</p>
          {n.summary && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{n.summary}</p>
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
      {(medCount > 0 || exCount > 0) && (
        <div className="mt-3 flex gap-2">
          {medCount > 0 && (
            <span className="text-xs bg-cyan-50 text-[#00B5C8] px-2 py-0.5 rounded-full">
              💊 {medCount} med{medCount > 1 ? 's' : ''}
            </span>
          )}
          {exCount > 0 && (
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
              🏃 {exCount} exercise{exCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
