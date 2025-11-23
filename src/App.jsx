// ✅ React and core imports
import { useState } from 'react'
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



// ✅ Main App component
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dogbite" element={<Dogbite />} />
        <Route path="/eddlist" element={<Eddlist />} />
        <Route path="/phcdata" element={<PHCData />} />
        <Route path="/testpage" element={<TestPage />} />
        <Route path="/anc/:id" element={<AncDetails />} />
      </Routes>
    </Router>
  )
}

export default App
