import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'https://sommys-store-backend.onrender.com/api/products'
const ORDERS_API = 'https://sommys-store-backend.onrender.com/api/orders'

export default function AdminDashboard() {
  const [tab, setTab] = useState('products') // 'products' or 'orders'
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', price: 1, quantity: 0, description: '', category: '', images: [], imageUrl: '' })
  const [editingOrder, setEditingOrder] = useState(null)
  const [orderStatusForm, setOrderStatusForm] = useState({ status: '', dispatchDate: '', departureDate: '', deliveryDate: '' })
  const CATEGORIES = ['Bags', 'Shoes', 'T-Shirts', 'Shirts', 'Polo', 'Boxers', 'Caps', 'Hoodies']
  const [error, setError] = useState('')
  const [useImageUrl, setUseImageUrl] = useState(true)
  const fileInputRef = React.useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || 'null')
    if (!admin) {
      navigate('/admin/login')
      return
    }
    fetchProducts()
    fetchOrders()
  }, [navigate])

  async function fetchProducts() {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load products')
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch(`${ORDERS_API}/admin/all`)
      const data = await res.json()
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (err) {
      console.error('Failed to load orders:', err)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.price) return setError('Product name and price are required')
    if (form.quantity < 0) return setError('Quantity cannot be negative')

    setLoading(true)
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    const headers = { 'Content-Type': 'application/json' }
    if (admin.token) headers['Authorization'] = `Bearer ${admin.token}`

    try {
      const submitData = {
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
        description: form.description,
        images: form.images && form.images.length > 0 ? form.images : (form.imageUrl ? [form.imageUrl] : [])
      }

      const url = editId ? `${API_URL}/${editId}` : API_URL
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(submitData)
      })
      if (!res.ok) {
        let msg = `Failed to ${editId ? 'update' : 'create'} product`
        try {
          const data = await res.json()
          if (data && data.message) msg = data.message
        } catch (e) {}
        throw new Error(msg)
      }
      await fetchProducts()
      setForm({ name: '', price: 1, quantity: 0, description: '', category: '', images: [], imageUrl: '' })
      setEditId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    setLoading(true)
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    const headers = {}
    if (admin.token) headers['Authorization'] = `Bearer ${admin.token}`

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers })
        if (!res.ok) {
          let msg = 'Failed to delete'
          try { const data = await res.json(); if (data && data.message) msg = data.message } catch (e) {}
          throw new Error(msg)
        }
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function editProduct(p) {
    setEditId(p._id)
    const images = p.images || []
    const firstImage = images.length > 0 ? images[0] : ''
    setForm({
      name: p.name,
      price: p.price,
      quantity: p.quantity || 0,
      category: p.category || '',
      description: p.description || '',
      images: images,
      imageUrl: firstImage
    })
    setUseImageUrl(true)
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Check file size (max 5MB per image)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      setError(`Image file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 5MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result
      setForm({...form, imageUrl: imageUrl || ''})
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  async function updateOrderStatus(orderId) {
    if (!orderId) return
    setError('')
    setLoading(true)
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    const headers = { 'Content-Type': 'application/json' }
    if (admin.token) headers['Authorization'] = `Bearer ${admin.token}`

    try {
      const updateData = {}
      if (orderStatusForm.status) updateData.status = orderStatusForm.status
      if (orderStatusForm.dispatchDate) updateData.dispatchDate = orderStatusForm.dispatchDate
      if (orderStatusForm.departureDate) updateData.departureDate = orderStatusForm.departureDate
      if (orderStatusForm.deliveryDate) updateData.deliveryDate = orderStatusForm.deliveryDate

      const res = await fetch(`${ORDERS_API}/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      })
      if (!res.ok) throw new Error('Failed to update order')
      
      await fetchOrders()
      setEditingOrder(null)
      setOrderStatusForm({ status: '', dispatchDate: '', departureDate: '', deliveryDate: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'TBA'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div style={{display: 'flex', gap: 12}}>
          <button className={`btn ${tab === 'products' ? 'primary' : ''}`} onClick={() => setTab('products')}>Products</button>
          <button className={`btn ${tab === 'orders' ? 'primary' : ''}`} onClick={() => setTab('orders')}>Orders</button>
          <button className="btn" onClick={() => { localStorage.removeItem('admin'); window.dispatchEvent(new CustomEvent('admin:change', { detail: null })); navigate('/'); }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-container">
        {tab === 'products' ? (
          <>
            <div className="admin-form-section">
              <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
              {error && <div className="admin-error">{error}</div>}
              <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-group">
              <label className="admin-label">Product Name *</label>
              <input type="text" placeholder="Enter product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Price * (USD)</label>
                <input type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Quantity Available *</label>
                <input type="number" placeholder="0" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} required />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Description</label>
              <textarea placeholder="Enter product description (details, features, size, etc)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="4" />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Product Image</label>
              <div className="admin-image-toggle">
                <button type="button" className={`toggle-btn ${useImageUrl ? 'active' : ''}`} onClick={() => setUseImageUrl(true)}>Image URL</button>
                <button type="button" className={`toggle-btn ${!useImageUrl ? 'active' : ''}`} onClick={() => setUseImageUrl(false)}>Upload File</button>
              </div>
              {useImageUrl ? (
                <input type="url" placeholder="Enter image URL (https://...)" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
              ) : (
                <>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button type="button" className="btn ghost" onClick={() => fileInputRef.current?.click()}>
                    Choose Image File
                  </button>
                  <div className="admin-file-info">Click button above or drag image here</div>
                </>
              )}
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="admin-image-preview" onError={() => setForm({...form, imageUrl: ''})} />}
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
              {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setForm({ name: '', price: 1, quantity: 0, description: '', category: '', images: [], imageUrl: '' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="admin-products-section">
          <h2>Products ({products.length})</h2>
          <div className="admin-products-list">
            {products.map(p => (
              <div key={p._id} className="admin-product-row">
                {p.images && p.images[0] && <img src={p.images[0]} alt={p.name} className="admin-product-thumb" />}
                <div className="admin-product-info">
                  <div className="admin-product-name">{p.name}</div>
                  {p.category && <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Category: {p.category}</div>}
                  <div className="admin-product-meta">
                    <span className="admin-product-price">${(Number(p.price) || 0).toFixed(2)}</span>
                    <span className="admin-product-qty">Qty: {p.quantity || 0}</span>
                  </div>
                  {p.description && <div className="admin-product-desc">{p.description.substring(0, 80)}...</div>}
                </div>
                <div className="admin-product-actions">
                  <button className="btn ghost" onClick={() => editProduct(p)}>Edit</button>
                  <button className="btn ghost" onClick={() => deleteProduct(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        ) : (
          <div className="admin-orders-section" style={{width: '100%'}}>
            <h2>Customer Orders ({orders.length})</h2>
            {error && <div className="admin-error">{error}</div>}
            {orders.length === 0 ? (
              <p style={{textAlign: 'center', color: '#999'}}>No orders yet</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                {orders.map(order => (
                  <div key={order._id} style={{border: '1px solid #e0e0e0', borderRadius: 8, padding: 16}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                      <div>
                        <h3 style={{margin: '0 0 4px 0'}}>Order #{order._id.toString().slice(-8).toUpperCase()}</h3>
                        <p style={{margin: 0, fontSize: '0.9rem', color: '#666'}}>
                          {order.userId?.name || 'Customer'} • {order.userId?.email || 'N/A'} • {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        backgroundColor: order.status === 'delivered' ? '#d4edda' : order.status === 'cancelled' ? '#f8d7da' : '#cce5ff',
                        color: order.status === 'delivered' ? '#155724' : order.status === 'cancelled' ? '#721c24' : '#004085',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>

                    <div style={{marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0'}}>
                      <p style={{margin: '0 0 8px 0', fontWeight: 600, fontSize: '0.9rem'}}>Items:</p>
                      {order.items?.map((item, idx) => (
                        <p key={idx} style={{margin: '4px 0', fontSize: '0.85rem', color: '#555'}}>
                          {item.name} x{item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      ))}
                      <p style={{margin: '8px 0 0 0', fontWeight: 600}}>Total: ${order.total.toFixed(2)}</p>
                    </div>

                    {editingOrder === order._id ? (
                      <div style={{padding: 12, backgroundColor: '#f9f9f9', borderRadius: 4, marginBottom: 12}}>
                        <h4 style={{margin: '0 0 12px 0'}}>Update Order</h4>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                          <select value={orderStatusForm.status} onChange={e => setOrderStatusForm({...orderStatusForm, status: e.target.value})} style={{padding: 8, borderRadius: 4, border: '1px solid #ddd'}}>
                            <option value="">Select status</option>
                            <option value="pending">Pending</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <input type="date" value={orderStatusForm.dispatchDate} onChange={e => setOrderStatusForm({...orderStatusForm, dispatchDate: e.target.value})} style={{padding: 8, borderRadius: 4, border: '1px solid #ddd'}} placeholder="Dispatch Date" />
                          <input type="date" value={orderStatusForm.departureDate} onChange={e => setOrderStatusForm({...orderStatusForm, departureDate: e.target.value})} style={{padding: 8, borderRadius: 4, border: '1px solid #ddd'}} placeholder="Departure Date" />
                          <input type="date" value={orderStatusForm.deliveryDate} onChange={e => setOrderStatusForm({...orderStatusForm, deliveryDate: e.target.value})} style={{padding: 8, borderRadius: 4, border: '1px solid #ddd'}} placeholder="Delivery Date" />
                        </div>
                        <div style={{marginTop: 12, display: 'flex', gap: 8}}>
                          <button className="btn primary" onClick={() => updateOrderStatus(order._id)} disabled={loading}>Update</button>
                          <button className="btn ghost" onClick={() => setEditingOrder(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn ghost" onClick={() => { setEditingOrder(order._id); const o = orders.find(x => x._id === order._id); setOrderStatusForm({status: o?.status || '', dispatchDate: o?.dispatchDate || '', departureDate: o?.departureDate || '', deliveryDate: o?.deliveryDate || ''}); }}>Update Status</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

}
