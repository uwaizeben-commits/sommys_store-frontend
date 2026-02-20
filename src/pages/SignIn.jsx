import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AUTH_SIGNIN_URL = 'https://sommys-store-backend.onrender.com/api/auth/login'
export default function SignIn() {
  const [identifier, setIdentifier] = useState('') // email or phone
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!identifier || !password) return setError('Please fill both fields')

    try {
      if (AUTH_SIGNIN_URL) {
        // Backend accepts either email or phone as `identifier`
        const res = await fetch(AUTH_SIGNIN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) })
        if (!res.ok) {
          let msg = 'Invalid credentials'
          try { const j = await res.json(); if (j && j.message) msg = j.message } catch (e) {}
          throw new Error(msg)
        }
        const resp = await res.json()
        // backend returns { token, user: { id, email, name } }
        const user = resp.user || resp
        localStorage.setItem('user', JSON.stringify(user))
        // notify app layout that user changed
        try { window.dispatchEvent(new CustomEvent('user:change', { detail: user })) } catch (e) {}
        
        // Redirect to return URL if it exists, otherwise home
        const returnUrl = sessionStorage.getItem('returnUrl')
        sessionStorage.removeItem('returnUrl')
        navigate(returnUrl || '/')
        return
      }

      // local fallback: check users in localStorage (normalize email & phone)
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const id = String(identifier || '').trim()
      const pwd = password
      const normIdEmail = id.includes('@') ? id.toLowerCase() : id.toLowerCase()
      const normIdPhone = id.replace(/\D/g, '')

      const found = users.find(u => {
        const userEmail = (u.email || '').toLowerCase()
        const userPhone = (u.phone || '').replace(/\D/g, '')
        const emailMatch = userEmail && userEmail === normIdEmail
        const phoneMatch = userPhone && normIdPhone && userPhone === normIdPhone
        return (emailMatch || phoneMatch) && u.password === pwd
      })

      if (!found) return setError('Invalid email/phone or password')
      const userObj = { email: found.email, phone: found.phone, name: found.name }
      localStorage.setItem('user', JSON.stringify(userObj))
      try { window.dispatchEvent(new CustomEvent('user:change', { detail: userObj })) } catch (e) {}
      
      // Redirect to return URL if it exists, otherwise home
      const returnUrl = sessionStorage.getItem('returnUrl')
      sessionStorage.removeItem('returnUrl')
      navigate(returnUrl || '/')
    } catch (err) {
      setError(err.message || 'Sign in failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Sign in</h2>
          <p>Access your Sommy's Store account to view orders, track shipments and more.</p>
        </div>
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="label" htmlFor="signin-identifier">Email or phone</label>
            <input id="signin-identifier" name="identifier" className="input" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com or +2348012345678" autoComplete="username" required />

            <label className="label" htmlFor="signin-password">Password</label>
            <input id="signin-password" name="password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required />

            {error && <div id="signin-error" className="auth-error" role="alert">{error}</div>}

            <button className="auth-btn" type="submit">Sign in</button>

            <div className="auth-links">
              <Link to="/signup">Create account</Link>
              <Link to="/recover">Can't access your account?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
