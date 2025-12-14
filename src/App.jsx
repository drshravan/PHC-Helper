// ✅ React and core imports
import './App.css'

// ✅ Import routing components
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

// ✅ Import your page components (default exports)
import HomePage from './pages/home/HomePage'
import Dogbite from './pages/dogbite/dogbite'
import Eddlist from './pages/edd/EDDList'
import PHCData from './pages/phcdata/PHCData'
import TestPage from './pages/testpage/testpage'
import AncDetails from './pages/anc/AncDetails'
import PregnancyCalculator from './pages/Pregnancy_Calculator/PregnancyCalculator.jsx'

// ✅ Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dogbite" element={<Dogbite />} />
        <Route path="/eddlist" element={<Eddlist />} />
        <Route path="/phcdata" element={<PHCData />} />
        <Route path="/testpage/*" element={<TestPage />} />
        <Route path="/anc/:id" element={<AncDetails />} />
        <Route path="/PregnancyCalculator" element={<PregnancyCalculator />} />
        <Route path="/ncd" element={<NCD />} />
      </Routes>
    </Router>
  )
}

export default App