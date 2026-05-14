import client from './client'

export const sendMessage = (userMessage) =>
  client.post('/conversation/message', { user_message: userMessage, audio_input: false })

export const sendAudioMessage = (audioBlob) => {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  return client.post('/conversation/audio-message', form)
}

export const getGreeting = () => client.get('/conversation/greeting')
