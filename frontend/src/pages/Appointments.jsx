import { useEffect } from 'react'
import PageHeader from '../components/layout/PageHeader'
import AppointmentCard from '../components/appointments/AppointmentCard'
import { useAppointments } from '../hooks/useAppointments'

export default function Appointments() {
  const { appointments, loading, fetchAppointments } = useAppointments()

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleDelete = (appointmentId) => {
    // Refresh the list after deletion
    fetchAppointments()
  }

  const upcoming = appointments.filter((a) => new Date(a.date) >= new Date())
  const past = appointments.filter((a) => new Date(a.date) < new Date())

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Appointments" />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#E24B4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No appointments yet.</p>
            <p className="text-xs mt-1">Use the voice assistant to book one.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Upcoming</h3>
                <div className="space-y-3">
                  {upcoming.map((a) => <AppointmentCard key={a._id} appointment={a} onDelete={handleDelete} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Past</h3>
                <div className="space-y-3">
                  {past.map((a) => <AppointmentCard key={a._id} appointment={a} onDelete={handleDelete} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
