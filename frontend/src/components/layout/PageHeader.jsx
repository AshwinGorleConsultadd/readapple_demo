export default function PageHeader({ title, right }) {
  return (
    <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[#E24B4A] font-bold text-lg tracking-tight">🍎 Redapple</span>
          {title && title !== 'Redapple' && (
            <span className="text-gray-400 text-sm">/ {title}</span>
          )}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
