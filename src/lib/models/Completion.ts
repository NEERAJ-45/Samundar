import mongoose, { Schema, Document } from 'mongoose';

export interface ICompletion extends Document {
  storagePrefix: string;
  itemId: string;
  completedAt: string;
  userEmail?: string;
}

const CompletionSchema: Schema = new Schema({
  storagePrefix: { type: String, required: true },
  itemId: { type: String, required: true },
  completedAt: { type: String, required: true },
  userEmail: { type: String, required: true, default: 'NEERAJ' },
});

CompletionSchema.index({ storagePrefix: 1, itemId: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.Completion || mongoose.model<ICompletion>('Completion', CompletionSchema);
