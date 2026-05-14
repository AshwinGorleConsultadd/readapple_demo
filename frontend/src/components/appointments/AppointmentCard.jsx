export default function AppointmentCard({ appointment }) {
  const isPast = new Date(appointment.date) < new Date()
  const isCancelled = appointment.status === 'cancelled'
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
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isCancelled ? 'bg-orange-50 text-orange-500'
          : isPast ? 'bg-gray-100 text-gray-400'
          : 'bg-green-50 text-green-600'
        }`}>
          {isCancelled ? 'Cancelled' : isPast ? 'Past' : 'Upcoming'}
        </span>
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
