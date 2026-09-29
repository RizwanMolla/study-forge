import mongoose, { Schema } from 'mongoose';

export interface IStudyActivity {
  _id: string;
  userId: mongoose.Types.ObjectId | string;
  date: string; // 'YYYY-MM-DD'
  focusMinutes: number;
  pomodoroCount: number;
  cardsReviewed: number;
  tasksCompleted: number;
  notesCreated: number;
  totalScore: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const StudyActivitySchema = new Schema<IStudyActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    focusMinutes: { type: Number, default: 0 },
    pomodoroCount: { type: Number, default: 0 },
    cardsReviewed: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    notesCreated: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index so each user has at most one record per day
StudyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.StudyActivity ||
  mongoose.model<IStudyActivity>('StudyActivity', StudyActivitySchema);
