import client from './client'

export const sendMessage = (userMessage) =>
  client.post('/conversation/message', { user_message: userMessage, audio_input: false })


export const getGreeting = () => client.get('/conversation/greeting')
