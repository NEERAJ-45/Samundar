import mongoose, { Schema, Document } from 'mongoose';

export interface IRevision extends Document {
  id: string;
  concept: string;
  stage: number;
  dueDate: string;
  completed: boolean;
  userEmail?: string;
}

const RevisionSchema: Schema = new Schema({
  id: { type: String, required: true },
  concept: { type: String, required: true },
  stage: { type: Number, required: true, default: 0 },
  dueDate: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  userEmail: { type: String, required: true, default: 'NEERAJ' },
});

RevisionSchema.index({ id: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.Revision || mongoose.model<IRevision>('Revision', RevisionSchema);
