export default function ExerciseItem({ exercise }) {
  return (
    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
      <p className="font-semibold text-gray-800 text-sm">{exercise.name}</p>
      {exercise.instructions && (
        <p className="text-xs text-gray-500 mt-0.5">{exercise.instructions}</p>
      )}
      {exercise.frequency && (
        <span className="text-xs text-green-600 mt-1 inline-block">🔁 {exercise.frequency}</span>
      )}
    </div>
  )
}
