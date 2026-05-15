import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import Appointments from './pages/Appointments'
import Journal from './pages/Journal'
import Profile from './pages/Profile'
import Dockters from './pages/Dockters'
import DockterProfile from './pages/DockterProfile'
import { useConversation } from './hooks/useConversation'

export default function App() {
  const conversation = useConversation()
  const [greetingData, setGreetingData] = useState(null)
  const greetingLoadedRef = useRef(false)

  useEffect(() => {
    if (greetingLoadedRef.current) return
    greetingLoadedRef.current = true
    conversation.loadGreeting().then(setGreetingData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Home conversation={conversation} greetingData={greetingData} />} />
          <Route path="/dockters" element={<Dockters />} />
          <Route path="/dockters/:id" element={<DockterProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
