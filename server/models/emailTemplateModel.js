import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('emailTemplate', emailTemplateSchema);