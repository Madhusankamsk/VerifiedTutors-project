import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite; 