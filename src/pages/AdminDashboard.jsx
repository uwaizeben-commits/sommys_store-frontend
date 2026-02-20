import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'https://sommys-store-backend.onrender.com/api/products'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', price: 1, quantity: 0, description: '', images: [], imageUrl: '' })
  const [error, setError] = useState('')
  const [useImageUrl, setUseImageUrl] = useState(true)
  const fileInputRef = React.useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || 'null')
    if (!admin) {
      // Redirect to admin login if not authenticated
      navigate('/admin/login')
      return
    }
    fetchProducts()
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
      if (!res.ok) throw new Error(`Failed to ${editId ? 'update' : 'create'} product`)
      await fetchProducts()
      setForm({ name: '', price: 1, quantity: 0, description: '', images: [], imageUrl: '' })
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
      if (!res.ok) throw new Error('Failed to delete')
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

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={() => { localStorage.removeItem('admin'); window.dispatchEvent(new CustomEvent('admin:change', { detail: null })); navigate('/'); }}>
          Sign out
        </button>
      </div>

      <div className="admin-container">
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
              {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setForm({ name: '', price: 1, quantity: 0, description: '', images: [], imageUrl: '' }); }}>Cancel</button>}
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
      </div>
    </div>
  )
}
