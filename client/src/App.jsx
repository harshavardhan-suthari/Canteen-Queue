import { useEffect, useState } from 'react';

const features = [
  { icon: '📱', title: 'Online Ordering', description: 'Browse the menu, add items to cart, and order from anywhere on campus.' },
  { icon: '💳', title: 'Instant Payment', description: 'Pay securely through digital methods and skip the counter queue.' },
  { icon: '🎫', title: 'Token & OTP', description: 'Receive a unique token and OTP for fast pickup verification.' },
  { icon: '📊', title: 'Queue Tracking', description: 'Check your position in the queue in real-time without waiting.' },
  { icon: '👨‍🍳', title: 'Staff Dashboard', description: 'Staff can manage orders, verify OTPs, and update preparation status.' },
  { icon: '⚡', title: 'Availability Control', description: 'Toggle item availability live so students only see what is ready.' }
];

const flowSteps = [
  { emoji: '🛒', label: 'Student Orders' },
  { emoji: '💳', label: 'Payment Verified' },
  { emoji: '🎫', label: 'Token + OTP' },
  { emoji: '✅', label: 'OTP Verified' },
  { emoji: '📋', label: 'Queue Assigned' },
  { emoji: '🍳', label: 'Food Prepared' },
  { emoji: '🎉', label: 'Delivered' }
];

