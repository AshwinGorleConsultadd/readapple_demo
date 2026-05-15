export default function MedicationItem({ med }) {
  return (
    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
      <p className="font-semibold text-gray-800 text-sm">{med.name}</p>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
        {med.dosage && <span className="text-xs text-gray-500">💊 {med.dosage}</span>}
        {med.frequency && <span className="text-xs text-gray-500">🕐 {med.frequency}</span>}
        {med.duration && <span className="text-xs text-gray-500">📅 {med.duration}</span>}
      </div>
      {med.notes && <p className="text-xs text-gray-400 mt-1 italic">{med.notes}</p>}
    </div>
  )
}
