import axios from 'axios'
import api from '../../api'
import { useState } from 'react'

export default function AppointmentCard({ appointment, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const isPast = new Date(appointment.date) < new Date()
  const isCancelled = appointment.status === 'cancelled'

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) return
    
    setDeleting(true)
    try {
      await api.delete(`/appointments/${appointment._id}`)
      if (onDelete) onDelete(appointment._id)
    } catch (err) {
      console.error('Failed to delete appointment:', err)
      alert('Failed to delete appointment')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 ${isCancelled ? 'border-gray-100 opacity-50' : isPast ? 'border-gray-100 opacity-75' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#E24B4A] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {appointment.doctor_name?.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'DR'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{appointment.doctor_name}</p>
          <p className="text-[#E24B4A] text-xs">{appointment.doctor_specialty}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(appointment.date).toLocaleDateString('en-IN', {
              weekday: 'short', day: 'numeric', month: 'short'
            })} · {appointment.time}
          </p>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{appointment.reason}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isCancelled ? 'bg-orange-50 text-orange-500'
            : isPast ? 'bg-gray-100 text-gray-400'
            : 'bg-green-50 text-green-600'
          }`}>
            {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Upcoming'}
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
            title="Delete appointment"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {appointment.google_meet_link && !isPast && (
        <a
          href={appointment.google_meet_link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-[#E24B4A] text-[#E24B4A] text-sm font-medium active:opacity-80"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          View in Calendar
        </a>
      )}
    </div>
  )
}