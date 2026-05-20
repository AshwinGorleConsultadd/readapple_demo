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
import { useStaticConversation } from './hooks/useStaticConversation'

export default function App() {
  const conversation = useConversation()
  const [greetingData, setGreetingData] = useState(null)
  const greetingLoadedRef = useRef(false)

  // Lifted here so they survive tab switches
  const [isStaticMode, setIsStaticMode] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(
    () => localStorage.getItem('redapple_voice') !== 'off'
  )

  const staticConversation = useStaticConversation({
    addMessage: conversation.addMessage,
    clearMessages: conversation.clearMessages,
    voiceEnabled,
  })

  useEffect(() => {
    if (greetingLoadedRef.current) return
    greetingLoadedRef.current = true
    conversation.loadGreeting().then(setGreetingData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={
            <Home
              conversation={conversation}
              greetingData={greetingData}
              isStaticMode={isStaticMode}
              setIsStaticMode={setIsStaticMode}
              staticConversation={staticConversation}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
            />
          } />
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
