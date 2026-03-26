import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB Connection (Fallback to in-memory if no URI provided)
const MONGODB_URI = process.env.MONGODB_URI;
let useInMemory = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch(err => {
      console.error('\n❌ MongoDB Connection Error:');
      if (err.message && (err.message.includes('bad auth') || err.message.includes('authentication failed'))) {
        console.error('   Authentication failed. Please check your MONGODB_URI secret.');
        console.error('   1. Make sure you replaced <password> with your actual database user password.');
        console.error('   2. Ensure the username is correct.');
        console.error('   3. If your password contains special characters (like @, :, /, etc.), they must be URL-encoded.');
      } else {
        console.error('   ' + err.message);
      }
      console.log('\n⚠️  Falling back to in-memory store. Data will reset on server restart.\n');
      useInMemory = true;
    });
} else {
  console.log('No MONGODB_URI provided. Using in-memory store for products.');
  useInMemory = true;
}

// Product Schema & Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// In-memory store fallback
let inMemoryProducts: any[] = [
  {
    _id: '1',
    name: 'Classic Burger',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'Burgers',
    description: 'Juicy beef patty with lettuce, tomato, and cheese.',
    createdAt: new Date()
  },
  {
    _id: '2',
    name: 'Margherita Pizza',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a30536?w=800&q=80',
    category: 'Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
    createdAt: new Date()
  }
];

// Order Schema & Model
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

let inMemoryOrders: any[] = [];

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    if (useInMemory) {
      return res.json(inMemoryProducts);
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      return res.status(400).json({ error: 'Image is required' });
    }

    const productData = {
      name,
      price: Number(price),
      image: imageUrl,
      category,
      description
    };

    if (useInMemory) {
      const newProduct = { ...productData, _id: Date.now().toString(), createdAt: new Date() };
      inMemoryProducts.unshift(newProduct);
      return res.status(201).json(newProduct);
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description } = req.body;
    
    const updateData: any = {
      name,
      price: Number(price),
      category,
      description
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      updateData.image = req.body.imageUrl;
    }

    if (useInMemory) {
      const index = inMemoryProducts.findIndex(p => p._id === id);
      if (index !== -1) {
        inMemoryProducts[index] = { ...inMemoryProducts[index], ...updateData };
        return res.json(inMemoryProducts[index]);
      }
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useInMemory) {
      inMemoryProducts = inMemoryProducts.filter(p => p._id !== id);
      return res.json({ message: 'Product deleted' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body;
    
    const orderData = {
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount,
      status: 'Pending'
    };

    if (useInMemory) {
      const newOrder = { ...orderData, _id: Date.now().toString(), createdAt: new Date() };
      inMemoryOrders.unshift(newOrder);
      return res.status(201).json(newOrder);
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (useInMemory) {
      return res.json(inMemoryOrders);
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (useInMemory) {
      const index = inMemoryOrders.findIndex(o => o._id === id);
      if (index !== -1) {
        inMemoryOrders[index].status = status;
        return res.json(inMemoryOrders[index]);
      }
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
