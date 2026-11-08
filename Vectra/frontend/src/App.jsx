import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Account from './Pages/Account/Account'
import Chat from './Pages/Chat/Chat'
import Login from './Pages/Login/Login'
import Credentials from './Pages/Credentials/Credentials'
import ProtectedRoute from './Components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
          <Route path="/models" element={<Navigate to="/credentials" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
