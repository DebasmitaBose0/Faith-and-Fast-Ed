import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ProductModel from "../models/productModel.js";
import { deleteImage, uploadImage } from "../utils/cloudinary.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";

export const createProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      category,
      subcategory,
      coloroptions,
      size,
      sizeoptions,
      stock,
      price,
      discount,
      description,
    } = req.body;

    if (!name) {
      return errorResponse(res, "Please enter all required fields (name)", 400);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "Please upload at least one image.", 400);
    }

    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadImage(file);
        return {
          public_id: result.public_id,
          url: result.secure_url,
        };
      })
    );

    const product = new ProductModel({
      name,
      description,
      price,
      category,
      subcategory,
      coloroptions: coloroptions || req.body["coloroptions[]"],
      size: size || req.body["size[]"],
      sizeoptions: sizeoptions || req.body["sizeoptions[]"],
      stock: stock || 0,
      discount: discount || 0,
      images: uploadedImages,
    });

    const savedProduct = await product.save();

    return successResponse(res, savedProduct, "Product Created Successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

export const getProduct = catchAsyncErrors(async (req, res) => {
  try {
    let { page, limit, search } = req.query;

    // Clamp to a minimum of 1 so an invalid, zero, or negative page/limit can
    // never produce a negative skip ((page - 1) * limit). `|| 1` handles the
    // NaN case (e.g. ?page=abc); Math.max handles zero/negative. This mirrors
    // the guard already used in searchProduct.
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 1);

    const query = search ? { $text: { $search: search } } : {};

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category"),
      ProductModel.countDocuments(query),
    ]);

    return res.json({
      message: "Product data",
      error: false,
      success: true,
      totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const getProductDetails = catchAsyncErrors(async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findById(productId).populate("category");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Product details",
      data: product,
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

// Admin
export const updateProductDetails = catchAsyncErrors(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      coloroptions,
      size,
      sizeoptions,
      stock,
      discount,
      images,
    } = req.body;
    const { _id } = req.params;

    if (!_id || !mongoose.isValidObjectId(_id)) {
      return res.status(400).json({
        message: "Valid product _id is required",
        error: true,
        success: false,
      });
    }

    const existingProduct = await ProductModel.findById(_id);
    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    let newImages = existingProduct.images;

    if (images && images.length > 0) {
      if (existingProduct.images.length > 0) {
        await Promise.all(
          existingProduct.images.map((img) => deleteImage(img.public_id))
        );
      }

      newImages = await Promise.all(
        images.map(async (file) => {
          const result = await uploadImage(file);
          return { public_id: result.public_id, url: result.secure_url };
        })
      );
    }

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(category && { category }),
      ...(subcategory !== undefined && { subcategory }), // Allow empty string
      ...(coloroptions !== undefined && {
        coloroptions: Array.isArray(coloroptions)
          ? coloroptions
          : coloroptions
          ? [coloroptions]
          : [],
      }),
      ...(size !== undefined && {
        size: Array.isArray(size) ? size : size ? [size] : [],
      }),
      ...(sizeoptions !== undefined && {
        sizeoptions: Array.isArray(sizeoptions)
          ? sizeoptions
          : sizeoptions
          ? [sizeoptions]
          : [],
      }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(discount !== undefined && { discount: Number(discount) }),
      images: newImages,
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      _id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      message: "Product updated successfully",
      data: updatedProduct,
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

// Admin
export const deleteProduct = catchAsyncErrors(async (req, res) => {
  try {
    const { deleteId } = req.params;

    if (!deleteId) {
      return res.status(400).json({
        message: "provide deleteId ",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findByIdAndDelete(deleteId, {
      returnDocument: "before",
    });
    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
        error: true,
        success: false,
      });
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => deleteImage(img.public_id))
      );
    }

    return res.json({
      message: "Product deleted successfully.",
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

export const searchProduct = catchAsyncErrors(async (req, res) => {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;

    page = Math.max(1, parseInt(page));
    limit = Math.max(1, parseInt(limit));

    const skip = (page - 1) * limit;
    const query = search ? { $text: { $search: search } } : {};

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category"),
      ProductModel.countDocuments(query),
    ]);

    return res.json({
      message: "Product data fetched successfully.",
      error: false,
      success: true,
      data: data,
      totalCount: dataCount,
      totalPage: Math.ceil(dataCount / limit),
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const getProductByFilter = catchAsyncErrors(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      subcategory = "",
      color = "",
      coloroptions = "",
      size = "",
      sizeoptions = "",
      sortBy = "relevant",
      minPrice = 0,
      maxPrice = 20000,
    } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = { $in: category.split(",") };
    }

    if (subcategory) {
      query.subcategory = { $in: subcategory.split(",") };
    }

    if (color) {
      query.color = { $in: color.split(",") };
    }

    if (coloroptions) {
      query.coloroptions = { $in: coloroptions.split(",") };
    }

    if (size) {
      query.size = { $in: size.split(",") };
    }

    if (sizeoptions) {
      query.sizeoptions = { $in: sizeoptions.split(",") };
    }

    query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };

    let sortQuery = {};
    if (sortBy === "price-low-high") {
      sortQuery.price = 1;
    } else if (sortBy === "price-high-low") {
      sortQuery.price = -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const products = await ProductModel.find(query)
      .sort(sortQuery)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .exec();

    const count = await ProductModel.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

export const getSimilarProducts = catchAsyncErrors(async (req, res) => {
  try {
    const { category, subcategory, color, coloroptions, exclude } = req.query;

    let filter = { $or: [] };

    if (category) filter.$or.push({ category });
    if (subcategory) filter.$or.push({ subcategory });
    if (color) filter.$or.push({ color });
    if (coloroptions)
      filter.$or.push({ coloroptions: { $in: coloroptions.split(",") } });

    if (filter.$or.length === 0) filter = {};

    // Never recommend the product the user is already viewing.
    if (exclude) filter._id = { $ne: exclude };

    const similarProducts = await ProductModel.find(filter).limit(10);

    res.status(200).json({
      success: true,
      count: similarProducts.length,
      similarProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const getProductReviews = catchAsyncErrors(async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({ reviews: product.reviews });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const postProductReview = catchAsyncErrors(async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, name } = req.body;

    // Validate the rating is a number within the allowed 1–5 range. Previously
    // the value was pushed straight in: an out-of-range value relied on the
    // schema's min/max to throw (surfacing as a generic 500), and a non-numeric
    // value cast to NaN — both corrupting the recomputed average.
    const numericRating = Number(rating);
    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // One review per user. Previously a user could post unlimited reviews,
    // letting a single person dominate the product's average rating. The UI
    // already lets a user delete their review, so revising means delete + re-add.
    const alreadyReviewed = product.reviews.some(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product",
        error: true,
        success: false,
      });
    }

    const review = {
      user: req.user._id,
      name,
      rating: numericRating,
      comment,
      createdAt: new Date().toISOString(),
    };

    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;

    product.ratings =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review posted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});

export const deleteProductReview = catchAsyncErrors(async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await ProductModel.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const reviewIndex = product.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    product.reviews.splice(reviewIndex, 1);
    product.numOfReviews = product.reviews.length;

    if (product.reviews.length > 0) {
      product.ratings =
        product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length;
    } else {
      product.ratings = 0;
    }

    await product.save();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
});
