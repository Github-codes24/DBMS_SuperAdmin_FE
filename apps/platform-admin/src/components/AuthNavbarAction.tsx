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
    <button
      className="auth-navbar-action"
      type="button"
      onClick={logout}
      aria-label="Sign out of DBMS Super Admin"
      title="Logout"
    >
      <LogOut size={14} aria-hidden="true" />
      <span>Logout</span>
    </button>
  )
}

export default AuthNavbarAction
