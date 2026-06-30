require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const Customer = require('./models/Customer');
const Car = require('./models/Car');
const PaintColor = require('./models/PaintColor');
const PaintOrder = require('./models/PaintOrder');
const Payment = require('./models/Payment');

const connectDB = require('./config/db');

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('Seeding data to create collections...');

        // 1. Create a Customer
        const customer = await Customer.create({
            name: "John Doe (Test)",
            phone: "012345678",
            address: "Phnom Penh"
        });

        // 2. Create a Car for the Customer
        const car = await Car.create({
            customerId: customer._id,
            brand: "Toyota",
            model: "Prius",
            year: 2015,
            plateNumber: "2A-1234",
            color: "White"
        });

        // 3. Create a Paint Color
        const paintColor = await PaintColor.create({
            name: "Pearl White",
            code: "#F0F8FF",
            price: 150
        });

        // 4. Create a Paint Order
        const paintOrder = await PaintOrder.create({
            customerId: customer._id,
            carId: car._id,
            colorId: paintColor._id,
            paintType: "Full Car",
            price: 150,
            status: "Pending"
        });

        // 5. Create a Payment for the Order
        const payment = await Payment.create({
            orderId: paintOrder._id,
            amount: 150,
            method: "Cash",
            status: "Paid"
        });

        console.log('Successfully added test data to ALL collections!');
        console.log('You should now see customers, cars, paintcolors, paintorders, and payments in MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data: ', error);
        process.exit(1);
    }
};

seedDatabase();
