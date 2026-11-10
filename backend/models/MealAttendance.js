const mongoose = require('mongoose');

const mealAttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required']
    },
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      }
    },
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      lowercase: true
    },
    status: {
      type: String,
      enum: ['Consumed', 'Skipped', 'Guest Meal'],
      default: 'Consumed'
    },
    checkInTime: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

mealAttendanceSchema.index({ student: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealAttendance', mealAttendanceSchema);
