import { useState } from 'react'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import ClientDashboard from './components/ClientDashboard'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userType, setUserType] = useState(null)

  const handleLogin = (type) => {
    setUserType(type)
    setCurrentUser(type === 'admin' ? 'Administrator' : 'Client User')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUserType(null)
  }

  // If user is not logged in, show login page
  if (!currentUser) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  // If user is logged in, show appropriate dashboard
  return (
    <div className="App">
      {userType === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <ClientDashboard onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
