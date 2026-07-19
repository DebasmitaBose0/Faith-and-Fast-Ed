import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductModel from "../models/productModel.js";

dotenv.config();

const sampleProducts = [
  // Men's Products
  {
    name: "Classic Denim Slim Fit Shirt",
    description: "Premium quality denim shirt, perfect for casual and semi-formal wear. Lightweight, breathable cotton blend with custom metal buttons.",
    price: 1599,
    ratings: 4.5,
    category: "MEN",
    subcategory: "Shirts",
    coloroptions: ["Blue", "Black", "Grey"],
    size: ["Standard Sizes"],
    sizeoptions: ["S", "M", "L", "XL"],
    stock: 25,
    discount: 10,
    images: [{ public_id: "denim_shirt_1", url: "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=500" }],
    numOfReviews: 12,
    reviews: Array.from({ length: 12 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4 + (i % 2 === 0 ? 1 : 0),
      comment: "Great fitting shirt, color options are excellent.",
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    }))
  },
  {
    name: "Relaxed Fit Chino Pants",
    description: "Extremely comfortable stretch chino trousers made of organic cotton. Available in neutral tones.",
    price: 2499,
    ratings: 3.8,
    category: "MEN",
    subcategory: "Pants",
    coloroptions: ["Beige", "Olive", "Brown"],
    size: ["Standard Sizes"],
    sizeoptions: ["M", "L", "XL"],
    stock: 15,
    discount: 15,
    images: [{ public_id: "chinos_1", url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500" }],
    numOfReviews: 6,
    reviews: Array.from({ length: 6 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 3 + (i % 3),
      comment: "Nice material but sizing runs slightly large.",
      createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
    }))
  },
  {
    name: "Leather Messenger Bag",
    description: "Handcrafted full-grain leather messenger bag with multiple compartments. Fits up to a 15-inch laptop.",
    price: 4999,
    ratings: 4.8,
    category: "MEN",
    subcategory: "Accessories",
    coloroptions: ["Brown", "Black"],
    size: ["Standard Sizes"],
    sizeoptions: ["One Size"],
    stock: 5,
    discount: 20,
    images: [{ public_id: "leather_bag_1", url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500" }],
    numOfReviews: 18,
    reviews: Array.from({ length: 18 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: i % 5 === 0 ? 4 : 5,
      comment: "Top tier leather quality.",
      createdAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000)
    }))
  },
  // Women's Products
  {
    name: "Summer Floral Maxi Dress",
    description: "Flowy floral printed maxi dress with side slit. Ideal for beach parties, vacations, and summer outings.",
    price: 1899,
    ratings: 4.6,
    category: "WOMEN",
    subcategory: "Dresses",
    coloroptions: ["Floral (Pink, Green)", "White", "Yellow"],
    size: ["Standard Sizes", "Petite Sizes"],
    sizeoptions: ["XS", "S", "M", "L"],
    stock: 30,
    discount: 25,
    images: [{ public_id: "floral_dress_1", url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500" }],
    numOfReviews: 15,
    reviews: Array.from({ length: 15 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4 + (i % 2),
      comment: "Very beautiful dress.",
      createdAt: new Date(Date.now() - i * 36 * 60 * 60 * 1000)
    }))
  },
  {
    name: "Ribbed Knit Crop Top",
    description: "Stylish slim-fit ribbed crop top. Highly stretchable fabric that hugs your curves perfectly.",
    price: 799,
    ratings: 4.2,
    category: "WOMEN",
    subcategory: "Tops",
    coloroptions: ["White", "Black", "Pink", "Cream"],
    size: ["Standard Sizes"],
    sizeoptions: ["S", "M", "L"],
    stock: 50,
    discount: 5,
    images: [{ public_id: "crop_top_1", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" }],
    numOfReviews: 24,
    reviews: Array.from({ length: 24 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: i % 4 === 0 ? 3 : 4,
      comment: "Great color options.",
      createdAt: new Date(Date.now() - i * 18 * 60 * 60 * 1000)
    }))
  },
  {
    name: "High-Waisted Pleated Skirt",
    description: "A-line high-waisted pleated tennis skirt. Lightweight and comes with built-in safety shorts.",
    price: 1299,
    ratings: 4.0,
    category: "WOMEN",
    subcategory: "Skirts",
    coloroptions: ["Black", "White", "Blue"],
    size: ["Standard Sizes"],
    sizeoptions: ["XS", "S", "M"],
    stock: 0, // OUT OF STOCK
    discount: 0,
    images: [{ public_id: "pleated_skirt_1", url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500" }],
    numOfReviews: 8,
    reviews: Array.from({ length: 8 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4,
      comment: "Quality is okay, but fit is fine.",
      createdAt: new Date(Date.now() - i * 48 * 60 * 60 * 1000)
    }))
  },
  // Kids
  {
    name: "Cotton Dungaree Set",
    description: "Super soft 100% cotton dungarees for kids. Includes a striped t-shirt and adjustable denim dungaree shorts.",
    price: 999,
    ratings: 4.4,
    category: "KIDS",
    subcategory: "KIDS",
    coloroptions: ["Stripes (Blue, White)", "Orange"],
    size: ["Kids Sizes"],
    sizeoptions: ["12-18 months", "18-24 months", "2-4 years"],
    stock: 12,
    discount: 10,
    images: [{ public_id: "kids_dungaree_1", url: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500" }],
    numOfReviews: 4,
    reviews: Array.from({ length: 4 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4 + (i % 2 === 0 ? 1 : 0),
      comment: "Super cute dungarees.",
      createdAt: new Date()
    }))
  },
  // Clothing
  {
    name: "Classic Crewneck T-Shirt",
    description: "Heavyweight 100% organic cotton crewneck tee. Pre-shrunk fabric with double-stitched sleeves and hem.",
    price: 499,
    ratings: 4.7,
    category: "CLOTHING",
    subcategory: "T-Shirts & Polos",
    coloroptions: ["White", "Black", "Grey", "Blue", "Olive"],
    size: ["Standard Sizes"],
    sizeoptions: ["S", "M", "L", "XL", "XXL"],
    stock: 100,
    discount: 30,
    images: [{ public_id: "crew_tee_1", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" }],
    numOfReviews: 42,
    reviews: Array.from({ length: 42 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4 + (i % 3 === 0 ? 1 : 0),
      comment: "Very soft cotton shirt.",
      createdAt: new Date()
    }))
  },
  {
    name: "Oversized Fleece Hoodie",
    description: "Ultra-cozy brushed fleece oversized hoodie. Keeps you warm in premium comfort and style.",
    price: 2199,
    ratings: 4.9,
    category: "CLOTHING",
    subcategory: "Hoodies & Sweatshirts",
    coloroptions: ["Black", "Grey", "Beige", "Purple"],
    size: ["Standard Sizes", "Plus Sizes"],
    sizeoptions: ["M", "L", "XL", "2X", "3X"],
    stock: 18,
    discount: 15,
    images: [{ public_id: "fleece_hoodie_1", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500" }],
    numOfReviews: 55,
    reviews: Array.from({ length: 55 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 5,
      comment: "Warm and cozy!",
      createdAt: new Date()
    }))
  },
  // Footwear
  {
    name: "Running Air Cushion Sneakers",
    description: "Breathable mesh running sneakers with advanced air-bubble cushion. Designed for ultimate performance and comfort.",
    price: 3499,
    ratings: 4.3,
    category: "FOOTWEAR",
    subcategory: "Sneakers",
    coloroptions: ["Black", "White", "Neon Orange"],
    size: ["Footwear Sizes"],
    sizeoptions: ["US 8", "US 9", "US 10", "US 11"],
    stock: 14,
    discount: 20,
    images: [{ public_id: "sneakers_1", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" }],
    numOfReviews: 10,
    reviews: Array.from({ length: 10 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4,
      comment: "Excellent walking shoe.",
      createdAt: new Date()
    }))
  },
  {
    name: "Premium Leather Oxfords",
    description: "Sophisticated formal oxford dress shoes handcrafted from genuine Italian calfskin leather.",
    price: 5999,
    ratings: 4.5,
    category: "FOOTWEAR",
    subcategory: "Formal Shoes",
    coloroptions: ["Brown", "Black"],
    size: ["Footwear Sizes"],
    sizeoptions: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    stock: 8,
    discount: 10,
    images: [{ public_id: "oxfords_1", url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500" }],
    numOfReviews: 15,
    reviews: Array.from({ length: 15 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4 + (i % 2 === 0 ? 1 : 0),
      comment: "Elegant style and very good leather.",
      createdAt: new Date()
    }))
  },
  // Seasonal
  {
    name: "Windproof Down Winter Jacket",
    description: "Heavy winter parka packed with sustainable duck down. Water-resistant, windproof, and rated down to -15°C.",
    price: 7999,
    ratings: 4.7,
    category: "SEASONAL WEAR",
    subcategory: "Winter Wear (Thermals, Woolen Caps, Gloves, etc.)",
    coloroptions: ["Black", "Olive", "Red"],
    size: ["Standard Sizes", "Tall & Petite Sizes"],
    sizeoptions: ["S", "M", "L", "XL", "Tall L"],
    stock: 7,
    discount: 35,
    images: [{ public_id: "winter_jacket_1", url: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500" }],
    numOfReviews: 20,
    reviews: Array.from({ length: 20 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4 + (i % 2),
      comment: "Very warm and solid build.",
      createdAt: new Date()
    }))
  },
  // Special
  {
    name: "Premium Office Blazer",
    description: "Slim-fit structured business blazer. Crafted from high-grade wool blend for a crisp, polished professional look.",
    price: 4599,
    ratings: 4.1,
    category: "SPECIAL CATEGORIES",
    subcategory: "Office/Formal Wear",
    coloroptions: ["Black", "Grey", "Blue"],
    size: ["Standard Sizes"],
    sizeoptions: ["M", "L", "XL"],
    stock: 22,
    discount: 12,
    images: [{ public_id: "office_blazer_1", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500" }],
    numOfReviews: 14,
    reviews: Array.from({ length: 14 }, (_, i) => ({
      user: new mongoose.Types.ObjectId(),
      name: `User ${i}`,
      rating: 4,
      comment: "Fit is perfect.",
      createdAt: new Date()
    }))
  }
];

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL;
    if (!mongoUri) {
      console.error("MONGODB_URL is not defined.");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Clear existing products
    await ProductModel.deleteMany({});
    console.log("Deleted existing products.");

    // Seed products
    const createdProducts = await ProductModel.insertMany(sampleProducts);
    console.log(`Seeded ${createdProducts.length} sample products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
