import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import CategoryModel from '../models/categoryModel.js';
import ProductModel from '../models/productModel.js';
import { deleteImage, uploadImage } from '../utils/cloudinary.js';

export const AddCategory = catchAsyncErrors(async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required',
        error: true,
        success: false,
      });
    }

    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        message: 'Category already exists',
        error: true,
        success: false,
      });
    }

    if (!image) {
      return res.status(400).json({
        message: 'Image is required',
        error: true,
        success: false,
      });
    }

    const uploadedImage = await uploadImage(image);

    const newCategory = new CategoryModel({
      name,
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
    });

    const saveCategory = await newCategory.save();

    if (!saveCategory) {
      return res.status(500).json({
        message: 'Not Created',
        error: true,
        success: false,
      });
    }

    return res.status(201).json({
      message: 'Category added successfully',
      data: saveCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
});

export const getCategory = catchAsyncErrors(async (req, res) => {
  try {
    const data = await CategoryModel.find().sort({ createdAt: -1 });

    return res.json({
      data: data,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const updateCategory = catchAsyncErrors(async (req, res) => {
  try {
    const { _id, name, image } = req.body;

    const existingCategory = await CategoryModel.findById(_id);
    if (!existingCategory) {
      return res.status(404).json({
        message: 'Category not found',
        error: true,
        success: false,
      });
    }

    let newImage = existingCategory.image;

    if (image) {
      await deleteImage(existingCategory.image.public_id);
      const uploadResult = await uploadImage(image);
      newImage = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const update = await CategoryModel.updateOne(
      { _id: _id },
      {
        name,
        image: newImage,
      }
    );
    return res.json({
      message: 'Category updated successfully',
      success: true,
      error: false,
      data: update,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const deleteCategory = catchAsyncErrors(async (req, res) => {
  try {
    const { _id } = req.body;

    const category = await CategoryModel.findById(_id);
    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        error: true,
        success: false,
      });
    }

    const checkProduct = await ProductModel.find({
      category: { $in: [_id] },
    }).countDocuments();
    if (checkProduct > 0) {
      return res.status(400).json({
        message: 'Category is in use and cannot be deleted',
        error: true,
        success: false,
      });
    }

    if (category.image?.public_id) {
      await deleteImage(category.image.public_id);
    }

    const deleteCategory = await CategoryModel.deleteOne({ _id: _id });

    return res.json({
      message: 'Category deleted successfully',
      data: deleteCategory,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
});
