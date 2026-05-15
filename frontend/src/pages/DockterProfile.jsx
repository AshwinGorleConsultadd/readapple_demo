import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDockter } from '../api/dockters'

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-teal-600 font-medium text-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  )
}

export default function DockterProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDockter(id)
      .then((res) => setDoctor(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="flex flex-col min-h-screen bg-teal-50">
      {/* Header */}
      <header className="sticky top-0 bg-white z-40 border-b border-gray-100">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <BackButton onClick={() => navigate(-1)} />
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            Doctor Profile
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !doctor ? (
          <div className="text-center py-16 text-gray-400 text-sm">Doctor not found.</div>
        ) : (
          <div className="space-y-4">
            {/* Identity card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {doctor.profile_image_placeholder || doctor.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{doctor.name}</h2>
                  <p className="text-teal-600 text-sm font-medium">{doctor.specialty}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {doctor.rating && <StarRating rating={doctor.rating} />}
                    {doctor.rating && (
                      <span className="text-gray-400 text-xs">
                        {doctor.rating} · {doctor.reviews_count} reviews
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{doctor.location}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-teal-50 rounded-xl p-3">
                  <p className="text-xs text-teal-500">Experience</p>
                  <p className="font-semibold text-gray-800">{doctor.experience_years} years</p>
                </div>
                <div className="bg-teal-50 rounded-xl p-3">
                  <p className="text-xs text-teal-500">Consultation Fee</p>
                  <p className="font-semibold text-gray-800">₹{doctor.consultation_fee}</p>
                </div>
              </div>
            </div>

            {/* About */}
            {doctor.about && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{doctor.about}</p>
              </div>
            )}

            {/* Sub-specialties */}
            {doctor.sub_specialties?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Sub-specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.sub_specialties.map((s) => (
                    <span key={s} className="bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords / Conditions treated */}
            {doctor.keywords?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Conditions Treated</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.keywords.map((k) => (
                    <span key={k} className="bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-100 font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {doctor.languages?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((l) => (
                    <span key={l} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {doctor.availability?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-3">Available Days</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.availability.map((day) => (
                    <span key={day} className="bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full border border-teal-100 font-medium">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            <button
              onClick={() => navigate(`/doctor-notes/${doctor._id}`)}
              className="w-full py-3 px-4 bg-white border border-teal-200 rounded-xl flex items-center justify-between text-sm font-medium text-teal-700"
            >
              <span className="flex items-center gap-2">🏥 Clinical Notes</span>
              <span className="text-teal-400">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
