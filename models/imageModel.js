import { Schema, model } from 'mongoose'

const imageSchema = new Schema({
  filename: { type: String, required: true },
  urls3: { type: String, required: true },
  format: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now }
})

export default model('Image', imageSchema)
