// ✅ Core styles
import './App.css'

// ✅ React Router (HashRouter is best for GitHub Pages)
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

// ✅ Page components
import HomePage from './pages/home/HomePage'
import Dogbite from './pages/dogbite/Dogbite'
import Eddlist from './pages/edd/EDDList'
import PHCData from './pages/phcdata/PHCData'
import TestPage from './pages/testpage/TestPage'
import AncDetails from './pages/anc/AncDetails'
import PregnancyCalculator from './pages/Pregnancy_Calculator/PregnancyCalculator'
import NCD from './pages/ncd/NCD'   // ✅ ADD THIS

// ✅ Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ncd" element={<NCD />} />
        <Route path="/dogbite" element={<Dogbite />} />
        <Route path="/eddlist" element={<Eddlist />} />
        <Route path="/phcdata" element={<PHCData />} />
        <Route path="/pregnancy-calculator" element={<PregnancyCalculator />} />
        <Route path="/anc/:id" element={<AncDetails />} />
        <Route path="/testpage/*" element={<TestPage />} />
      </Routes>
    </Router>
  )
}

export default App
