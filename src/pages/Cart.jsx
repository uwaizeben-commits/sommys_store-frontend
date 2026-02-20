import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Cart() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
    } catch (e) {
      setCart([])
    }
  }, [])

  function updateQuantity(index, qty) {
    const next = [...cart]
    next[index].quantity = qty < 1 ? 1 : qty
    localStorage.setItem('cart', JSON.stringify(next))
    setCart(next)
    try { window.dispatchEvent(new CustomEvent('cart:change', { detail: next })) } catch (e) {}
  }

  function removeItem(index) {
    const next = [...cart]
    next.splice(index, 1)
    localStorage.setItem('cart', JSON.stringify(next))
    setCart(next)
    try { window.dispatchEvent(new CustomEvent('cart:change', { detail: next })) } catch (e) {}
  }

  const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0)

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your Cart</h2>
        <div className="cart-actions">
          <Link to="/" className="btn">Continue shopping</Link>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn primary">Start shopping</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-list">
            {cart.map((item, idx) => (
              <div className="cart-item" key={item.productId || idx}>
                <div className="cart-item-left">
                  <div className="thumb">
                    <img src={item.image || '/vite.svg'} alt={item.name} />
                  </div>
                  <div className="meta">
                    <div className="name">{item.name}</div>
                    <div className="sku">{item.sku || ''}</div>
                    <div className="price">${(Number(item.price) || 0).toFixed(2)}</div>
                  </div>
                </div>

                <div className="cart-item-right">
                  <label className="qty-label">Qty</label>
                  <input className="qty-input" type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(idx, Number(e.target.value))} />
                  <button className="btn ghost" onClick={() => removeItem(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <div className="summary-box">
              <div className="summary-row">
                <span>Items</span>
                <span>{cart.reduce((s, i) => s + (i.quantity || 0), 0)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn primary" style={{ display: 'block', textAlign: 'center' }}>Proceed to Checkout</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
