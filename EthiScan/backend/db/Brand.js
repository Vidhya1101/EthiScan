const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    industry: { type: String, required: true },
    website: String,
    description: String,
    scoreOverall: { type: Number, default: 5 },
    scoreEnv: { type: Number, default: 5 },
    scoreLabor: { type: Number, default: 5 },
    scoreGov: { type: Number, default: 5 },
    certifications: [String],
    isSuggested: { type: Boolean, default: false },
    status: { type: String, default: 'Approved' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', brandSchema);