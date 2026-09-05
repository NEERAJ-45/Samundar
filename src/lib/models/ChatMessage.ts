import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatMessage extends Document {
  from: string;
  text: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  from: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
