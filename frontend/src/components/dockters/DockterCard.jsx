import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function DockterCard({ dockter, onDelete }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const stars = Math.round(dockter.rating || 0)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this doctor?')) return
    
    setDeleting(true)
    try {
      await api.delete(`/api/dockters/${dockter._id}`)
      if (onDelete) onDelete(dockter._id)
    } catch (err) {
      console.error('Failed to delete doctor:', err)
      alert('Failed to delete doctor')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-teal-200 hover:shadow-md transition-all"
      onClick={() => navigate(`/dockters/${dockter._id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[#00B5C8] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {dockter.profile_image_placeholder || dockter.name?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{dockter.name}</p>
          <p className="text-[#00B5C8] text-xs font-medium">{dockter.specialty}</p>
          {dockter.rating && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-yellow-400 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
              <span className="text-gray-400 text-xs">{dockter.rating} · {dockter.experience_years}yr exp</span>
            </div>
          )}
          <p className="text-gray-400 text-xs mt-0.5">{dockter.location}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {dockter.consultation_fee && (
            <span className="text-xs font-semibold text-gray-700">₹{dockter.consultation_fee}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete() }}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
            title="Delete doctor"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {dockter.about && (
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">{dockter.about}</p>
      )}

      {dockter.availability?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {dockter.availability.map((day) => (
            <span key={day} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
              {day.slice(0, 3)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
