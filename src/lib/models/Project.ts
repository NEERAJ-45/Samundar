import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'MAINTAINING' | 'COMPLETED';
  progress: number;
  userEmail: string;
}

const ProjectSchema: Schema = new Schema({
  name:      { type: String, required: true },
  status:    { type: String, enum: ['PLANNED', 'IN_PROGRESS', 'MAINTAINING', 'COMPLETED'], default: 'PLANNED' },
  progress:  { type: Number, default: 0, min: 0, max: 100 },
  userEmail: { type: String, required: true, index: true },
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
