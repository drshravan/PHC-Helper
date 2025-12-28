// ✅ Core styles
import './App.css'

// ✅ React Router
import { HashRouter as Router, Routes, Route } from 'react-router-dom'

// ✅ Theme Context
import { ThemeProvider } from './context/ThemeContext'

// ✅ Page components
import Home from './pages/Home'
import ServicesList from './pages/services/ServicesList'
import Dogbite from './pages/services/dogbite/Dogbite'
import PregnancyCalculator from './pages/services/Pregnancy_Calculator/PregnancyCalculator'
import PublicHolidays from './pages/services/public_holidays/PublicHolidays'

import ProgramsList from './pages/programs/ProgramsList'
import MCH from './pages/programs/mch/MCH'
import AncRegistration from './pages/programs/mch/AncRegistration'
import EddVsDeliveries from './pages/programs/mch/EddVsDeliveries'
import NCD from './pages/programs/ncd/NCD'
import Communicable from './pages/programs/communicable/Communicable'

// ✅ Main App component
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Services */}
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/dogbite" element={<Dogbite />} />
          <Route path="/services/pregnancy-calculator" element={<PregnancyCalculator />} />
          <Route path="/services/public-holidays" element={<PublicHolidays />} />

          {/* Programs */}
          <Route path="/programs" element={<ProgramsList />} />
          <Route path="/programs/mch" element={<MCH />} />
          <Route path="/programs/mch/anc" element={<AncRegistration />} />
          <Route path="/programs/mch/edd-vs-deliveries" element={<EddVsDeliveries />} />
          <Route path="/programs/ncd" element={<NCD />} />
          <Route path="/programs/communicable" element={<Communicable />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
