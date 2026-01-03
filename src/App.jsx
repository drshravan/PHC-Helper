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
import AncRegistration from './pages/programs/mch/registration/AncRegistration'
import EddVsDeliveries from './pages/programs/mch/edd/EddVsDeliveries'
import PhcMonthlyInput from './pages/programs/mch/edd/PhcMonthlyInput'
import ScAncList from './pages/programs/mch/edd/ScAncList'
import AncEditRecord from './pages/programs/mch/edd/AncEditRecord'
import AncProfile from './pages/programs/mch/edd/AncProfile'
import CompareSectionPage from './pages/programs/mch/edd/CompareSectionPage'
import SubCentersListPage from './pages/programs/mch/edd/SubCentersListPage'
import IncompleteAncList from './pages/programs/mch/edd/IncompleteAncList'
import MaternalDeathAudit from './pages/programs/mch/audits/MaternalDeathAudit'
import ChildDeathAudit from './pages/programs/mch/audits/ChildDeathAudit'
import AefiAudit from './pages/programs/mch/audits/AefiAudit'
import NCD from './pages/programs/ncd/NCD'
import Communicable from './pages/programs/communicable/Communicable'
import TbActiveCases from './pages/programs/communicable/TbActiveCases'
import TbTreatmentCompleted from './pages/programs/communicable/TbTreatmentCompleted'
import TbDeathCases from './pages/programs/communicable/TbDeathCases'
import LeprosySuspected from './pages/programs/communicable/LeprosySuspected'
import LeprosyPositive from './pages/programs/communicable/LeprosyPositive'
import LeprosyDeath from './pages/programs/communicable/LeprosyDeath'

// ✅ Main App component
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/incomplete-anc/:monthId" element={<IncompleteAncList />} />

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
          <Route path="/programs/mch/edd-vs-deliveries/:monthId" element={<PhcMonthlyInput />} />
          <Route path="/programs/mch/edd-vs-deliveries/:monthId/subcenters" element={<SubCentersListPage />} />
          <Route path="/programs/mch/edd-vs-deliveries/:monthId/compare/:sectionType" element={<CompareSectionPage />} />
          <Route path="/programs/mch/edd-vs-deliveries/:monthId/:subCenterId" element={<ScAncList />} />

          {/* Record Routes: Profile by default, Edit explicitly */}
          <Route path="/programs/mch/edd-vs-deliveries/:monthId/:subCenterId/:recordId" element={<AncProfile />} />
          <Route path="/programs/mch/edd-vs-deliveries/:monthId/:subCenterId/:recordId/edit" element={<AncEditRecord />} />

          <Route path="/programs/mch/maternal-death-audit" element={<MaternalDeathAudit />} />
          <Route path="/programs/mch/child-death-audit" element={<ChildDeathAudit />} />
          <Route path="/programs/mch/aefi-audit" element={<AefiAudit />} />
          <Route path="/programs/ncd" element={<NCD />} />
          <Route path="/programs/communicable" element={<Communicable />} />
          <Route path="/programs/communicable/tb-active" element={<TbActiveCases />} />
          <Route path="/programs/communicable/tb-completed" element={<TbTreatmentCompleted />} />
          <Route path="/programs/communicable/tb-death" element={<TbDeathCases />} />
          <Route path="/programs/communicable/leprosy-suspected" element={<LeprosySuspected />} />
          <Route path="/programs/communicable/leprosy-positive" element={<LeprosyPositive />} />
          <Route path="/programs/communicable/leprosy-death" element={<LeprosyDeath />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
