import client from './client'

export const getJournal = () => client.get('/journal')
export const createJournalEntry = (rawInput) =>
  client.post('/journal', { raw_input: rawInput, source: 'manual' })
export const getJournalSummary = () => client.get('/journal/summary')
