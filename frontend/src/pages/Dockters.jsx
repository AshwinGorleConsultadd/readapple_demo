import { useEffect, useState } from 'react'
import client from '../api/client'
import PageHeader from '../components/layout/PageHeader'
import DockterCard from '../components/dockters/DockterCard'

export default function Dockters() {
  const [doctors, setDoctors] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    client.get('/api/dockters')
      .then((res) => { if (mounted) setDoctors(res.data) })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = doctors.filter((d) =>
    (d.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(query.toLowerCase()) ||
    (d.keywords || []).some((k) => k.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Doctors" />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        <div className="mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, specialty, or symptom..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#E24B4A]"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#E24B4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm">{query ? 'No doctors match your search.' : 'No doctors available.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => <DockterCard key={d._id} dockter={d} />)}
          </div>
        )}
      </div>
    </div>
  )
}
