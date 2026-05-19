export default function TranscriptDisplay({ transcript, onChange, editable = false }) {
  if (!transcript && !editable) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Conversation Transcript
      </h3>
      {editable ? (
        <textarea
          value={transcript}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Paste or type the conversation transcript here..."
          rows={8}
          className="w-full text-sm text-gray-600 leading-relaxed resize-none border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#00B5C8]"
        />
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {transcript}
        </p>
      )}
    </div>
  )
}
