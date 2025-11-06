
// ✅ Home Page component

import { Link } from "react-router-dom"




export default function HomePage() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">🏥 PHC Helper</h1>
        <p className="home-subtitle">Choose an option below to continue</p>

        <div className="home-links">
          <Link className="home-link" to="/dogbite">
            🐶 Dog Bite Management 
          </Link>
          <Link className="home-link" to="/Eddlist">
            🤰 EDD List
          </Link>
        </div>
      </div>
    </div>
  )
}

  