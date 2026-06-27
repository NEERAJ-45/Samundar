import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  email: string;
  name: string;
  role: string;
  password?: string;
  goals: string[];
  mongodbUrl?: string;
  createdAt: Date;
}

const ProfileSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, default: 'Software Engineer' },
  password: { type: String, required: true },
  goals: { type: [String], default: [] },
  mongodbUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
