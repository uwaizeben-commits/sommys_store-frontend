import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recommended')
  const [allProducts, setAllProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const CATEGORIES = ['Bags', 'Shoes', 'T-Shirts', 'Shirts', 'Polo', 'Boxers', 'Caps', 'Hoodies']

  useEffect(() => {
    setLoading(true)
    const API_URL = 'https://sommys-store-backend.onrender.com/api/products'
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        const productsList = data || []
        setAllProducts(productsList)
        
        // Check if there's a search query
        const searchQuery = sessionStorage.getItem('searchQuery')
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          // Check if query matches a category
          if (CATEGORIES.some(cat => cat.toLowerCase() === query)) {
            filterByCategory(query.charAt(0).toUpperCase() + query.slice(1))
          } else {
            // Search by product name
            const filtered = productsList.filter(p => p.name.toLowerCase().includes(query))
            setProducts(filtered)
          }
          sessionStorage.removeItem('searchQuery')
        } else {
          setProducts(productsList)
        }
      })
      .catch(() => {
        setAllProducts([])
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  function filterByCategory(category) {
    setSelectedCategory(category)
    let filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category)
    sortProducts(sortBy, filtered)
  }

  function sortProducts(option, productsToSort = null) {
    setSortBy(option)
    const filtered = selectedCategory === 'all' ? allProducts : allProducts.filter(p => p.category === selectedCategory)
    let sorted = productsToSort || [...filtered]
    
    if (option === 'price-low') {
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else if (option === 'price-high') {
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }
    
    setProducts(sorted)
  }

  function addToCart(p) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existing = cart.find((i) => i.productId === p._id)
      if (existing) existing.quantity = (existing.quantity || 1) + 1
      else cart.push({ productId: p._id, name: p.name, price: p.price, image: p.images && p.images[0], quantity: 1 })
      localStorage.setItem('cart', JSON.stringify(cart))
      try { window.dispatchEvent(new CustomEvent('cart:change', { detail: cart })) } catch (e) {}
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

      <div className="products-categories" style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button 
          onClick={() => filterByCategory('all')} 
          style={{ 
            padding: '8px 16px', 
            border: selectedCategory === 'all' ? '2px solid #e53e3e' : '1px solid #e0e0e0',
            borderRadius: '20px',
            backgroundColor: selectedCategory === 'all' ? '#ffe5e5' : 'white',
            color: selectedCategory === 'all' ? '#e53e3e' : '#2d3748',
            fontWeight: selectedCategory === 'all' ? '600' : '500',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => filterByCategory(cat)}
            style={{
              padding: '8px 16px',
              border: selectedCategory === cat ? '2px solid #e53e3e' : '1px solid #e0e0e0',
              borderRadius: '20px',
              backgroundColor: selectedCategory === cat ? '#ffe5e5' : 'white',
              color: selectedCategory === cat ? '#e53e3e' : '#2d3748',
              fontWeight: selectedCategory === cat ? '600' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="products-toolbar">
        <div className="results">{loading ? 'Loading...' : `${products.length} items`}</div>
        <div className="sort">Sort: <select value={sortBy} onChange={(e) => sortProducts(e.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select></div>
      </div>

      {selectedCategory === 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
          {CATEGORIES.map((cat) => {
            const items = allProducts.filter(p => p.category === cat)
            if (!items.length) return null
            const sorted = (() => {
              if (sortBy === 'price-low') return [...items].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
              if (sortBy === 'price-high') return [...items].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
              return items
            })()

            return (
              <section key={cat}>
                <h2 style={{ margin: '8px 0' }}>{cat}</h2>
                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {sorted.map((p) => (
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
              </section>
            )
          })}

          {/* Other / uncategorized products */}
          {(() => {
            const others = allProducts.filter(p => !CATEGORIES.includes(p.category))
            if (!others.length) return null
            const sorted = (() => {
              if (sortBy === 'price-low') return [...others].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
              if (sortBy === 'price-high') return [...others].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
              return others
            })()
            return (
              <section key="other">
                <h2 style={{ margin: '8px 0' }}>Other</h2>
                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {sorted.map((p) => (
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
              </section>
            )
          })()}
        </div>
      ) : (
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
      )}
    </div>
  )
}
