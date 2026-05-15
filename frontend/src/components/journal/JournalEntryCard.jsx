import { useState } from 'react'
import api from '../../api'

function PainBadge({ level }) {
  if (!level && level !== 0) return null
  const color = level <= 3 ? 'bg-green-100 text-green-700' : level <= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>Pain {level}/10</span>
}

export default function JournalEntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const p = entry.parsed_entry || {}
  const dateStr = new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return
    
    setDeleting(true)
    try {
      await api.delete(`/journal/${entry._id}`)
      if (onDelete) onDelete(entry._id)
    } catch (err) {
      console.error('Failed to delete journal entry:', err)
      alert('Failed to delete journal entry')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs text-gray-400 font-medium">{dateStr} · via {entry.source}</span>
            <PainBadge level={p.pain_level} />
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{p.summary}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.sleep_hours && (
              <span className="text-xs text-gray-500">😴 {p.sleep_hours}h sleep</span>
            )}
            {p.mood && (
              <span className="text-xs text-gray-500">🧠 {p.mood}</span>
            )}
            {p.energy_level && (
              <span className="text-xs text-gray-500">⚡ {p.energy_level} energy</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-300 active:text-gray-500 transition-colors shrink-0"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
            title="Delete entry"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
          {p.pain_location && <p className="text-xs text-gray-500">📍 {p.pain_location}</p>}
          {p.symptoms?.length > 0 && (
            <p className="text-xs text-gray-500">Symptoms: {p.symptoms.join(', ')}</p>
          )}
          {p.notes && <p className="text-xs text-gray-400 italic">{p.notes}</p>}
          <p className="text-xs text-gray-300 mt-1 break-words">{entry.raw_input}</p>
        </div>
      )}
    </div>
  )
}
