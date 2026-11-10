const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      lowercase: true
    },
    items: {
      type: [String],
      required: [true, 'At least one menu item is required'],
      validate: [val => val.length > 0, 'Menu must contain at least one item']
    },
    description: {
      type: String,
      default: ''
    },
    specialDietNote: {
      type: String,
      default: ''
    },
    caloriesEstimate: {
      type: Number,
      default: 450
    },
    timing: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

menuSchema.index({ day: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);
