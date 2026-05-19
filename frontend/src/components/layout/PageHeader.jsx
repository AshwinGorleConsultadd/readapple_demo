import logo from '../../assets/redapple_detailed_logo.png'

export default function PageHeader({ title, right }) {
  return (
    <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Redapple" className="h-8 w-auto object-contain" />
          {title && title !== 'Redapple' && (
            <span className="text-gray-400 text-sm">/ {title}</span>
          )}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
