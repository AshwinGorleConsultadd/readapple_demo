import client from './client'

export const transcribeAndAnalyse = (audioBlob, appointmentId) => {
  const form = new FormData()
  form.append('audio_file', audioBlob, 'recording.webm')
  form.append('appointment_id', appointmentId)
  return client.post('/conversation-analysis/transcribe-and-analyse', form, { timeout: 180000 })
}

export const analyseTranscript = (transcript, appointmentId) =>
  client.post('/conversation-analysis/analyse-transcript', { transcript, appointment_id: appointmentId }, { timeout: 180000 })

export const getPatientNotes = (patientId) =>
  client.get(`/conversation-analysis/patient-notes/${patientId}`)

export const getPatientNoteDetail = (noteId) =>
  client.get(`/conversation-analysis/patient-notes/detail/${noteId}`)

export const getDoctorNotes = (doctorId) =>
  client.get(`/conversation-analysis/doctor-notes/${doctorId}`)

export const getDoctorNoteDetail = (noteId) =>
  client.get(`/conversation-analysis/doctor-notes/detail/${noteId}`)

export const deletePatientNote = (noteId) =>
  client.delete(`/conversation-analysis/patient-notes/detail/${noteId}`)

export const deleteDoctorNote = (noteId) =>
  client.delete(`/conversation-analysis/doctor-notes/detail/${noteId}`)
