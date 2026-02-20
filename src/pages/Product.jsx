import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
      <div>
        <div style={{ height: 360, background: '#eee', marginBottom: 12 }}>
          <img
            src={product.images && product.images.length ? product.images[0] : '/vite.svg'}
            alt={product.name || 'product'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
      </div>
      <aside style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>${product.price}</div>
        <button onClick={addToCart} style={{ marginTop: 12, padding: '8px 12px' }}>Add to cart</button>
      </aside>
    </div>
  )
}
