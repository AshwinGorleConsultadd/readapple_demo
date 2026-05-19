import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProfile } from '../api/profile'
import { usePatientNotes, usePatientNoteDetail } from '../hooks/useNotes'
import PatientNoteCard from '../components/notes/PatientNoteCard'
import PatientNoteDetail from '../components/notes/PatientNoteDetail'

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[#00B5C8] font-medium text-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}

function NoteDetailPage({ noteId }) {
  const navigate = useNavigate()
  const { note, loading } = usePatientNoteDetail(noteId)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <BackButton onClick={() => navigate('/patient-notes')} />
          <span className="text-sm font-semibold text-gray-700">Consultation Note</span>
          <div className="w-12" />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#00B5C8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : note ? (
          <PatientNoteDetail note={note} />
        ) : (
          <p className="text-center text-gray-400 text-sm py-16">Note not found.</p>
        )}
      </div>
    </div>
  )
}

export default function PatientNotes() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const [patientId, setPatientId] = useState(null)

  useEffect(() => {
    getProfile()
      .then((res) => setPatientId(res.data?._id))
      .catch(console.error)
  }, [])

  const { notes: fetchedNotes, loading } = usePatientNotes(patientId)
  const [notes, setNotes] = useState([])

  useEffect(() => { setNotes(fetchedNotes) }, [fetchedNotes])

  const handleDelete = (deletedId) => setNotes((prev) => prev.filter((n) => n._id !== deletedId))

  if (noteId) return <NoteDetailPage noteId={noteId} />

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <BackButton onClick={() => navigate('/profile')} />
          <span className="text-sm font-semibold text-gray-700">My Notes</span>
          <div className="w-12" />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#00B5C8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 px-6">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">No consultation notes yet.</p>
            <p className="text-xs mt-1">Start a conversation recording after your appointment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => <PatientNoteCard key={n._id} note={n} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  )
}
