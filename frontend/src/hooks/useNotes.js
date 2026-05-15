import { useState, useEffect } from 'react'
import { getPatientNotes, getDoctorNotes, getPatientNoteDetail, getDoctorNoteDetail } from '../api/conversationAnalysis'

export function usePatientNotes(patientId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) return
    getPatientNotes(patientId)
      .then((res) => setNotes(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [patientId])

  return { notes, loading }
}

export function useDoctorNotes(doctorId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctorId) return
    getDoctorNotes(doctorId)
      .then((res) => setNotes(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [doctorId])

  return { notes, loading }
}

export function usePatientNoteDetail(noteId) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!noteId) return
    getPatientNoteDetail(noteId)
      .then((res) => setNote(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [noteId])

  return { note, loading }
}

export function useDoctorNoteDetail(noteId) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!noteId) return
    getDoctorNoteDetail(noteId)
      .then((res) => setNote(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [noteId])

  return { note, loading }
}
