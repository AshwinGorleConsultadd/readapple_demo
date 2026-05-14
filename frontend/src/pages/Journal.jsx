import { useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import JournalEntryCard from '../components/journal/JournalEntryCard'
import AddJournalModal from '../components/journal/AddJournalModal'
import { useJournal } from '../hooks/useJournal'

export default function Journal() {
  const { entries, loading, fetchEntries, addEntry } = useJournal()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const addButton = (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-1 text-[#E24B4A] font-medium text-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Add
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Journal" right={addButton} />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#E24B4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm">No journal entries yet.</p>
            <p className="text-xs mt-1">Tap + Add or use the voice assistant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => <JournalEntryCard key={entry._id} entry={entry} />)}
          </div>
        )}
      </div>
      {showModal && (
        <AddJournalModal
          onClose={() => setShowModal(false)}
          onSave={async (text) => {
            const entry = await addEntry(text)
            return entry
          }}
        />
      )}
    </div>
  )
}
