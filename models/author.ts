// /models/Author.ts
import mongoose, { Document, Model } from "mongoose";

export interface IAuthor extends Document {
  githubId: string;
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  bio?: string;
  createdAt: Date;
}

const AuthorSchema = new mongoose.Schema<IAuthor>({
  githubId:  { type: String, required: true, unique: true },
  name:      { type: String },
  username:  { type: String },
  email:     { type: String },
  image:     { type: String },
  bio:       { type: String },
  createdAt: { type: Date,   default: () => new Date() },
});

// Prevent model recompilation in dev
export default (mongoose.models.Author as Model<IAuthor>) ||
  mongoose.model<IAuthor>("Author", AuthorSchema);
