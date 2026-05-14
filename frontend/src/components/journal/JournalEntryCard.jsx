import { useState } from 'react'

function PainBadge({ level }) {
  if (!level && level !== 0) return null
  const color = level <= 3 ? 'bg-green-100 text-green-700' : level <= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>Pain {level}/10</span>
}

export default function JournalEntryCard({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const p = entry.parsed_entry || {}
  const dateStr = new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

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
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-gray-300 active:text-gray-500 transition-colors shrink-0 mt-0.5"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
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
