export default function StaticModeToggle({ isStatic, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium ${isStatic ? 'text-[#00B5C8]' : 'text-gray-400'}`}>
        {isStatic ? 'CT' : 'Live AI'}
      </span>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          isStatic ? 'bg-[#00B5C8]' : 'bg-gray-300'
        }`}
        aria-label="Toggle CT mode"
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
