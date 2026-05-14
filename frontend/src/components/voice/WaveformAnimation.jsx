export default function WaveformAnimation({ active = true, color = 'white' }) {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            animationDelay: `${i * 0.1}s`,
            backgroundColor: color,
          }}
          className={`w-[3px] rounded-full ${active ? 'animate-waveform' : 'h-1'}`}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0%, 100% { height: 4px; }
          50% { height: 18px; }
        }
        .animate-waveform {
          animation: waveform 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
