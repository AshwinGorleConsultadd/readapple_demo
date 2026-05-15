import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDoctorNotes, useDoctorNoteDetail } from '../hooks/useNotes'
import DoctorNoteCard from '../components/notes/DoctorNoteCard'
import DoctorNoteDetail from '../components/notes/DoctorNoteDetail'

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-teal-600 font-medium text-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}

function NoteDetailPage({ doctorId, noteId }) {
  const navigate = useNavigate()
  const { note, loading } = useDoctorNoteDetail(noteId)

  return (
    <div className="flex flex-col min-h-screen bg-teal-50">
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <BackButton onClick={() => navigate(`/doctor-notes/${doctorId}`)} />
          <span className="text-sm font-semibold text-gray-700">Clinical Note</span>
          <div className="w-12" />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : note ? (
          <DoctorNoteDetail note={note} />
        ) : (
          <p className="text-center text-gray-400 text-sm py-16">Note not found.</p>
        )}
      </div>
    </div>
  )
}

export default function DoctorNotes() {
  const { doctorId, noteId } = useParams()
  const navigate = useNavigate()
  const { notes: fetchedNotes, loading } = useDoctorNotes(doctorId)
  const [notes, setNotes] = useState([])

  useEffect(() => { setNotes(fetchedNotes) }, [fetchedNotes])

  const handleDelete = (deletedId) => setNotes((prev) => prev.filter((n) => n._id !== deletedId))

  if (noteId) return <NoteDetailPage doctorId={doctorId} noteId={noteId} />

  return (
    <div className="flex flex-col min-h-screen bg-teal-50">
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <BackButton onClick={() => navigate(-1)} />
          <span className="text-sm font-semibold text-gray-700">Clinical Notes</span>
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Doctor View</span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 px-6">
            <div className="text-4xl mb-3">🏥</div>
            <p className="text-sm">No clinical notes for this doctor yet.</p>
            <p className="text-xs mt-1">Start a conversation recording after an appointment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => <DoctorNoteCard key={n._id} note={n} doctorId={doctorId} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  )
}
