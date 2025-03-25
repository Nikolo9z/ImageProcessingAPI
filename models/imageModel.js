import { Schema, model } from 'mongoose'

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
})

const imageSchema = new Schema({
  filename: { type: String, required: true },
  urls3: { type: String, required: true },
  format: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema]
})

export default model('Image', imageSchema)
