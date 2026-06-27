import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomTopic extends Document {
  storagePrefix: string;
  id: number;
  title: string;
  difficulty: string;
  link: string;
  userEmail?: string;
}

const CustomTopicSchema: Schema = new Schema({
  storagePrefix: { type: String, required: true },
  id: { type: Number, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  link: { type: String, default: '' },
  userEmail: { type: String, required: true, default: 'NEERAJ' },
});

CustomTopicSchema.index({ storagePrefix: 1, id: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.CustomTopic || mongoose.model<ICustomTopic>('CustomTopic', CustomTopicSchema);
