import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  email: string;
  name: string;
  role: string;
  password: string;    // bcrypt hash
  resetPin?: string;   // bcrypt hash of PIN for password reset
  goals: string[];
  mongodbUrl?: string;
  activePillar?: string;
  activeCategory?: string;
  nextLearningUnit?: string;
  nextLearningDuration?: string;
  createdAt: Date;
}

const ProfileSchema: Schema = new Schema({
  email:          { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  role:           { type: String, default: 'Software Engineer' },
  password:       { type: String, required: true },
  resetPin:       { type: String },
  goals:          { type: [String], default: [] },
  mongodbUrl:     { type: String, default: '' },
  activePillar:       { type: String, default: 'Data Structures & Algorithms' },
  activeCategory:     { type: String, default: 'Trees' },
  nextLearningUnit:   { type: String, default: 'AVL Tree Rotations' },
  nextLearningDuration: { type: String, default: '45 min' },
  createdAt:          { type: Date, default: Date.now },
});

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
