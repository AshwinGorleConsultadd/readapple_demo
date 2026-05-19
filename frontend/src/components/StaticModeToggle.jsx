export default function StaticModeToggle({ isStatic, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium ${isStatic ? 'text-[#E24B4A]' : 'text-gray-400'}`}>
        {isStatic ? 'Demo Mode' : 'Live AI'}
      </span>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          isStatic ? 'bg-[#E24B4A]' : 'bg-gray-300'
        }`}
        aria-label="Toggle demo mode"
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            isStatic ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
