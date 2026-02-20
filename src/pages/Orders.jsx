import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ORDERS_API = 'https://sommys-store-backend.onrender.com/api/orders'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [cancelModalOrder, setCancelModalOrder] = useState(null)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      if (u) setUser(u)
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${ORDERS_API}/user/${user.id}`)
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (err) {
        console.error(err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  function formatDate(date) {
    if (!date) return 'TBA'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  async function handleCancel(orderId) {
    if (!cancelModalOrder) return
    setCancelError('')
    try {
      const res = await fetch(`${ORDERS_API}/${orderId}/cancel`, { method: 'POST' })
      if (!res.ok) {
        let msg = 'Failed to cancel'
        try { const j = await res.json(); if (j && j.message) msg = j.message } catch (e) {}
        throw new Error(msg)
      }
      const data = await res.json()
      // Refresh orders
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled', cancellationFee: data.cancellationFee } : o))
      setCancelModalOrder(null)
      alert(`Order cancelled. 3% fee ($${data.cancellationFee}) deducted. Refund of $${data.refundAmount} will be sent to your payment method within 5-7 business days.`)
    } catch (err) {
      setCancelError(err.message || 'Error cancelling order')
    }
  }

  if (!user || !user.id) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Orders</h2>
        <p>Please <Link to="/signin">sign in</Link> to view your orders.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Orders</h2>
        <p>Loading...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Orders</h2>
        <p>No orders yet. <Link to="/products">Start shopping</Link></p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px' }}>Your Orders</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map(order => (
          <div key={order._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Placed: {formatDate(order.orderDate)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: order.status === 'delivered' ? '#d4edda' : order.status === 'cancelled' ? '#f8d7da' : '#cce5ff',
                  color: order.status === 'delivered' ? '#155724' : order.status === 'cancelled' ? '#721c24' : '#004085',
                  fontWeight: '600',
                  fontSize: '12px'
                }}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>Items</h4>
              {order.items && order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>Tracking</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Order Placed</p>
                  <p style={{ margin: 0, fontWeight: '600' }}>{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Dispatch from Store</p>
                  <p style={{ margin: 0, fontWeight: '600' }}>{formatDate(order.dispatchDate)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Departure from Store</p>
                  <p style={{ margin: 0, fontWeight: '600' }}>{formatDate(order.departureDate)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>Expected Delivery</p>
                  <p style={{ margin: 0, fontWeight: '600' }}>{formatDate(order.deliveryDate)}</p>
                </div>
              </div>
            </div>

            {order.status === 'cancelled' && order.cancellationFee && (
              <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '12px', marginBottom: '15px', fontSize: '14px' }}>
                <strong>Cancellation Fee:</strong> ${order.cancellationFee.toFixed(2)} deducted. Refund of ${order.refundAmount.toFixed(2)} will be processed to your payment method within 5-7 business days.
              </div>
            )}

            {['pending', 'dispatched'].includes(order.status) && (
              <button
                onClick={() => setCancelModalOrder(order._id)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel Order
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Cancel Order?</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
              Cancelling this order will deduct <strong>3% of the order amount</strong> as a cancellation fee.
            </p>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              The remaining amount will be refunded to your original payment method within 5-7 business days.
            </p>
            {cancelError && <div style={{ color: '#e53e3e', marginBottom: '15px', fontSize: '14px' }}>{cancelError}</div>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setCancelModalOrder(null); setCancelError('') }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancel(cancelModalOrder)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
