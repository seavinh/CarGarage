const mongoose = require("mongoose");

const paintColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("PaintColor", paintColorSchema);
