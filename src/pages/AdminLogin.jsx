import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const ADMIN_LOGIN_URL = 'http://localhost:5001/api/auth/admin/login'
const ADMIN_REGISTER_URL = 'http://localhost:5001/api/auth/admin/register'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if already logged in as admin
    const admin = JSON.parse(localStorage.getItem('admin') || 'null')
    if (admin) navigate('/admin/dashboard')
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Please fill all fields')
    if (isRegister && password !== confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      const url = isRegister ? ADMIN_REGISTER_URL : ADMIN_LOGIN_URL
      if (url) {
        const res = await fetch(url, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ email, password }) 
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.message || `Admin ${isRegister ? 'registration' : 'login'} failed`)
        }
        const admin = await res.json()
        localStorage.setItem('admin', JSON.stringify(admin))
        try { window.dispatchEvent(new CustomEvent('admin:change', { detail: admin })) } catch (e) {}
        navigate('/admin/dashboard')
        return
      }

      // Local fallback
      if (isRegister) {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]')
        if (admins.find(a => a.email === email)) return setError('Admin account already exists')
        admins.push({ email, password })
        localStorage.setItem('admins', JSON.stringify(admins))
        const adminObj = { email, role: 'admin', token: 'local-token' }
        localStorage.setItem('admin', JSON.stringify(adminObj))
        try { window.dispatchEvent(new CustomEvent('admin:change', { detail: adminObj })) } catch (e) {}
        navigate('/admin/dashboard')
      } else {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]')
        const found = admins.find(a => a.email === email && a.password === password)
        if (!found) return setError('Invalid admin credentials')
        const adminObj = { email: found.email, role: 'admin', token: 'local-token' }
        localStorage.setItem('admin', JSON.stringify(adminObj))
        try { window.dispatchEvent(new CustomEvent('admin:change', { detail: adminObj })) } catch (e) {}
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.message || `Admin ${isRegister ? 'registration' : 'login'} failed`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h2>{isRegister ? 'Register Admin' : 'Admin Login'}</h2>
          <p>{isRegister ? 'Create an admin account to manage products and store settings.' : 'Access the admin dashboard to manage products and store settings.'}</p>
        </div>
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="label" htmlFor="admin-email">Email</label>
            <input id="admin-email" name="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@sommys.store" autoComplete="email" required />

            <label className="label" htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete={isRegister ? 'new-password' : 'current-password'} required />

            {isRegister && (
              <>
                <label className="label" htmlFor="admin-confirm">Confirm Password</label>
                <input id="admin-confirm" name="confirm" type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" autoComplete="new-password" required />
              </>
            )}

            {error && <div id="admin-error" className="auth-error" role="alert">{error}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Create Admin Account' : 'Admin Login')}
            </button>

            <div className="auth-links">
              <button type="button" className="auth-link-btn" onClick={() => { setIsRegister(!isRegister); setError(''); setConfirmPassword(''); }}>
                {isRegister ? 'Already have an account? Login' : 'Create new admin account'}
              </button>
              <Link to="/">Back to store</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
