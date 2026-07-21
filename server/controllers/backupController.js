import fs from 'fs';
import path from 'path';
import BackupModel from '../models/backupModel.js';
import ProductModel from '../models/productModel.js';
import UserModel from '../models/userModel.js';
import OrderModel from '../models/orderModel.js';

export const triggerBackup = async (req, res) => {
  try {
    const products = await ProductModel.find({});
    const users = await UserModel.find({});
    const orders = await OrderModel.find({});

    const backupData = {
      timestamp: new Date().toISOString(),
      products,
      users,
      orders,
    };

    const backupDir = path.resolve('./backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupName = `backup_${Date.now()}.json`;
    const filePath = path.join(backupDir, backupName);

    const jsonStr = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(filePath, jsonStr, 'utf-8');

    const fileSizeKb = Math.round(jsonStr.length / 1024);

    const backupRecord = new BackupModel({
      backupName,
      filePath,
      triggeredBy: req.userId || req.user?._id,
      status: 'SUCCESS',
      collectionsBackedUp: ['Product', 'User', 'Order'],
      fileSizeKb,
    });

    await backupRecord.save();

    res.status(201).json({
      success: true,
      message: 'Database backup created successfully.',
      data: backupRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create database backup.',
    });
  }
};

export const getBackupsList = async (req, res) => {
  try {
    const backups = await BackupModel.find({})
      .populate('triggeredBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      backups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch backups list.',
    });
  }
};
