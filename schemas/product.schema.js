import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    author: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enem: ['FOR_SALE', 'SOLD_OUT'],
      default: 'FOR_SALE',
    },
  },
  { timestamps: true } // createAt 대신
);

export default mongoose.model('Product', ProductSchema);
