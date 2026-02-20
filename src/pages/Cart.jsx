import React, { useEffect, useState } from 'react'

export default function Cart() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  function updateQuantity(index, qty) {
    const next = [...cart]
    next[index].quantity = qty
    localStorage.setItem('cart', JSON.stringify(next))
    setCart(next)
  }

  function remove(index) {
    const next = [...cart]
    next.splice(index, 1)
    localStorage.setItem('cart', JSON.stringify(next))
    setCart(next)
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 && <div>Your cart is empty.</div>}
      {cart.map((item, idx) => (
        <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{item.name}</div>
            <div>${item.price}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" value={item.quantity} min={1} onChange={(e) => updateQuantity(idx, Number(e.target.value))} style={{ width: 60 }} />
            <button onClick={() => remove(idx)}>Remove</button>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, fontWeight: 700 }}>Total: ${total.toFixed(2)}</div>
    </div>
  )
}
