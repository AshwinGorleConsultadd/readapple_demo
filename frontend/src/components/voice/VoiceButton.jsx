import WaveformAnimation from './WaveformAnimation'

export default function VoiceButton({ isListening, isAISpeaking, onPress, disabled }) {
  const handleClick = () => {
    if (!disabled) onPress()
  }

  if (isAISpeaking) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onPress}
          className="w-18 h-18 rounded-full bg-[#E24B4A] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{ width: 72, height: 72 }}
        >
          <WaveformAnimation active color="white" />
        </button>
        <span className="text-xs text-gray-400">Tap to stop</span>
      </div>
    )
  }

  if (isListening) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleClick}
          className="w-18 h-18 rounded-full bg-[#E24B4A] flex items-center justify-center shadow-lg animate-pulse active:scale-95 transition-transform"
          style={{ width: 72, height: 72 }}
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
          </svg>
        </button>
        <span className="text-xs text-[#E24B4A] font-medium">Listening...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={disabled}
        className="rounded-full bg-white border-2 border-[#E24B4A] flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-40"
        style={{ width: 72, height: 72 }}
      >
        <svg className="w-8 h-8 text-[#E24B4A]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2z" />
        </svg>
      </button>
      <span className="text-xs text-gray-400">Tap to speak</span>
    </div>
  )
}
