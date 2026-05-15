export default function RecordingControls({ recordingState, elapsedSeconds, onStart, onStop }) {
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (recordingState === 'processing') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E24B4A] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500">Converting speech to text...</p>
      </div>
    )
  }

  if (recordingState === 'recording') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-[#E24B4A] opacity-25 animate-ping" />
          <button
            onClick={onStop}
            className="relative w-20 h-20 rounded-full bg-[#E24B4A] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>
        <p className="text-sm font-semibold text-[#E24B4A]">{formatTime(elapsedSeconds)}</p>
        <p className="text-xs text-gray-400">Tap to stop recording</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-gray-400 text-center px-6">
        Place your phone between you and your doctor during the consultation
      </p>
      <button
        onClick={onStart}
        className="w-20 h-20 rounded-full bg-white border-2 border-[#E24B4A] flex items-center justify-center shadow-sm active:scale-95 transition-transform hover:bg-red-50"
      >
        <svg className="w-8 h-8 text-[#E24B4A]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 15.2 14.47 17 12 17s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
        </svg>
      </button>
      <p className="text-sm text-gray-500 font-medium">Tap to Start Recording</p>
    </div>
  )
}
