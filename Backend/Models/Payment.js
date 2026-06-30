const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaintOrder",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ["Cash", "Bakong"]
    },
    status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);
