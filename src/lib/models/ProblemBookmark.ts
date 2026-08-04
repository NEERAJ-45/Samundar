import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemBookmark extends Document {
  storagePrefix: string;
  itemId: string;
  userEmail?: string;
}

const ProblemBookmarkSchema: Schema = new Schema({
  storagePrefix: { type: String, required: true },
  itemId: { type: String, required: true },
  userEmail: { type: String, required: true, default: 'NEERAJ' },
});

ProblemBookmarkSchema.index({ storagePrefix: 1, itemId: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.ProblemBookmark || mongoose.model<IProblemBookmark>('ProblemBookmark', ProblemBookmarkSchema);
