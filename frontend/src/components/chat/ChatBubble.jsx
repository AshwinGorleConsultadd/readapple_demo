export default function ChatBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex items-end gap-2 px-4 py-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-xs font-bold shrink-0">
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
        {content}
      </div>
    </div>
  )
}
