const mongoose = require("mongoose");


const LimitSchema = new mongoose.Schema({
    currency: String,
    lt:Number,
    gt:Number,
    active: {
        type: Boolean,
        default: true
    },
    last_notification_sent_time:{
        type: Date
    }
}, {timestamps: true});

module.exports = {LimitSchema};
