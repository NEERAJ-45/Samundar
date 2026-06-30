import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyRecord extends Document {
  date: string;
  userEmail: string;
  completedTaskIds: string[];
  note: string;
  updatedAt: Date;
}

const DailyRecordSchema: Schema = new Schema({
  date:              { type: String, required: true },
  userEmail:         { type: String, required: true },
  completedTaskIds:  { type: [String], default: [] },
  note:              { type: String, default: '' },
  updatedAt:         { type: Date, default: Date.now },
});

DailyRecordSchema.index({ date: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.DailyRecord || mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema);
