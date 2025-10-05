const mongoose = require('mongoose');

const EtfSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Etf', EtfSchema);