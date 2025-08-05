import mongoose, { Document, Model } from "mongoose";
import { IAuthor } from "../models/author"; // adjust the path as needed

export interface IStartup extends Document {
  title: string;
  slug: string;
  author: mongoose.Types.ObjectId | IAuthor;
  views: number;
  description: string;
  category: string;
  image: string;
  pitch: string;
  createdAt: Date;
}

const StartupSchema = new mongoose.Schema<IStartup>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,   // adjust as needed
    },
    category: {
      type: String,
      required: true,   // or ref: 'Category' if you have a Category model
    },
    image: {
      type: String,     // URL to your cover image
      required: true,
    },
    pitch: {
      type: String,     // e.g. "Senior level" or your elevator-pitch tag
      required: true,
      maxlength: 100,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      immutable: true,
    },
  },
  {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

StartupSchema.index({ author: 1, createdAt: -1 ,_id: -1});

// avoid recompilation in watch mode
export default (mongoose.models.Startup as Model<IStartup>) ||
  mongoose.model<IStartup>("Startup", StartupSchema);
