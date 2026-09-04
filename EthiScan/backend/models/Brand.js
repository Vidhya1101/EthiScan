const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({

    brandName: String,

    industry: String,

    ethicalScore: Number,

    category: String,

    country: String,

    pros: String,

    cons: String,

    sustainability: String,

    alternatives: [String],

    barcode: String
});

module.exports = mongoose.model("Brand", BrandSchema);