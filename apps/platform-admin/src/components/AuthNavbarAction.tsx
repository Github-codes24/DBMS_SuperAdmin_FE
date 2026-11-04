import { useEffect, useState } from 'react'
import { LogIn, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authSessionChangeEvent, clearAccessToken, getAccessToken } from '../features/auth/authService'
import './authNavbarAction.css'

function AuthNavbarAction() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAccessToken()))
  const navigate = useNavigate()

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(Boolean(getAccessToken()))
    }

    window.addEventListener('storage', syncAuthState)
    window.addEventListener(authSessionChangeEvent, syncAuthState)
    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener(authSessionChangeEvent, syncAuthState)
    }
  }, [])

  function logout() {
    clearAccessToken()
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    navigate('/login', { replace: true })
  }

  if (!isLoggedIn) {
    return (
      <Link className="auth-navbar-action" to="/login">
        <LogIn size={14} aria-hidden="true" />
        Login
      </Link>
    )
  }

  return (
    <button className="auth-navbar-action" type="button" onClick={logout}>
      <LogOut size={14} aria-hidden="true" />
      Logout
    </button>
  )
}

export default AuthNavbarAction
