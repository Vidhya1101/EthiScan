const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema({
    query: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["ETHICAL", "WARNING", "UNETHICAL"],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
