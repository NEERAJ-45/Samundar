import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatKey extends Document {
  userId: string;
  publicKey: string;
  updatedAt: Date;
}

const ChatKeySchema = new Schema<IChatKey>({
  userId: { type: String, required: true, unique: true, index: true },
  publicKey: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

ChatKeySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const ChatKey =
  mongoose.models.ChatKey || mongoose.model<IChatKey>('ChatKey', ChatKeySchema);
