import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import Appointments from './pages/Appointments'
import Journal from './pages/Journal'
import Profile from './pages/Profile'
import Dockters from './pages/Dockters'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dockters" element={<Dockters />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
