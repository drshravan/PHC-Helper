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
      </Routes>
    </Router>
  )
}

export default App
