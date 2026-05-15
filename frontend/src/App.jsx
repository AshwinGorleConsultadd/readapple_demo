import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import Appointments from './pages/Appointments'
import Journal from './pages/Journal'
import Profile from './pages/Profile'
import Dockters from './pages/Dockters'
import DockterProfile from './pages/DockterProfile'
import ConversationRecording from './pages/ConversationRecording'
import PatientNotes from './pages/PatientNotes'
import DoctorNotes from './pages/DoctorNotes'
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
          <Route path="/conversation/:appointmentId" element={<ConversationRecording />} />
          <Route path="/patient-notes" element={<PatientNotes />} />
          <Route path="/patient-notes/:noteId" element={<PatientNotes />} />
          <Route path="/doctor-notes/:doctorId" element={<DoctorNotes />} />
          <Route path="/doctor-notes/:doctorId/:noteId" element={<DoctorNotes />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
