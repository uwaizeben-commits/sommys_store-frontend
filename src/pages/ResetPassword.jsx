import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const { token } = useParams()
  const [valid, setValid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const resets = JSON.parse(localStorage.getItem('pw_resets') || '{}')
    const entry = resets[token]
    if (!entry) {
      setValid(false)
      setLoading(false)
      return
    }
    if (Date.now() > entry.expires) {
      // expired
      delete resets[token]
      localStorage.setItem('pw_resets', JSON.stringify(resets))
      setValid(false)
      setLoading(false)
      return
    }
    setValid(true)
    setLoading(false)
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!password) return setError('Enter a new password')
    if (password !== confirm) return setError('Passwords do not match')

    try {
      // prefer backend reset
      const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
      const payload = await res.json()
      if (!res.ok) return setError(payload.message || 'Reset failed')
      setMessage('Password updated. Redirecting to sign in...')
      setTimeout(() => navigate('/signin'), 1400)
    } catch (err) {
      setError('Unable to reset password')
    }
  }

  if (loading) return <div style={{padding:40}}>Checking link...</div>

  if (!valid) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left"><h2>Invalid or expired link</h2><p>Please request a new password reset.</p></div>
        <div className="auth-right" style={{display:'flex',flexDirection:'column',gap:12}}>
          <Link to="/recover" className="auth-btn">Request new link</Link>
          <Link to="/signin" style={{marginTop:8}}>Back to sign in</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left"><h2>Reset password</h2><p>Choose a new password for your account.</p></div>
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <label className="label" htmlFor="reset-password">New password</label>
            <input id="reset-password" name="password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
            <label className="label" htmlFor="reset-confirm">Confirm password</label>
            <input id="reset-confirm" name="confirm" type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required />
            {error && <div id="reset-error" className="auth-error" role="alert">{error}</div>}
            {message && <div className="auth-message">{message}</div>}
            <button className="auth-btn" type="submit">Update password</button>
          </form>
        </div>
      </div>
    </div>
  )
}
