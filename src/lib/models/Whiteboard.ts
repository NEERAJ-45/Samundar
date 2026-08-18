import mongoose, { Schema, Document } from 'mongoose';

export interface IWhiteboard extends Document {
  boardId: string;
  name: string;
  scene: string;
  userEmail?: string;
  updatedAt?: Date;
}

const WhiteboardSchema: Schema = new Schema(
  {
    boardId: { type: String, required: true },
    name: { type: String, required: true, default: 'Untitled' },
    scene: { type: String, required: true, default: '' },
    userEmail: { type: String, required: true, default: 'NEERAJ' },
  },
  { timestamps: true }
);

WhiteboardSchema.index({ boardId: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.Whiteboard ||
  mongoose.model<IWhiteboard>('Whiteboard', WhiteboardSchema);