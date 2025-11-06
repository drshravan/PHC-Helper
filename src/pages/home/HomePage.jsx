
// ✅ Home Page component

import { Link } from "react-router-dom"



export default function HomePage() {
    return (
      <div style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        }}>

                <Link className="link" to= "/dogbite"> Dog Bite</Link>
                <Link className="link" to= "/Eddlist"> EDD List</Link>
        
      </div>
    )
  }
  