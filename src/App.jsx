import React, { useEffect, useState } from 'react'
import { createHashRouter, RouterProvider, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Recover from './pages/Recover'
import ResetPassword from './pages/ResetPassword'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import Product from './pages/Product'
import Cart from './pages/Cart'
import About from './pages/About'
import Products from './pages/Products'
import Orders from './pages/Orders'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Checkout from './pages/Checkout'
import logoImg from './assets/sommystore-logo.jpg'
import './header.css'

const SOCIAL_LINKS = {
  twitter: '',
  instagram: '',
  facebook: ''
}

const MAILCHIMP_URL = ''
const BACKEND_SUBSCRIBE_URL = ''

// routerWithLayout (below) defines the app routes and layout

function Layout() {
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s, i) => s + (i.quantity || 0), 0))
    } catch (e) {
      setCartCount(0)
    }
    try {
      let u = JSON.parse(localStorage.getItem('user') || 'null')
      if (u && u.user) u = u.user
      if (u) setUser(u)
    } catch (e) {}
    try {
      const a = JSON.parse(localStorage.getItem('admin') || 'null')
      if (a) setAdmin(a)
    } catch (e) {}
  }, [])

  useEffect(() => {
    function onUserChange(e) {
      try {
        let u = e && e.detail ? e.detail : JSON.parse(localStorage.getItem('user') || 'null')
        if (u && u.user) u = u.user
        setUser(u)
      } catch (err) { setUser(null) }
    }
    window.addEventListener('user:change', onUserChange)
    return () => window.removeEventListener('user:change', onUserChange)
  }, [])

  useEffect(() => {
    function onAdminChange(e) {
      try {
        const a = e && e.detail ? e.detail : JSON.parse(localStorage.getItem('admin') || 'null')
        setAdmin(a)
      } catch (err) { setAdmin(null) }
    }
    window.addEventListener('admin:change', onAdminChange)
    return () => window.removeEventListener('admin:change', onAdminChange)
  }, [])

  useEffect(() => {
    function onCartChange(e) {
      try {
        const cart = e && e.detail ? e.detail : JSON.parse(localStorage.getItem('cart') || '[]')
        setCartCount(cart.reduce((s, i) => s + (i.quantity || 0), 0))
      } catch (err) { setCartCount(0) }
    }
    window.addEventListener('cart:change', onCartChange)
    return () => window.removeEventListener('cart:change', onCartChange)
  }, [])

  function handleSearch(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Store search query and navigate to products page
      sessionStorage.setItem('searchQuery', searchQuery)
      navigate('/products')
      setSearchQuery('')
    }
  }

  function handleSubscribe(e) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const payload = { email }
    ;(async () => {
      try {
        if (MAILCHIMP_URL) {
          await fetch(MAILCHIMP_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          setSubscribed(true)
          setEmail('')
          setTimeout(() => setSubscribed(false), 3500)
          return
        }

        if (BACKEND_SUBSCRIBE_URL) {
          const res = await fetch(BACKEND_SUBSCRIBE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          if (res.ok) {
            setSubscribed(true)
            setEmail('')
            setTimeout(() => setSubscribed(false), 3500)
            return
          }
        }

        const list = JSON.parse(localStorage.getItem('subscribers') || '[]')
        if (!list.includes(email)) list.push(email)
        localStorage.setItem('subscribers', JSON.stringify(list))
        setSubscribed(true)
        setEmail('')
        setTimeout(() => setSubscribed(false), 3500)
      } catch (err) {
        try {
          const list = JSON.parse(localStorage.getItem('subscribers') || '[]')
          if (!list.includes(email)) list.push(email)
          localStorage.setItem('subscribers', JSON.stringify(list))
        } catch (e) {}
        setSubscribed(true)
        setEmail('')
        setTimeout(() => setSubscribed(false), 3500)
      }
    })()
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo" aria-label="Sommy's Store">
            <img src={logoImg} alt="Sommy's Store" className="logo-img" />
            <span className="logo-text">Sommy's Store</span>
          </Link>
          <button className="nav-toggle" aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen} onClick={() => setNavOpen(v => !v)}>
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0 1.5h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M0 7h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M0 12.5h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="header-center">
          <input className="search" placeholder="Search products, categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
        <div className="header-right">
          <nav className={`nav-links${navOpen ? ' open' : ''}`} onClick={() => setNavOpen(false)}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/cart" className="nav-link">Cart ({cartCount})</Link>
            {admin ? (
              <>
                <span className="nav-link" aria-live="polite">Admin: {admin.email.split('@')[0]}</span>
                <Link to="/admin/dashboard" className="btn primary">Dashboard</Link>
                <button className="btn ghost" onClick={() => { localStorage.removeItem('admin'); setAdmin(null); window.dispatchEvent(new CustomEvent('admin:change', { detail: null })); }} >Admin Sign out</button>
              </>
            ) : user ? (
              <>
                <span className="nav-link" aria-live="polite">Hi, {user.name || (user.email ? user.email.split('@')[0] : (user.phone || 'User'))}</span>
                <Link to="/orders" className="nav-link">Orders</Link>
                <button className="btn ghost" onClick={() => { localStorage.removeItem('user'); setUser(null); window.dispatchEvent(new CustomEvent('user:change', { detail: null })); }} >Sign out</button>
              </>
            ) : (
              <Link to="/signin" className="btn primary">Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="site-footer" role="contentinfo" aria-label="Site footer">
        <div className="footer-inner">
          <div className="col">
            <div className="footer-brand">Sommy's Store</div>
            <p>Quality everyday apparel and accessories — curated for comfort and style.</p>
          </div>
          <div className="col">
            <h4>Quick Links</h4>
            <nav aria-label="Quick links">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/orders">Orders</Link></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </nav>
          </div>
          <div className="col">
            <h4>Policies</h4>
            <nav aria-label="Policies">
              <ul>
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert('Service Agreement\n\n1. TERMS OF SERVICE\nBy shopping at Sommy\'s Store, you agree to these terms and conditions.\n\n2. ORDERS & PURCHASES\nAll orders are subject to acceptance. We reserve the right to refuse or cancel any order.\n\n3. PRICING & AVAILABILITY\nPrices are subject to change. Product availability is not guaranteed until order confirmation.\n\n4. REFUNDS & CANCELLATIONS\nOrders can be cancelled within 24 hours of placement. A 3% cancellation fee will be deducted from refunds. Refunds are processed to the original payment method within 5-7 business days.\n\n5. SHIPPING & DELIVERY\nOrder status tracks: Pending → Dispatched → In Transit → Delivered. Delivery times are estimates and may be subject to delays.\n\n6. LIMITATION OF LIABILITY\nSommy\'s Store is not liable for indirect, incidental, or consequential damages from product use.\n\n7. INTELLECTUAL PROPERTY\nAll site content, images, and product descriptions are owned by Sommy\'s Store.\n\n8. PRIVACY & DATA\nYour personal data is protected and used only for order fulfillment and service improvement.\n\n9. MODIFICATIONS\nWe reserve the right to modify these terms at any time. Changes are effective upon posting.\n\n10. CONTACT\nFor support: hello@sommys.store'); }}>Terms of Service</a></li>
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy\n\nAt Sommy\'s Store, your privacy is important to us. We collect minimal personal information needed for orders and customer service. Your data is never sold to third parties.'); }}>Privacy Policy</a></li>
              </ul>
            </nav>
          </div>
          <div className="col">
            <h4>Contact</h4>
            <p>Email: <a href="mailto:hello@sommys.store">hello@sommys.store</a></p>
            <div className="footer-socials">
              <a className="social-icon" href={SOCIAL_LINKS.twitter || '#'} aria-label="Twitter" target={SOCIAL_LINKS.twitter ? '_blank' : undefined} rel={SOCIAL_LINKS.twitter ? 'noopener noreferrer' : undefined}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Twitter</title><path d="M22 5.8c-.6.3-1.2.5-1.9.6.7-.4 1.2-1.1 1.4-1.9-.7.4-1.5.7-2.3.9C18.7 4.5 17.7 4 16.6 4c-1.9 0-3.4 1.6-3.4 3.5 0 .3 0 .5.1.8C9.4 8.1 6.2 6.3 4.2 3.6c-.4.6-.6 1.2-.6 2 0 1.2.6 2.2 1.6 2.8-.6 0-1.1-.2-1.6-.5v.1c0 1.8 1.3 3.4 3 3.7-.3.1-.6.1-.9.1-.2 0-.5 0-.7-.1.5 1.7 2 2.9 3.7 2.9-1.4 1.1-3.1 1.7-4.9 1.7H4c1.9 1.2 4.2 1.9 6.6 1.9 7.9 0 12.2-6.5 12.2-12.1v-.6c.8-.6 1.4-1.2 2-2.1-.7.3-1.5.5-2.3.7z" fill="currentColor"/></svg>
              </a>
              <a className="social-icon" href={SOCIAL_LINKS.instagram || '#'} aria-label="Instagram" target={SOCIAL_LINKS.instagram ? '_blank' : undefined} rel={SOCIAL_LINKS.instagram ? 'noopener noreferrer' : undefined}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zM18.4 6.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" fill="currentColor"/></svg>
              </a>
              <a className="social-icon" href={SOCIAL_LINKS.facebook || '#'} aria-label="Facebook" target={SOCIAL_LINKS.facebook ? '_blank' : undefined} rel={SOCIAL_LINKS.facebook ? 'noopener noreferrer' : undefined}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8.5v-3h2V9.5c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.3V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12z" fill="currentColor"/></svg>
              </a>
            </div>

            <form className="footer-signup" onSubmit={handleSubscribe} aria-label="Subscribe to newsletter">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <input id="footer-email" className="signup-input" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
                <button className="signup-btn" type="submit">Subscribe</button>
              </div>
              <div className="signup-msg" aria-live="polite">{subscribed ? 'Thanks — check your inbox!' : ''}</div>
            </form>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} Sommy's Store — All rights reserved.</div>
      </footer>
    </div>
  )
}

const routerWithLayout = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
    { path: 'about', element: <About /> },
      { path: 'product/:id', element: <Product /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'orders', element: <Orders /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'recover', element: <Recover /> },
      { path: 'reset/:token', element: <ResetPassword /> },
      { path: 'admin/login', element: <AdminLogin /> },
      { path: 'admin/dashboard', element: <AdminDashboard /> },
      { path: '*', element: <ErrorPage /> }
    ]
  }
], { future: { v7_startTransition: true, v7_relativeSplatPath: true } })

export default function App() {
  return <RouterProvider router={routerWithLayout} />
}
