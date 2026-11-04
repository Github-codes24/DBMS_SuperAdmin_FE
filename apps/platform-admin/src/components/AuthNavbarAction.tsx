import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearAccessToken } from '../features/auth/authService'
import './authNavbarAction.css'

function AuthNavbarAction() {
  const navigate = useNavigate()

  function logout() {
    clearAccessToken()
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <button className="auth-navbar-action" type="button" onClick={logout}>
      <LogOut size={14} aria-hidden="true" />
      Logout
    </button>
  )
}

export default AuthNavbarAction
