const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    planName: {
      type: String,
      default: 'Standard Monthly All-Meals'
    },
    monthlyFee: {
      type: Number,
      required: true,
      default: 4200
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'expired', 'paused'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    billingCycle: {
      type: String,
      default: 'Monthly'
    },
    mealsIncluded: {
      type: [String],
      default: ['Breakfast', 'Lunch', 'Snacks', 'Dinner']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
