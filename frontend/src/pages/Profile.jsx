import { useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ProfileCard from '../components/profile/ProfileCard'
import { getProfile } from '../api/profile'

export default function Profile() {
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
            <div className="w-8 h-8 border-2 border-[#E24B4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ProfileCard profile={profile} />
        )}
      </div>
    </div>
  )
}
