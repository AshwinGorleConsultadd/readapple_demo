import { useState, useCallback } from 'react'
import { getJournal, createJournalEntry } from '../api/journal'

export function useJournal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getJournal()
      setEntries(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addEntry = useCallback(async (rawInput) => {
    const res = await createJournalEntry(rawInput)
    setEntries((prev) => [res.data, ...prev])
    return res.data
  }, [])

  return { entries, loading, fetchEntries, addEntry }
}
