require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./Routes/authRoutes');
const customerRoutes = require('./Routes/customerRoutes');
const carRoutes = require('./Routes/carRoutes');
const paintRoutes = require('./Routes/paintRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/paints', paintRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Car Garage API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
