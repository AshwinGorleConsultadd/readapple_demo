import { useState, useEffect } from 'react'

const WORD_INTERVAL_MS = 28  // ~35 words/sec — fast but readable

function TypedText({ text }) {
  const words = text.split(' ')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= words.length) return
    const id = setTimeout(() => setCount((c) => c + 1), WORD_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [count, words.length])

  const done = count >= words.length
  return (
    <span>
      {words.slice(0, count).join(' ')}
      {!done && <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 align-middle animate-pulse" />}
    </span>
  )
}

export default function ChatBubble({ role, content, streaming }) {
  const isUser = role === 'user'
  return (
    <div className={`flex items-end gap-2 px-4 py-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#00B5C8] flex items-center justify-center text-white text-xs font-bold shrink-0">
          R
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[#E24B4A] text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {!isUser && streaming ? <TypedText text={content} /> : content}
      </div>
    </div>
  )
}
