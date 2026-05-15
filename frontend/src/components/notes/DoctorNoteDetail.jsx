function Section({ emoji, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 mb-3">{emoji} {title}</h3>
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
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
          {typeof item === 'string' ? item : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  )
}

export default function DoctorNoteDetail({ note }) {
  const n = note.notes || {}
  const date = note.appointment_date
    ? new Date(note.appointment_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {note.patient_name?.slice(0, 2).toUpperCase() || 'PT'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Patient: {note.patient_name}</h2>
            <p className="text-gray-400 text-sm">{date}</p>
            {note.appointment_reason && (
              <p className="text-teal-600 text-xs mt-0.5">{note.appointment_reason}</p>
            )}
          </div>
        </div>
      </div>

      {n.summary && (
        <Section emoji="🏥" title="Clinical Summary">
          <p className="text-sm text-gray-600 leading-relaxed">{n.summary}</p>
        </Section>
      )}

      {n.chief_complaint && (
        <Section emoji="🔴" title="Chief Complaint">
          <p className="text-sm text-gray-600">{n.chief_complaint}</p>
        </Section>
      )}

      {n.symptoms_reported?.length > 0 && (
        <Section emoji="📋" title="Symptoms Reported">
          <div className="space-y-2">
            {n.symptoms_reported.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-800">{s.symptom}</p>
                <div className="flex gap-4 mt-1">
                  {s.severity && <span className="text-xs text-gray-500">Severity: {s.severity}</span>}
                  {s.duration && <span className="text-xs text-gray-500">Duration: {s.duration}</span>}
                </div>
                {s.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{s.notes}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {n.patient_history_mentioned?.length > 0 && (
        <Section emoji="📜" title="Patient History Mentioned">
          <BulletList items={n.patient_history_mentioned} />
        </Section>
      )}

      {n.clinical_observations && (
        <Section emoji="👁️" title="Clinical Observations">
          <p className="text-sm text-gray-600">{n.clinical_observations}</p>
        </Section>
      )}

      {n.prescriptions?.length > 0 && (
        <Section emoji="💊" title="Prescriptions">
          <div className="space-y-2">
            {n.prescriptions.map((rx, i) => (
              <div key={i} className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                <p className="font-semibold text-gray-800 text-sm">{rx.medicine}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {rx.dosage && <span className="text-xs text-gray-500">💊 {rx.dosage}</span>}
                  {rx.frequency && <span className="text-xs text-gray-500">🕐 {rx.frequency}</span>}
                  {rx.duration && <span className="text-xs text-gray-500">📅 {rx.duration}</span>}
                </div>
                {rx.reason && <p className="text-xs text-teal-600 mt-1">Reason: {rx.reason}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {n.advice_given?.length > 0 && (
        <Section emoji="💬" title="Advice Given">
          <BulletList items={n.advice_given} />
        </Section>
      )}

      {n.exercises_prescribed?.length > 0 && (
        <Section emoji="🏃" title="Exercises Prescribed">
          <BulletList items={n.exercises_prescribed} />
        </Section>
      )}

      {n.diet_instructions?.length > 0 && (
        <Section emoji="🥗" title="Diet Instructions">
          <BulletList items={n.diet_instructions} />
        </Section>
      )}

      {n.tasks_for_patient?.length > 0 && (
        <Section emoji="✅" title="Tasks for Patient">
          <BulletList items={n.tasks_for_patient} />
        </Section>
      )}

      {n.pending_actions?.length > 0 && (
        <Section emoji="⏳" title="Pending Actions">
          <BulletList items={n.pending_actions} />
        </Section>
      )}

      {n.red_flags_to_watch?.length > 0 && (
        <Section emoji="🚨" title="Red Flags to Watch">
          <BulletList items={n.red_flags_to_watch} />
        </Section>
      )}

      {n.follow_up_plan && (
        <Section emoji="🔄" title="Follow Up Plan">
          <p className="text-sm text-gray-600">{n.follow_up_plan}</p>
        </Section>
      )}

      {n.additional_clinical_notes && (
        <Section emoji="📋" title="Additional Clinical Notes">
          <p className="text-sm text-gray-600">{n.additional_clinical_notes}</p>
        </Section>
      )}
    </div>
  )
}
