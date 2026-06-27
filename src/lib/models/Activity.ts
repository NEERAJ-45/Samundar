import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  text: string;
  createdAt: Date;
  userEmail: string;
}

const ActivitySchema: Schema = new Schema({
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userEmail: { type: String, required: true, index: true },
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
