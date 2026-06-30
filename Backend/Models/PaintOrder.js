const mongoose = require("mongoose");

const paintOrderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
    },
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaintColor"
    },
    paintType: {
        type: String,
        trim: true     // accepts any text — Khmer, custom, etc.
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Painting", "Drying", "Completed"],
        default: "Pending"
    },
    startDate: Date,
    finishDate: Date,
    note: String
}, {
    timestamps: true
});

module.exports = mongoose.model("PaintOrder", paintOrderSchema);
