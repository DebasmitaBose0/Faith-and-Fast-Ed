import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema(
  {
    backupName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    triggeredBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    collectionsBackedUp: [
      {
        type: String,
      },
    ],
    fileSizeKb: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BackupModel = mongoose.model('Backup', backupSchema);
export default BackupModel;
