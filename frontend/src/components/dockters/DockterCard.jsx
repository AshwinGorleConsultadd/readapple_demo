export default function DockterCard({ dockter }) {
  const stars = Math.round(dockter.rating || 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[#E24B4A] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {dockter.profile_image_placeholder || dockter.name?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{dockter.name}</p>
          <p className="text-[#E24B4A] text-xs font-medium">{dockter.specialty}</p>
          {dockter.rating && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-yellow-400 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
              <span className="text-gray-400 text-xs">{dockter.rating} · {dockter.experience_years}yr exp</span>
            </div>
          )}
          <p className="text-gray-400 text-xs mt-0.5">{dockter.location}</p>
        </div>
        {dockter.consultation_fee && (
          <span className="text-xs font-semibold text-gray-700 shrink-0">₹{dockter.consultation_fee}</span>
        )}
      </div>

      {dockter.about && (
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">{dockter.about}</p>
      )}

      {dockter.availability?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {dockter.availability.map((day) => (
            <span key={day} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
              {day.slice(0, 3)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
