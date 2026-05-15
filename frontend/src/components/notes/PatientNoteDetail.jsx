import MedicationItem from './MedicationItem'
import ExerciseItem from './ExerciseItem'

function Section({ emoji, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 mb-3">
        {emoji} {title}
      </h3>
      {children}
    </div>
  )
}

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E24B4A] shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function PatientNoteDetail({ note }) {
  const n = note.notes || {}
  const date = note.appointment_date
    ? new Date(note.appointment_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E24B4A] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {note.doctor_name?.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'DR'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{note.doctor_name}</h2>
            <p className="text-gray-400 text-sm">{date}</p>
            {note.appointment_reason && (
              <p className="text-[#E24B4A] text-xs mt-0.5">{note.appointment_reason}</p>
            )}
          </div>
        </div>
      </div>

      {n.summary && (
        <Section emoji="📝" title="Summary">
          <p className="text-sm text-gray-600 leading-relaxed">{n.summary}</p>
        </Section>
      )}

      {n.symptoms_discussed?.length > 0 && (
        <Section emoji="🔴" title="Symptoms Discussed">
          <BulletList items={n.symptoms_discussed} />
        </Section>
      )}

      {n.diagnosis_or_concern && (
        <Section emoji="🏥" title="Diagnosis / Concern">
          <p className="text-sm text-gray-600">{n.diagnosis_or_concern}</p>
        </Section>
      )}

      {n.medications?.length > 0 && (
        <Section emoji="💊" title="Medications">
          <div className="space-y-2">
            {n.medications.map((med, i) => <MedicationItem key={i} med={med} />)}
          </div>
        </Section>
      )}

      {n.exercises?.length > 0 && (
        <Section emoji="🏃" title="Exercises">
          <div className="space-y-2">
            {n.exercises.map((ex, i) => <ExerciseItem key={i} exercise={ex} />)}
          </div>
        </Section>
      )}

      {n.diet_advice?.length > 0 && (
        <Section emoji="🥗" title="Diet Advice">
          <BulletList items={n.diet_advice} />
        </Section>
      )}

      {n.tasks_assigned?.length > 0 && (
        <Section emoji="✅" title="Tasks For You">
          <BulletList items={n.tasks_assigned} />
        </Section>
      )}

      {n.things_to_avoid?.length > 0 && (
        <Section emoji="⚠️" title="Things To Avoid">
          <BulletList items={n.things_to_avoid} />
        </Section>
      )}

      {n.doctor_will_provide?.length > 0 && (
        <Section emoji="📬" title="Doctor Will Provide">
          <BulletList items={n.doctor_will_provide} />
        </Section>
      )}

      {n.follow_up && (
        <Section emoji="🔄" title="Follow Up">
          <p className="text-sm text-gray-600">{n.follow_up}</p>
        </Section>
      )}

      {n.additional_notes && (
        <Section emoji="📋" title="Additional Notes">
          <p className="text-sm text-gray-600">{n.additional_notes}</p>
        </Section>
      )}
    </div>
  )
}
