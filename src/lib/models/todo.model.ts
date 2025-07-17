import mongoose, { Document, Schema } from 'mongoose';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface ITodo extends Document {
  _id: string;
  title: string;
  completed: boolean;
  type: 'todo' | 'weekly';
  dayOfWeek?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    type: { type: String, enum: ['todo', 'weekly'], required: true, default: 'todo' },
    dayOfWeek: { type: String, enum: daysOfWeek },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Do not create model if it already exists
export default mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
