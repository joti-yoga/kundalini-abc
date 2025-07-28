import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import GuestHome from './pages/GuestHome'
import Launch from './pages/Launch'
import Welcome from './pages/Welcome'
import Intro from './pages/Intro'
import Register from './pages/Register'
import RegisterSuccess from './pages/RegisterSuccess'
import MemberHome from './pages/MemberHome'
import CoursePlayer from './pages/CoursePlayer'
import MemberSettings from './pages/MemberSettings'
import UpgradeMembership from './pages/UpgradeMembership'
import EntryChoice from './pages/EntryChoice'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Launch />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/entry" element={<EntryChoice />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/guest-home" element={<GuestHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/member-home" element={<MemberHome />} />
        <Route path="/course/:id" element={<CoursePlayer />} />
        <Route path="/settings" element={<MemberSettings />} />
        <Route path="/upgrade" element={<UpgradeMembership />} />
      </Routes>
    </Router>
  )
}

export default App