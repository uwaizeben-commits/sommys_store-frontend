import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/products')
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

      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p._id}>
            <Link to={`/product/${p._id}`} className="product-link">
              <div className="product-img">
                <img src={p.images && p.images.length ? p.images[0] : '/vite.svg'} alt={p.name} />
              </div>
            </Link>
            <div className="product-meta">
              <div className="title">{p.name}</div>
              <div className="price">${(Number(p.price) || 0).toFixed(2)}</div>
            </div>
            <div className="product-actions">
              <button className="btn" onClick={() => addToCart(p)}>Add to cart</button>
              <Link to={`/product/${p._id}`} className="btn ghost">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
