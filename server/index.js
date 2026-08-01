const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const ordersPath = path.join(__dirname, 'data', 'orders.json');
const usersPath = path.join(__dirname, 'data', 'users.json');
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
const clientIndexPath = path.join(clientBuildPath, 'index.html');

app.use(cors());
app.use(express.json());
app.use(express.static(clientBuildPath, { index: false }));

const menu = [
  {
    id: 'veg-biryani',
    name: 'Veg Biryani',
    price: 140,
    description: 'Flavorful rice bowl with spice-rich vegetables.',
    image: 'https://images.unsplash.com/photo-1604908177521-3bdc89d65c4c?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'chicken-wrap',
    name: 'Chicken Wrap',
    price: 120,
    description: 'Grilled chicken wrap with fresh veggies.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'pasta',
    name: 'Creamy Pasta',
    price: 110,
    description: 'Silky pasta with tomato herb sauce.',
    image: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f4f1?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'juice',
    name: 'Fresh Juice',
    price: 60,
    description: 'Cold-pressed seasonal fruit juice.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'dessert',
    name: 'Brownie',
    price: 70,
    description: 'Warm chocolate brownie with vanilla cream.',
    image: 'https://images.unsplash.com/photo-1542826438-8a4b9b784b47?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    price: 150,
    description: 'Smoky grilled paneer cubes with aromatic spices.',
    image: 'https://images.unsplash.com/photo-1603133872875-3544493977b7?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'masala-dosa',
    name: 'Masala Dosa',
    price: 100,
    description: 'Crispy dosa stuffed with spiced potato filling.',
    image: 'https://images.unsplash.com/photo-1580657012250-1b7545d0e3cd?auto=format&fit=crop&w=640&q=80'
  },
  {
    id: 'veg-sandwich',
    name: 'Veg Sandwich',
    price: 90,
    description: 'Toasted sandwich with fresh vegetables and chutney.',
    image: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=640&q=80'
  }
];

function readOrders() {
  if (!fs.existsSync(ordersPath)) {
    fs.mkdirSync(path.dirname(ordersPath), { recursive: true });
    fs.writeFileSync(ordersPath, '[]');
  }

  const content = fs.readFileSync(ordersPath, 'utf8');
  return JSON.parse(content);
}

function writeOrders(orders) {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
}

function readUsers() {
  if (!fs.existsSync(usersPath)) {
    fs.mkdirSync(path.dirname(usersPath), { recursive: true });
    fs.writeFileSync(usersPath, '[]');
  }

  const content = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(content);
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/menu', (_req, res) => {
  res.json(menu);
});

app.post('/api/register', (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, phone, email, and password.' });
  }

  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: 'Email is already registered.' });
  }

  if (users.some((user) => user.phone === phone)) {
    return res.status(400).json({ message: 'Phone number is already registered.' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    phone,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  const safeUser = {
    id: newUser.id,
    name: newUser.name,
    phone: newUser.phone,
    email: newUser.email,
    createdAt: newUser.createdAt
  };

  res.status(201).json({ user: safeUser });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const users = readUsers();
  const user = users.find((entry) => entry.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    createdAt: user.createdAt
  };

  res.json({ user: safeUser });
});

app.post('/api/orders', (req, res) => {
  const { customerName, phone, pickupTime, paymentMethod, selectedItems, userId } = req.body;

  if (!customerName || !phone || !pickupTime || !paymentMethod || !selectedItems?.length) {
    return res.status(400).json({ message: 'Please provide all required details.' });
  }

  const orderedItems = selectedItems.map((item) => {
    const menuItem = menu.find((entry) => entry.id === item.id);
    return {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity || 1
    };
  });

  const subtotal = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = 15;
  const total = subtotal + serviceFee;
  const token = `CT-${Math.floor(1000 + Math.random() * 9000)}`;

  const order = {
    id: uuidv4(),
    userId: userId || null,
    customerName,
    phone,
    pickupTime,
    paymentMethod,
    items: orderedItems,
    subtotal,
    serviceFee,
    total,
    token,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);

  res.status(201).json(order);
});

app.get('/api/orders', (_req, res) => {
  res.json(readOrders());
});

app.get('*', (_req, res) => {
  if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.status(404).send('Frontend build not found. Run npm run build first.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart canteen server running on http://localhost:${PORT}`);
});
