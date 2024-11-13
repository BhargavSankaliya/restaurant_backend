const mongoose = require('mongoose');
const validator = require("validator");
const commonSchema = require("./CommonModel");

const subscriptionSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    subscriptions: [
        {
            licenseKey: { type: String, unique: true },
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
            price: { type: Number },
            accessFeatures: [String],
            trialPeriod: { type: Boolean, default: false },
            trialEndDate: { type: Date },
            status: { type: String, enum: ['active', 'expired'], default: 'active' },
        },
    ],
});

subscriptionSchema.add(commonSchema);

const SubscriptionModel = mongoose.model('SubscriptionModel', subscriptionSchema);

module.exports = SubscriptionModel;
