const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required']
    },
    category: {
      type: String,
      enum: ['Food Quality', 'Cleanliness & Hygiene', 'Staff Behaviour', 'Timing & Punctuality', 'Variety', 'Other'],
      default: 'Food Quality'
    },
    mealType: {
      type: String,
      enum: ['General', 'breakfast', 'lunch', 'snacks', 'dinner'],
      default: 'General'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-5)'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5']
    },
    comment: {
      type: String,
      required: [true, 'Feedback comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Resolved'],
      default: 'Pending'
    },
    adminResponse: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
