import React from 'react'
import { useRouteError, Link } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  const message = error && (error.statusText || error.message || JSON.stringify(error))
  const status = error && (error.status || '')

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',padding:24}}>
      <div style={{maxWidth:780, width:'100%', textAlign:'center'}}>
        <h1 style={{fontSize:28,marginBottom:8}}>Unexpected Application Error</h1>
        <p style={{color:'#334155',marginBottom:18}}>{status ? `${status} — ` : ''}{message || 'The page could not be loaded.'}</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Link to="/" style={{padding:'10px 14px',background:'#0f172a',color:'#fff',borderRadius:6,textDecoration:'none'}}>Go home</Link>
          <Link to="/signin" style={{padding:'10px 14px',border:'1px solid #e6e9ee',borderRadius:6,textDecoration:'none',color:'#0f172a'}}>Sign in</Link>
        </div>
        <div style={{marginTop:18,color:'#6b7280',fontSize:13}}>Tip: implement an ErrorBoundary or provide `errorElement` on a route.</div>
      </div>
    </div>
  )
}
