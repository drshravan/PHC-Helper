
// ✅ Home Page component

import { Link } from "react-router-dom"
import "./HomePage.css"



export default function HomePage() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">🏥 PHC Helper</h1>
        <p className="home-subtitle">Choose an option below to continue</p>

        <div className="home-links">

          {/* Dog bite screen route */}
          <Link className="home-link" to="/dogbite">
            🐶 Dog Bite Management 
          </Link>

          {/* EDD list screen route */}
          <Link className="home-link" to="/eddlist">
            🤰 EDD List
          </Link>

          {/* PHC data screen route */}
          <Link className="home-link" to="/phcdata">
            🏥 PHC Data
          </Link>

          {/* Pregnancy calculator screen route */}
          <Link className="home-link" to="/PregnancyCalculator">
          PregnancyCalculator
          </Link>

           {/* test page */}
          <Link className="home-link" to="/testpage">
            🧪 Test Page
          </Link>
          
        </div>
      </div>
    </div>
  )
}




  