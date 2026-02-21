import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const API_URL = 'https://sommys-store-backend.onrender.com/api/products'
    fetch(`${API_URL}/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d))
      .catch(() => {})
  }, [id])

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const idx = cart.findIndex((i) => i.productId === id)
    if (idx >= 0) cart[idx].quantity += 1
    else cart.push({ productId: id, name: product.name, price: product.price, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    navigate('/cart')
  }

  if (!product) return <div>Loading...</div>

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(0, 1fr) 320px', 
      gap: 28,
      padding: '0 0 40px 0'
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ 
          height: 420, 
          background: '#f5f5f5', 
          marginBottom: 20,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <img
            src={product.images && product.images.length ? product.images[0] : '/vite.svg'}
            alt={product.name || 'product'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <h2 style={{ fontSize: '1.875rem', marginBottom: 16, marginTop: 0 }}>{product.name}</h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#555', marginBottom: 24 }}>{product.description}</p>
      </div>
      <aside style={{ 
        border: '1px solid #e0e0e0', 
        padding: 20, 
        borderRadius: 12,
        backgroundColor: '#fafafa',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        height: 'fit-content',
        position: 'sticky',
        top: 20
      }}>
        <div style={{ fontWeight: 700, fontSize: 28, color: '#ef4444', marginBottom: 20 }}>
          ${product.price}
        </div>
        <button 
          onClick={addToCart} 
          style={{ 
            width: '100%',
            marginBottom: 12, 
            padding: '12px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dc2626'
            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ef4444'
            e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          Add to cart
        </button>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          aside {
            position: static !important;
            margin-top: 12px;
          }
        }
      `}</style>
    </div>
  )
}
