import { useState, useEffect } from 'react'

const MESSAGES = [
  'Reading the full conversation...',
  'Identifying symptoms and conditions...',
  'Extracting prescriptions and advice...',
  'Preparing your personal notes...',
  'Preparing clinical notes for the doctor...',
  'Almost done...',
]

export default function AnalysisLoader() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center animate-pulse">
        <span className="text-2xl">🍎</span>
      </div>
      <p className="text-sm font-medium text-gray-700 text-center min-h-[20px] transition-all">
        {MESSAGES[msgIndex]}
      </p>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-[#00B5C8] rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
      </div>
    </div>
  )
}
