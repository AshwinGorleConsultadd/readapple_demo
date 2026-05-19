import { useState } from 'react'

export default function AddJournalModal({ onClose, onSave }) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      const entry = await onSave(text.trim())
      setSaved(entry)
    } catch {
      alert('Failed to save journal entry.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Add Journal Entry</h2>
          <button onClick={onClose} className="text-gray-400 active:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {saved ? (
          <div className="space-y-3">
            <div className="bg-green-50 rounded-2xl p-4 text-sm text-green-700">
              ✓ Journal saved successfully!
            </div>
            {saved.parsed_entry && (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                <p className="text-sm font-medium text-gray-700">Summary</p>
                <p className="text-sm text-gray-600">{saved.parsed_entry.summary}</p>
                {saved.parsed_entry.pain_level && (
                  <p className="text-xs text-gray-500">Pain: {saved.parsed_entry.pain_level}/10 · Mood: {saved.parsed_entry.mood}</p>
                )}
              </div>
            )}
            <button onClick={onClose} className="w-full py-3 rounded-2xl bg-[#E24B4A] text-white font-medium">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How are you feeling today? Describe any pain, sleep quality, mood..."
              rows={5}
              className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 resize-none focus:outline-none focus:border-[#00B5C8]"
            />
            <button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="w-full py-3 rounded-2xl bg-[#E24B4A] text-white font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
