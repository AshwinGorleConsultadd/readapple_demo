import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import ProfileCard from '../components/profile/ProfileCard'
import { getProfile } from '../api/profile'
import client from '../api/client'

const PROCESSING_MESSAGES = [
  'Uploading your insurance card...',
  'Reading plan details...',
  'Verifying coverage information...',
  'Almost done...',
]

function InsuranceSection() {
  const [uploaded, setUploaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingMsg, setProcessingMsg] = useState(PROCESSING_MESSAGES[0])
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await client.post('/profile/insurance', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Show processing animation for 2.5s before revealing the card
      setUploading(false)
      setProcessing(true)
      let i = 0
      const interval = setInterval(() => {
        i++
        if (i < PROCESSING_MESSAGES.length) setProcessingMsg(PROCESSING_MESSAGES[i])
      }, 600)
      setTimeout(() => {
        clearInterval(interval)
        setProcessing(false)
        setUploaded(true)
      }, 2500)
    } catch {
      setUploading(false)
      e.target.value = ''
      alert('Upload failed. Please try again.')
    }
  }

  if (processing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{processingMsg}</p>
          <p className="text-xs text-gray-400 mt-1">Please wait a moment</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-[#003087] rounded-full animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '100%' }} />
        </div>
      </div>
    )
  }

  if (!uploaded) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">🏥 Insurance Coverage</h3>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 w-full justify-center py-3 rounded-xl bg-[#E24B4A] text-white text-sm font-medium disabled:opacity-50 active:opacity-80"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Insurance Card
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4" style={{ backgroundColor: '#003087' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">BlueCross BlueShield</p>
            <p className="text-blue-200 text-xs mt-0.5">PPO Silver 80</p>
          </div>
          <svg className="w-8 h-8 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
        <p className="text-blue-100 text-xs mt-2 font-medium">✓ Insurance Coverage</p>
      </div>

      {/* Details */}
      <div className="bg-white divide-y divide-gray-50">
        {[
          ['Member',     'Ashwin Gorle'],
          ['Member ID',  'BCB-9274-5531'],
          ['Group No.',  'GRP-774821-X'],
          ['Plan Year',  '2025'],
          ['Deductible', '$1,500 / yr'],
          ['Coverage',   '80% In-Network'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-2.5">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-xs font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-green-50 px-5 py-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="text-xs text-green-700 font-medium">Active · Expires Dec 2025</span>
      </div>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Profile" />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#00B5C8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            <ProfileCard profile={profile} />
            <InsuranceSection />
            <button
              onClick={() => navigate('/patient-notes')}
              className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-sm font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">📋 My Consultation Notes</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
