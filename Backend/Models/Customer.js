const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  role: {
    type: String,
    default: 'User'
  },
  status: {
    type: String,
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Customer", customerSchema);