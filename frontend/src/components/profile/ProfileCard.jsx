export default function ProfileCard({ profile }) {
  if (!profile) return null
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-2xl font-bold">
            {profile.name?.slice(0, 1)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500 text-sm">{profile.age} years · {profile.gender}</p>
            <p className="text-gray-400 text-xs">{profile.location}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Blood Group</p>
            <p className="font-semibold text-gray-800">{profile.blood_group}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Phone</p>
            <p className="font-semibold text-gray-800 text-xs">{profile.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Health Conditions</h3>
        <div className="flex flex-wrap gap-2">
          {profile.health_conditions?.map((c) => (
            <span key={c} className="bg-red-50 text-[#E24B4A] text-xs px-3 py-1 rounded-full font-medium">{c}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Medications</h3>
        <div className="flex flex-wrap gap-2">
          {profile.current_medications?.map((m) => (
            <span key={m} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">{m}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Allergies</h3>
        <div className="flex flex-wrap gap-2">
          {profile.allergies?.map((a) => (
            <span key={a} className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">{a}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-2">Emergency Contact</h3>
        <p className="text-sm font-medium text-gray-800">{profile.emergency_contact?.name}</p>
        <p className="text-sm text-gray-500">{profile.emergency_contact?.phone}</p>
      </div>
    </div>
  )
}
