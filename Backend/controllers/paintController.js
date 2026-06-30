const PaintColor = require('../models/PaintColor');
const PaintOrder = require('../models/PaintOrder');

// --- Paint Color Methods ---

exports.createColor = async (req, res) => {
    try {
        const color = new PaintColor(req.body);
        const savedColor = await color.save();
        res.status(201).json(savedColor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getColors = async (req, res) => {
    try {
        const colors = await PaintColor.find();
        res.status(200).json(colors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getColorById = async (req, res) => {
    try {
        const color = await PaintColor.findById(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
        res.status(200).json(color);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateColor = async (req, res) => {
    try {
        const color = await PaintColor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!color) return res.status(404).json({ message: 'Color not found' });
        res.status(200).json(color);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteColor = async (req, res) => {
    try {
        const color = await PaintColor.findByIdAndDelete(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
        res.status(200).json({ message: 'Color deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Paint Order Methods ---

exports.createOrder = async (req, res) => {
    try {
        const order = new PaintOrder(req.body);
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await PaintOrder.find()
            .populate('customerId', 'name phone')
            .populate('carId', 'brand model plateNumber')
            .populate('colorId', 'name code');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await PaintOrder.findById(req.params.id)
            .populate('customerId', 'name phone')
            .populate('carId', 'brand model plateNumber')
            .populate('colorId', 'name code');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await PaintOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await PaintOrder.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
