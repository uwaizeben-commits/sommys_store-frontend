import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const API_URL = 'https://sommys-store-backend.onrender.com/api/products'
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  function addToCart(p) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existing = cart.find((i) => i.productId === p._id)
      if (existing) existing.quantity = (existing.quantity || 1) + 1
      else cart.push({ productId: p._id, name: p.name, price: p.price, image: p.images && p.images[0], quantity: 1 })
      localStorage.setItem('cart', JSON.stringify(cart))
      alert('Added to cart')
    } catch (e) {
      alert('Could not add to cart')
    }
  }

  return (
    <div className="products-page">
      <div className="products-hero">
        <h1>Products</h1>
        <p className="muted">Browse our full selection — filter, compare and add to cart.</p>
      </div>

      <div className="products-toolbar">
        <div className="results">{loading ? 'Loading...' : `${products.length} items`}</div>
        <div className="sort">Sort: <select><option>Recommended</option><option>Price: Low to High</option><option>Price: High to Low</option></select></div>
      </div>

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {products.map((p) => (
          <div className="product-card" key={p._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Link to={`/product/${p._id}`} className="product-link" style={{ flex: 1, display: 'flex' }}>
              <div className="product-img" style={{ width: '100%', height: '280px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                <img src={p.images && p.images.length ? p.images[0] : '/vite.svg'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </Link>
            <div className="product-meta" style={{ padding: '12px', flex: 0 }}>
              <div className="title" style={{ fontWeight: '600', fontSize: '14px', marginBottom: '6px', lineHeight: '1.3' }}>{p.name}</div>
              <div className="price" style={{ fontSize: '18px', fontWeight: '700', color: '#e53e3e', marginBottom: '12px' }}>${(Number(p.price) || 0).toFixed(2)}</div>
            </div>
            <div className="product-actions" style={{ padding: '0 12px 12px', display: 'flex', gap: '8px', flex: 0 }}>
              <button className="btn" onClick={() => addToCart(p)} style={{ flex: 1, padding: '10px 12px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Add to cart</button>
              <Link to={`/product/${p._id}`} className="btn ghost" style={{ flex: 1, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', textAlign: 'center', textDecoration: 'none', color: '#2d3748', cursor: 'pointer' }}>View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
