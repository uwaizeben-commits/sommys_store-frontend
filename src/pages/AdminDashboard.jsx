import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5001/api/products'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', price: 0, description: '', images: [] })
  const [error, setError] = useState('')
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
    if (!form.name || !form.price) return setError('Name and price required')

    setLoading(true)
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    const headers = { 'Content-Type': 'application/json' }
    if (admin.token) headers['Authorization'] = `Bearer ${admin.token}`

    try {
      const url = editId ? `${API_URL}/${editId}` : API_URL
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error(`Failed to ${editId ? 'update' : 'create'} product`)
      await fetchProducts()
      setForm({ name: '', price: 0, description: '', images: [] })
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
    setForm({ name: p.name, price: p.price, description: p.description || '', images: p.images || [] })
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
            <input type="text" placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <input type="text" placeholder="Image URL (comma-separated)" value={(form.images || []).join(', ')} onChange={e => setForm({...form, images: e.target.value.split(',').map(s => s.trim())})} />
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
            </button>
            {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setForm({ name: '', price: 0, description: '', images: [] }); }}>Cancel</button>}
          </form>
        </div>

        <div className="admin-products-section">
          <h2>Products ({products.length})</h2>
          <div className="admin-products-list">
            {products.map(p => (
              <div key={p._id} className="admin-product-row">
                <div className="admin-product-info">
                  <div className="admin-product-name">{p.name}</div>
                  <div className="admin-product-price">${(Number(p.price) || 0).toFixed(2)}</div>
                  {p.description && <div className="admin-product-desc">{p.description.substring(0, 60)}...</div>}
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
