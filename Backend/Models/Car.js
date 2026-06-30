const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    brand: {
        type: String,
        required: true
    },
    model: String,
    year: Number,
    plateNumber: {
        type: String,
        required: true
    },
    color: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Car", carSchema);
