import EmailTemplate from '../models/emailTemplateModel.js';

export const saveTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const template = await EmailTemplate.findOneAndUpdate({ name }, { subject, body }, { upsert: true, new: true });
    return res.json({ success: true, data: template });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};