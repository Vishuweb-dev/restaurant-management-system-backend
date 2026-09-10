const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");
const MenuItem = require("../models/MenuItem");
const { sendSuccess, sendError } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

const ALLOWED_CATEGORIES = ["Starter", "Main Course", "Dessert", "Beverage"];

// Helper: upload a buffer to Cloudinary using an upload_stream
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "tastybites/menu-items" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

// GET /api/menu-items
// Public. Supports ?search=name and ?category=Main Course (server-side filtering).
const getMenuItems = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (category && ALLOWED_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  const items = await MenuItem.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, 200, "Menu items fetched successfully.", { items });
});

// GET /api/menu-items/:id
// Public.
const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return sendError(res, 404, "Menu item not found.");
  }
  return sendSuccess(res, 200, "Menu item fetched successfully.", { item });
});

// POST /api/menu-items
// Admin only. Expects multipart/form-data with an "image" file field.
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, category, price, availability } = req.body;

  if (!name || !description || !category || price === undefined) {
    return sendError(res, 400, "Name, description, category and price are required.");
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return sendError(res, 400, `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }

  if (Number(price) < 0) {
    return sendError(res, 400, "Price must be a positive number.");
  }

  if (!req.file) {
    return sendError(res, 400, "An item image is required.");
  }

  const result = await uploadToCloudinary(req.file.buffer);

  const item = await MenuItem.create({
    name,
    description,
    category,
    price: Number(price),
    availability: availability === undefined ? true : availability === "true" || availability === true,
    image: result.secure_url,
    imagePublicId: result.public_id,
  });

  return sendSuccess(res, 201, "Menu item created successfully.", { item });
});

// PUT /api/menu-items/:id
// Admin only. Image is optional — if not provided, the existing image is kept.
const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return sendError(res, 404, "Menu item not found.");
  }

  const { name, description, category, price, availability } = req.body;

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return sendError(res, 400, `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }

  if (price !== undefined && Number(price) < 0) {
    return sendError(res, 400, "Price must be a positive number.");
  }

  if (req.file) {
    // Replace the old Cloudinary image so we don't leak storage
    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
    }
    const result = await uploadToCloudinary(req.file.buffer);
    item.image = result.secure_url;
    item.imagePublicId = result.public_id;
  }

  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (category !== undefined) item.category = category;
  if (price !== undefined) item.price = Number(price);
  if (availability !== undefined) item.availability = availability === "true" || availability === true;

  await item.save();

  return sendSuccess(res, 200, "Menu item updated successfully.", { item });
});

// DELETE /api/menu-items/:id
// Admin only.
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return sendError(res, 404, "Menu item not found.");
  }

  if (item.imagePublicId) {
    await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
  }

  await item.deleteOne();

  return sendSuccess(res, 200, "Menu item deleted successfully.", {});
});

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
