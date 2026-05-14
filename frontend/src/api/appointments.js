import client from './client'

export const getAppointments = () => client.get('/appointments')
export const getAppointment = (id) => client.get(`/appointments/${id}`)
export const createAppointment = (data) => client.post('/appointments', data)
