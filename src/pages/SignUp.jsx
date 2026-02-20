import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const AUTH_SIGNUP_URL = 'https://sommys-store-backend.onrender.com/api/auth/register'
export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name || !email || !phone || !password) return setError('Please complete all fields')
    if (password !== confirm) return setError('Passwords do not match')

    try {
      if (AUTH_SIGNUP_URL) {
        const res = await fetch(AUTH_SIGNUP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, password }) })
        if (!res.ok) {
          let msg = 'Signup failed'
          try { const j = await res.json(); if (j && j.message) msg = j.message } catch (e) {}
          throw new Error(msg)
        }
        const resp = await res.json()
        const user = resp.user || resp
        localStorage.setItem('user', JSON.stringify(user))
        try { window.dispatchEvent(new CustomEvent('user:change', { detail: user })) } catch (e) {}
        navigate('/')
        return
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]')
      if (users.find(u => u.email === email || u.phone === phone)) return setError('Already a member')
      users.push({ name, email, phone, password })
      localStorage.setItem('users', JSON.stringify(users))
      const userObj = { name, email, phone }
      localStorage.setItem('user', JSON.stringify(userObj))
      try { window.dispatchEvent(new CustomEvent('user:change', { detail: userObj })) } catch (e) {}
      navigate('/')
    } catch (err) {
      setError(err.message || 'Signup failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Create account</h2>
          <p>Sign up to shop, track orders and save favorite items.</p>
        </div>
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="label" htmlFor="signup-name">Full name</label>
            <input id="signup-name" name="name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoComplete="name" required />

            <label className="label" htmlFor="signup-email">Email</label>
            <input id="signup-email" name="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />

            <label className="label" htmlFor="signup-phone">Phone</label>
            <input id="signup-phone" name="phone" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+2348012345678" autoComplete="tel" required />

            <label className="label" htmlFor="signup-password">Password</label>
            <input id="signup-password" name="password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" autoComplete="new-password" required />

            <label className="label" htmlFor="signup-confirm">Confirm password</label>
            <input id="signup-confirm" name="confirm" type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" autoComplete="new-password" required />

            {error && <div id="signup-error" className="auth-error" role="alert">{error}</div>}

            <button className="auth-btn" type="submit">Create account</button>

            <div className="auth-links">
              <Link to="/signin">Already have an account? Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