function App() {
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('12:30');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [orderResult, setOrderResult] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then(setMenu)
      .catch(() => setMenu([]));

    const storedUser = localStorage.getItem('canteenUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  const updateQuantity = (itemId, delta) => {
    setSelectedItems((current) => {
      const existing = current.find((entry) => entry.id === itemId);
      if (existing) {
        const next = current
          .map((entry) => (entry.id === itemId ? { ...entry, quantity: Math.max(0, entry.quantity + delta) } : entry))
          .filter((entry) => entry.quantity > 0);
        return next;
      }

      if (delta > 0) {
        return [...current, { id: itemId, quantity: 1 }];
      }
      return current;
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthMessage('');

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: authName, phone: authPhone, email: authEmail, password: authPassword })
    });

    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      localStorage.setItem('canteenUser', JSON.stringify(data.user));
      setAuthMessage('Registration successful. You are now logged in.');
      setAuthPassword('');
    } else {
      setAuthMessage(data.message || 'Registration failed.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthMessage('');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword })
    });

    const data = await response.json();
    if (response.ok) {
      setCurrentUser(data.user);
      localStorage.setItem('canteenUser', JSON.stringify(data.user));
      setAuthMessage('Login successful.');
      setAuthPassword('');
    } else {
      setAuthMessage(data.message || 'Login failed.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('canteenUser');
    setAuthMessage('Logged out successfully.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        phone,
        pickupTime,
        paymentMethod,
        selectedItems,
        userId: currentUser?.id
      })
    });

    const data = await response.json();
    if (response.ok) {
      setOrderResult(data);
      setSelectedItems([]);
      if (!currentUser) {
        setCustomerName('');
        setPhone('');
      }
    } else {
      alert(data.message || 'Order failed.');
    }
  };

  const subtotal = selectedItems.reduce((sum, item) => {
    const menuItem = menu.find((entry) => entry.id === item.id);
    return sum + (menuItem?.price || 0) * item.quantity;
  }, 0);

  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const serviceFee = 15;

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Digital Canteen System</span>
          <h1>Skip the Queue. Order Smart.</h1>
          <p className="hero-text">
            Order food from your college canteen online, pay securely, get a token and OTP, and collect your meal when it is ready.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#order">Start Ordering →</a>
            <a className="button secondary" href="#features">Explore Features</a>
            {currentUser && (
              <button type="button" className="button secondary" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>

        <div className="hero-panel">
          <div className="stats">
            <div className="stat-card">
              <span>🍽️</span>
              <div>
                <strong>6 menu items</strong>
                <p>Fresh choices every day</p>
              </div>
            </div>
            <div className="stat-card">
              <span>⏱️</span>
              <div>
                <strong>Instant token</strong>
                <p>Get pickup details immediately</p>
              </div>
            </div>
          </div>

          <div className="hero-order-card">
            <h2>Quick Preorder Summary</h2>
            <div className="hero-order-row">
              <span>Selected items</span>
              <strong>{selectedCount}</strong>
            </div>
            <div className="hero-order-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="hero-order-row total-row">
              <span>Total</span>
              <strong>₹{subtotal + serviceFee}</strong>
            </div>
            <p className="hero-order-note">Choose your favorite items, confirm your pickup time, and we’ll assign your queue token.</p>
          </div>
        </div>
      </header>

      <section id="features" className="section features">
        <div className="section-head">
          <p className="eyebrow">Everything You Need</p>
          <h2>Campus ordering made simple for students and staff.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section auth-section">
        <div className="auth-card">
          {currentUser ? (
            <div className="auth-status">
              <h2>Welcome back, {currentUser.name}</h2>
              <p>You are logged in with {currentUser.email}.</p>
              <div className="auth-details">
                <span>{currentUser.phone}</span>
                <span>Member since {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
              <button type="button" className="button secondary" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="auth-form-wrapper">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={authMode === 'login' ? 'tab active' : 'tab'}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? 'tab active' : 'tab'}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="order-form">
                {authMode === 'register' && (
                  <>
                    <label>
                      Name
                      <input value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                    </label>
                    <label>
                      Phone
                      <input value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} required />
                    </label>
                  </>
                )}
                <label>
                  Email
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                </label>
                <label>
                  Password
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                </label>
                <button type="submit" className="button primary full-width">
                  {authMode === 'login' ? 'Login' : 'Create account'}
                </button>
                {authMessage && <p className="auth-message">{authMessage}</p>}
              </form>
            </div>
          )}
        </div>
      </section>

      <section id="order" className="section order-section">
        <div className="order-panel">
          <div className="card order-card">
            <h2>Menu & Cart</h2>
            <p>Select your meals and confirm pickup details in one place.</p>
            <div className="menu-list">
              {menu.map((item) => {
                const quantity = selectedItems.find((entry) => entry.id === item.id)?.quantity || 0;
                return (
                  <div key={item.id} className="menu-item">
                          <div className="menu-item-preview">
                      {item.image && <img className="menu-item-image" src={item.image} alt={item.name} />}
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <strong>₹{item.price}</strong>
                      </div>
                    </div>
                    <div className="counter">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card order-card form-card">
            <h2>Place Pre-Order</h2>
            <form onSubmit={handleSubmit} className="order-form">
              <label>
                Name
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </label>
              <label>
                Phone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
              <label>
                Pickup Time
                <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
              </label>
              <label>
                Payment Method
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                </select>
              </label>

              <div className="summary">
                <div>Subtotal</div>
                <strong>₹{subtotal}</strong>
              </div>
              <div className="summary">
                <div>Service Fee</div>
                <strong>₹{serviceFee}</strong>
              </div>
              <div className="summary total-summary">
                <div>Total</div>
                <strong>₹{subtotal + serviceFee}</strong>
              </div>

              <button type="submit" className="button primary full-width">
                Confirm Order
              </button>
            </form>

            {orderResult && (
              <div className="receipt">
                <h3>Order confirmed</h3>
                <p>Token: <strong>{orderResult.token}</strong></p>
                <p>Pickup: {orderResult.pickupTime}</p>
                <p>Payment: {orderResult.paymentMethod}</p>
                <p>Total: ₹{orderResult.total}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="flow" className="section flow-section">
        <div className="section-head">
          <p className="eyebrow">How It Works</p>
          <h2>Simple steps from order to pickup.</h2>
        </div>
        <div className="flow-grid">
          {flowSteps.map((step) => (
            <div key={step.label} className="flow-card">
              <span>{step.emoji}</span>
              <p>{step.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        © 2026 CanteenQueue — Built with ❤️ for college students
      </footer>
    </div>
  );
}

export default App;
