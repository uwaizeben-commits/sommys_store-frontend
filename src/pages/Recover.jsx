import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const BACKEND_RECOVER_URL = ''

function maskEmail(email) {
  const [local, domain] = email.split('@')
  const mLocal = local.length > 2 ? local[0] + '***' + local.slice(-1) : local[0] + '*'
  const [d0, d1] = domain.split('.')
  const mDomain = d0 ? d0[0] + '***' : '***'
  return `${mLocal}@${mDomain}.${d1 || ''}`
}

export default function Recover() {
  const [identifier, setIdentifier] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [resetLink, setResetLink] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!identifier) return setError('Enter your registered email or phone')

    try {
      // prefer backend if available
      const res = await fetch('/api/auth/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier }) })
      const payload = await res.json()
      if (!res.ok) return setError(payload.message || 'No account found')
      // backend either sends email (production) or returns resetLink (dev)
      if (payload.resetLink) {
        setResetLink(payload.resetLink)
        setMessage('Development reset link generated below')
      } else {
        setMessage(payload.message || 'Recovery email sent if account exists')
      }
    } catch (err) {
      setError('Unable to process request')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Recover account</h2>
          <p>Enter the email address or phone number associated with your account. Only registered users can retrieve a recovery link.</p>
        </div>
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="label" htmlFor="recover-identifier">Email or phone</label>
            <input id="recover-identifier" name="identifier" className="input" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com or +2348012345678" autoComplete="username" required />
            {error && <div id="recover-error" className="auth-error" role="alert">{error}</div>}
            {message && <div className="auth-message">{message}</div>}
            {resetLink && (
              <div style={{marginTop:8}}>
                <a href={resetLink} className="auth-btn">Open reset link</a>
                <div style={{marginTop:8,fontSize:13,color:'#6b7280'}}>{resetLink}</div>
              </div>
            )}
            <button className="auth-btn" type="submit">Continue</button>
            <div className="auth-links" style={{marginTop:12}}>
              <Link to="/signup">Create a new account</Link>
              <Link to="/signin">Back to sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
