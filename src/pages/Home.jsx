import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './landing.css'
import clothesImg from '../public/clothes.jfif'
import bagsImg from '../public/bags.jpg'
import shoesImg from '../public/shoes.jfif'

function Slider({ slides = [], interval = 4000 }) {
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval)
    return () => clearInterval(timer.current)
  }, [slides.length, interval])

  function go(i) {
    clearInterval(timer.current)
    setIndex((prev) => {
      const next = (prev + i + slides.length) % slides.length
      return next
    })
  }

  if (!slides || slides.length === 0) return null

  const s = slides[index]

  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${s.image})` }} />
      <div className="hero-content">
        <div className="hero-text">
          <h2>{s.title}</h2>
          <p>{s.subtitle}</p>
          <Link to="/" className="hero-cta">Shop {s.title}</Link>
        </div>
        <div className="hero-controls">
          <button aria-label="prev" onClick={() => go(-1)} className="ctrl">‹</button>
          <div className="dots">
            {slides.map((_, i) => (
              <button key={i} className={`dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} />
            ))}
          </div>
          <button aria-label="next" onClick={() => go(1)} className="ctrl">›</button>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {})
  }, [])

  const slides = [
    {
      title: 'Clothes',
      subtitle: 'Comfortable tees, hoodies and more — crafted for everyday wear.',
      image: clothesImg
    },
    {
      title: 'Bags',
      subtitle: 'Stylish totes and backpacks for every occasion.',
      image: bagsImg
    },
    {
      title: 'Shoes',
      subtitle: 'From classic sneakers to polished boots.',
      image: shoesImg
    }
  ]

  return (
    <div>
      <Slider slides={slides} />

      <div style={{ padding: '28px 0' }}>
        <h2 style={{ marginBottom: 12 }}>Featured Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {products.length > 0 ? (
            products.map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
                  <div style={{ height: 140, overflow: 'hidden', marginBottom: 8 }}>
                    <img
                      src={p.images && p.images.length ? p.images[0] : '/vite.svg'}
                      alt={p.name || 'product'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ margin: '6px 0' }}>{p.name}</h3>
                  <div style={{ color: '#333', fontWeight: 600 }}>${p.price}</div>
                </div>
              </Link>
            ))
          ) : (
            <div>No products found - Loading....</div>
          )}
        </div>
      </div>
    </div>
  )
}
