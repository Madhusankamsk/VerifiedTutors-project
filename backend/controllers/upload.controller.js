import { cloudinary } from '../config/cloudinary.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Upload profile photo
// @route   POST /api/upload/profile-photo
// @access  Private
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  res.status(200).json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename
    }
  });
});

// @desc    Upload verification documents
// @route   POST /api/upload/verification-docs
// @access  Private
export const uploadVerificationDocs = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const results = req.files.map(file => ({
    url: file.path,
    publicId: file.filename
  }));

  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Delete uploaded image
// @route   DELETE /api/upload/:publicId
// @access  Private
export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  await cloudinary.uploader.destroy(publicId);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
}); 