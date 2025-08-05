// models/Item.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItem extends Document {
  name: string;
  // add other fields here
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
}, { timestamps: true });

const Item: Model<IItem> =
  mongoose.models.Item ||
  mongoose.model<IItem>('Item', ItemSchema);

export default Item;
