import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './checkout.css'

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  
  // Card states
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(cartData)
    } catch (e) {
      setCart([])
    }
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 0 ? 10 : 0
  const total = subtotal + tax + shipping

  // Format card number with spaces
  function handleCardNumberChange(e) {
    let value = e.target.value.replace(/\s/g, '')
    value = value.replace(/(\d{4})/g, '$1 ').trim()
    setCardNumber(value.slice(0, 19))
  }

  // Format expiry date MM/YY
  function handleExpiryChange(e) {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4)
    }
    setExpiryDate(value.slice(0, 5))
  }

  // Only allow numbers for CVV
  function handleCvvChange(e) {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
  }

  function validateForm() {
    const newErrors = {}
    
    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email'
    
    if (!fullName) newErrors.fullName = 'Full name is required'
    if (!address) newErrors.address = 'Address is required'
    if (!city) newErrors.city = 'City is required'
    if (!postalCode) newErrors.postalCode = 'Postal code is required'
    
    const cardDigits = cardNumber.replace(/\s/g, '')
    if (!cardDigits) newErrors.cardNumber = 'Card number is required'
    else if (cardDigits.length !== 16) newErrors.cardNumber = 'Card number must be 16 digits'
    
    if (!cardName) newErrors.cardName = 'Cardholder name is required'
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required'
    else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) newErrors.expiryDate = 'Format: MM/YY'
    
    if (!cvv) newErrors.cvv = 'CVV is required'
    else if (cvv.length !== 3 && cvv.length !== 4) newErrors.cvv = 'CVV must be 3-4 digits'
    
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateForm()
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) return
    
    setLoading(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setOrderPlaced(true)
      setLoading(false)
      localStorage.removeItem('cart')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }, 1500)
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add items to your cart before checking out.</p>
          <Link to="/products" className="btn primary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order has been confirmed.</p>
          <p className="order-id">Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          <p className="redirect-msg">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-main">
          <h1>Checkout</h1>

          {/* Shipping Information */}
          <section className="checkout-section">
            <h2>Shipping Address</h2>
            <form className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={errors.email ? 'input-error' : ''}
                    placeholder="you@example.com"
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className={errors.fullName ? 'input-error' : ''}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className={errors.address ? 'input-error' : ''}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <span className="error-msg">{errors.address}</span>}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className={errors.city ? 'input-error' : ''}
                    placeholder="New York"
                  />
                  {errors.city && <span className="error-msg">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input 
                    type="text" 
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className={errors.postalCode ? 'input-error' : ''}
                    placeholder="10001"
                  />
                  {errors.postalCode && <span className="error-msg">{errors.postalCode}</span>}
                </div>
              </div>
            </form>
          </section>

          {/* Payment Information */}
          <section className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-method-selector">
              <div className="method-option selected">
                <input type="radio" id="credit-card" name="payment" defaultChecked />
                <label htmlFor="credit-card">Credit Card</label>
              </div>
            </div>

            <div className="card-form-container">
              <div className="card-preview">
                <div className="card-chip"></div>
                <div className="card-number-preview">{cardNumber || '•••• •••• •••• ••••'}</div>
                <div className="card-details">
                  <div className="card-name-preview">{cardName.toUpperCase() || 'CARDHOLDER NAME'}</div>
                  <div className="card-expiry-preview">{expiryDate || 'MM/YY'}</div>
                </div>
              </div>

              <form className="card-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input 
                    type="text" 
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className={errors.cardName ? 'input-error' : ''}
                    placeholder="John Doe"
                  />
                  {errors.cardName && <span className="error-msg">{errors.cardName}</span>}
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={errors.cardNumber ? 'input-error' : ''}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  {errors.cardNumber && <span className="error-msg">{errors.cardNumber}</span>}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      className={errors.expiryDate ? 'input-error' : ''}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    {errors.expiryDate && <span className="error-msg">{errors.expiryDate}</span>}
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      type="text" 
                      value={cvv}
                      onChange={handleCvvChange}
                      className={errors.cvv ? 'input-error' : ''}
                      placeholder="123"
                      maxLength="4"
                    />
                    {errors.cvv && <span className="error-msg">{errors.cvv}</span>}
                  </div>
                </div>

                <button type="submit" className="btn primary btn-large" disabled={loading}>
                  {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="checkout-sidebar">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span className="item-name">{item.name} x{item.quantity || 1}</span>
                  <span className="item-price">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
