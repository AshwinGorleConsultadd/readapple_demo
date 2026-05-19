export default function DoctorSuggestionCard({ doctor, onBook }) {
  const stars = Math.round(doctor.rating || 0)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-2">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-[#00B5C8] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {doctor.profile_image_placeholder || doctor.name?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{doctor.name}</p>
          <p className="text-[#00B5C8] text-xs">{doctor.specialty}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-yellow-400 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span className="text-gray-400 text-xs">{doctor.rating} · {doctor.experience_years}yr exp</span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">₹{doctor.consultation_fee} · {doctor.location}</p>
        </div>
      </div>
      <button
        onClick={() => onBook(doctor)}
        className="mt-3 w-full py-2 rounded-xl bg-[#E24B4A] text-white text-sm font-medium active:opacity-80 transition-opacity"
      >
        Book Appointment
      </button>
    </div>
  )
}
