import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatMessage extends Document {
  from: string;
  to: string;
  nonce: string;
  ciphertext: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  from: { type: String, required: true, index: true },
  to: { type: String, required: true, index: true },
  nonce: { type: String, required: true },
  ciphertext: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

ChatMessageSchema.index({ to: 1, createdAt: 1 });

export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
