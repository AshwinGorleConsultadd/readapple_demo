import { useState, useCallback } from 'react'
import { getAppointments, createAppointment } from '../api/appointments'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAppointments()
      setAppointments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addAppointment = useCallback(async (data) => {
    const res = await createAppointment(data)
    setAppointments((prev) => [res.data, ...prev])
    return res.data
  }, [])

  return { appointments, loading, fetchAppointments, addAppointment }
}
